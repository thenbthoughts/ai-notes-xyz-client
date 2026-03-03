import { useMicVAD } from "@ricky0123/vad-react";
import { useState, useMemo } from "react";

const TestVoiceActivityDetection = () => {
    const [status, setStatus] = useState<"idle" | "listening" | "speaking">("idle");
    const [lastSpeechSize, setLastSpeechSize] = useState<number>(0);

    const vad = useMicVAD({
        onSpeechStart: () => {
            console.log("User started speaking");
            setStatus("speaking");
        },
        onSpeechEnd: (audio) => {
            console.log("User stopped speaking");
            setStatus("listening");
            setLastSpeechSize(audio.length);
            // In a real app, you'd send 'audio' to STT
        },
        redemptionMs: 1500,
        minSpeechMs: 100,
        positiveSpeechThreshold: 0.5,
        baseAssetPath: "/vad/",
        onnxWASMBasePath: "/vad/",
    });

    const displayStatus = useMemo(() => {
        if (!vad.listening) return "Paused";
        if (status === "speaking") return "User Speaking...";
        return "Listening...";
    }, [vad.listening, status]);

    return (
        <div className="vad-container">
            <div className={`orb ${status === 'speaking' ? 'pulse' : ''} ${!vad.listening ? 'dimmed' : ''}`}>
                <div className="orb-inner"></div>
            </div>

            <div className="status-badge">
                <span className={`dot ${vad.listening ? 'active' : ''}`}></span>
                {displayStatus}
            </div>

            <div className="controls">
                <button
                    className={`btn-toggle ${vad.listening ? 'listening' : ''}`}
                    onClick={vad.toggle}
                >
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
                    max-width: 400px;
                    margin: 0 auto;
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
                    font-size: 0.8rem;
                    color: #94a3b8;
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