import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";

type PipelineState = "idle" | "processing" | "tts";

const AUTO_SEND_OPTIONS = [2, 5, 10, 15, 30, 60, 120, 300];
const DEFAULT_DELAY_SECONDS = 2;

const TestVoiceActivityDetection = () => {
    const [status, setStatus] = useState<"idle" | "listening" | "speaking">("idle");
    const [lastSpeechSize, setLastSpeechSize] = useState(0);
    const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
    const [draftText, setDraftText] = useState("");
    const [delaySeconds, setDelaySeconds] = useState(DEFAULT_DELAY_SECONDS);
    const [countdown, setCountdown] = useState(0);
    const [lastSentText, setLastSentText] = useState("");

    const draftTextRef = useRef("");
    const timerRef = useRef<number | null>(null);
    const pipelineStateRef = useRef<PipelineState>("idle");
    const sendLockRef = useRef(false);
    const segmentRef = useRef(0);

    useEffect(() => {
        draftTextRef.current = draftText;
    }, [draftText]);

    useEffect(() => {
        pipelineStateRef.current = pipelineState;
    }, [pipelineState]);

    const delay = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);

    const clearCountdown = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setCountdown(0);
    }, []);

    const appendToDraft = useCallback((segmentText: string) => {
        setDraftText((prev) => {
            const next = prev ? `${prev} ${segmentText}` : segmentText;
            draftTextRef.current = next;
            return next;
        });
    }, []);

    const processPendingDraft = useCallback(async () => {
        const currentText = draftTextRef.current.trim();
        if (!currentText) return;
        if (sendLockRef.current) return;
        if (pipelineStateRef.current !== "idle") return;

        sendLockRef.current = true;
        setLastSentText(currentText);
        setDraftText("");
        draftTextRef.current = "";
        clearCountdown();

        try {
            setPipelineState("processing");
            await delay(800);
            setPipelineState("tts");
            await delay(600);
            setPipelineState("idle");
        } finally {
            sendLockRef.current = false;
            if (draftTextRef.current.trim()) {
                processPendingDraft();
            }
        }
    }, [clearCountdown, delay]);

    const sendNow = useCallback(() => {
        clearCountdown();
        processPendingDraft();
    }, [clearCountdown, processPendingDraft]);

    const onTimerTick = useCallback(
        () =>
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearCountdown();
                    processPendingDraft();
                    return 0;
                }
                return prev - 1;
            }),
        [clearCountdown, processPendingDraft]
    );

    const startCountdown = useCallback(() => {
        clearCountdown();
        setCountdown(delaySeconds);
        timerRef.current = window.setInterval(onTimerTick, 1000);
    }, [clearCountdown, delaySeconds, onTimerTick]);

    const selectDelay = useCallback((seconds: number) => {
        setDelaySeconds(seconds);
    }, []);

    useEffect(() => clearCountdown, [clearCountdown]);

    const transcribeSegment = useCallback(
        async (audio: Float32Array) => {
            const localIndex = ++segmentRef.current;
            const estimatedSec = Math.max(0.1, audio.length / 16000).toFixed(1);
            await delay(120);
            return `segment-${localIndex} (${estimatedSec}s)`;
        },
        [delay]
    );

    const onSpeechStart = useCallback(() => {
        clearCountdown();
        setStatus("speaking");
    }, [clearCountdown]);

    const onSpeechEnd = useCallback(async (audio: Float32Array) => {
        const textChunk = await transcribeSegment(audio);
        setStatus("listening");
        setLastSpeechSize(audio.length);
        appendToDraft(textChunk);
        startCountdown();
    }, [appendToDraft, startCountdown, transcribeSegment]);

    const vad = useMicVAD({
        onSpeechStart,
        onSpeechEnd,
        redemptionMs: 1500,
        minSpeechMs: 100,
        positiveSpeechThreshold: 0.5,
        baseAssetPath: "/vad/",
        onnxWASMBasePath: "/vad/",
    });

    useEffect(() => {
        if (!vad.listening) {
            setStatus("idle");
            clearCountdown();
        }
    }, [vad.listening, clearCountdown]);

    const pipelineBusy = pipelineState !== "idle";

    const displayStatus = useMemo(() => {
        if (!vad.listening) return "Paused";
        if (pipelineState === "processing") return "LLM Processing...";
        if (pipelineState === "tts") return "TTS Speaking...";
        if (status === "speaking") return "User Speaking...";
        return "Listening...";
    }, [vad.listening, pipelineState, status]);

    return (
        <div className="vad-container">
            <div className={`orb ${status === "speaking" ? "pulse" : ""} ${!vad.listening ? "dimmed" : ""}`}>
                <div className="orb-inner" />
            </div>

            <div className="status-badge">
                <span className={`dot ${vad.listening ? "active" : ""}`} />
                {displayStatus}
            </div>

            <div className="pipeline">Pipeline: {pipelineState.toUpperCase()}</div>

            <div className="speech-box">
                <label>Buffered text (appended with each segment)</label>
                <p className="speech-box-text">{draftText || "No pending speech yet."}</p>
            </div>

            <div className="send-strip">
                <div className="duration-strip">
                    {AUTO_SEND_OPTIONS.map((seconds) => (
                        <button
                            key={seconds}
                            className={`btn-small ${delaySeconds === seconds ? "selected" : ""}`}
                            onClick={() => selectDelay(seconds)}
                        >
                            {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                        </button>
                    ))}
                </div>
                <span className="countdown-config">Auto-send in {delaySeconds}s</span>
                <button className="btn-small" onClick={sendNow} disabled={!draftText.trim()}>
                    Send now
                </button>
            </div>

            {countdown > 0 && <div className="countdown">{`Send in ${countdown}s`}</div>}

            {lastSentText && <div className="stats fade-in">Last sent: {lastSentText}</div>}

            {pipelineBusy && <div className="stats warning">Pipeline busy. New speech keeps appending and will auto resend.</div>}

            <div className="controls">
                <button className={`btn-toggle ${vad.listening ? "listening" : ""}`} onClick={vad.toggle}>
                    {vad.listening ? "Stop Listening" : "Start Listening"}
                </button>
            </div>

            {lastSpeechSize > 0 && (
                <div className="stats fade-in">
                    Last segment: {(lastSpeechSize / 16000).toFixed(2)}s of audio
                </div>
            )}

            <style>{`
                .vad-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    padding: 3rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 560px;
                    width: min(92vw, 560px);
                    margin: 0 auto;
                    text-align: center;
                }

                .orb {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, #4f46e5, #ec4899, #4f46e5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .orb-inner {
                    width: 80%;
                    height: 80%;
                    background: #0f172a;
                    border-radius: 50%;
                }

                .orb.pulse {
                    transform: scale(1.1);
                    box-shadow: 0 0 40px rgba(236, 72, 153, 0.5);
                    animation: rotate 2s linear infinite;
                }

                .orb.dimmed {
                    filter: grayscale(1) opacity(0.5);
                    transform: scale(0.9);
                }

                @keyframes rotate {
                    from { transform: scale(1.1) rotate(0deg); }
                    to { transform: scale(1.1) rotate(360deg); }
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #e2e8f0;
                }

                .pipeline {
                    color: #93c5fd;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #64748b;
                }

                .dot.active {
                    background: #10b981;
                    box-shadow: 0 0 10px #10b981;
                    animation: blink 1.5s infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .speech-box {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 14px;
                    border: 1px solid rgba(148, 163, 184, 0.25);
                    padding: 10px 12px;
                    color: #e2e8f0;
                }

                .speech-box label {
                    display: block;
                    margin-bottom: 8px;
                    color: #cbd5e1;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    text-align: left;
                }

                .speech-box-text {
                    margin: 0;
                    min-height: 48px;
                    text-align: left;
                    white-space: pre-wrap;
                    line-height: 1.45;
                    color: #f1f5f9;
                }

                .send-strip {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .duration-strip {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 8px;
                    width: 100%;
                }

                .countdown {
                    width: 100%;
                    color: #67e8f9;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .countdown-config {
                    color: #cbd5e1;
                    font-size: 0.85rem;
                }

                .btn-small {
                    min-width: 84px;
                    border: 1px solid rgba(148, 163, 184, 0.4);
                    border-radius: 12px;
                    background: rgba(71, 85, 105, 0.15);
                    color: white;
                    padding: 8px 10px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-small:hover {
                    background: rgba(99, 102, 241, 0.25);
                }

                .btn-small.selected {
                    border-color: rgba(103, 232, 249, 0.8);
                    background: rgba(14, 116, 144, 0.3);
                    color: #cffafe;
                }

                .btn-small:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-toggle {
                    padding: 12px 24px;
                    border-radius: 12px;
                    border: none;
                    background: #4f46e5;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-toggle:hover {
                    background: #4338ca;
                    transform: translateY(-1px);
                }

                .btn-toggle.listening {
                    background: #dc2626;
                }

                .stats {
                    width: 100%;
                    font-size: 0.8rem;
                    color: #94a3b8;
                }

                .stats.warning {
                    color: #f59e0b;
                }

                .fade-in {
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TestVoiceActivityDetection;
