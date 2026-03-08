import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { LucideVolume2, LucideVolumeX } from "lucide-react";
import axiosCustom from "../../../../config/axiosCustom";
import { toast } from "react-hot-toast";

export type TtsStatus = "idle" | "tts-speaking";
export type TtsGenerating = "idle" | "tts-generating";

interface TtsControlsProps {
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    ttsStatus: TtsStatus;
    setTtsStatus: (status: TtsStatus) => void;
    ttsGenerating: TtsGenerating;
    setTtsGenerating: (status: TtsGenerating) => void;
    onStopTts?: () => void;
}

export interface TtsControlsRef {
    playTts: (text: string) => Promise<void>;
    stopTts: () => void;
    resumeAudioCtx: () => Promise<void>;
}

const TtsControls = forwardRef<TtsControlsRef, TtsControlsProps>(({
    isMuted,
    setIsMuted,
    ttsStatus,
    setTtsStatus,
    ttsGenerating,
    setTtsGenerating,
    onStopTts
}, ref) => {
    // Audio refs for TTS
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioFallbackRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup TTS on unmount
    useEffect(() => {
        return () => {
            stopTts();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close();
            }
        };
    }, []);

    // ── AudioContext (created/resumed in mic click = user gesture) ────────────

    const getAudioCtx = (): AudioContext => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new AudioContext();
        }
        return audioCtxRef.current;
    };

    const resumeAudioCtx = async () => {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();
    };

    // ── TTS via AudioContext (with Audio element fallback) ───────────────────

    const stopTts = () => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch { }
            audioSourceRef.current = null;
        }
        if (audioFallbackRef.current) {
            audioFallbackRef.current.pause();
            audioFallbackRef.current = null;
        }
        if (ttsStatus === 'tts-speaking') {
            setTtsStatus('idle');
        }
        if (ttsGenerating === 'tts-generating') {
            setTtsGenerating('idle');
        }
        onStopTts?.();
    };

    const playTts = async (text: string) => {
        if (isMuted) return;

        try {
            const safeText = text.slice(0, 1000);

            // Set generating state when starting API request
            setTtsGenerating('tts-generating');

            // Fetch audio via axiosCustom (handles auth cookies)
            let res;
            try {
                res = await axiosCustom.post(
                    '/api/chat-llm/tts/speak',
                    { text: safeText },
                    { responseType: 'arraybuffer' }
                );
            } catch (apiErr: any) {
                // Decode the arraybuffer error body into a readable message
                const errBuf = apiErr?.response?.data;
                let errMsg = apiErr?.message || 'TTS request failed';
                if (errBuf instanceof ArrayBuffer && errBuf.byteLength > 0) {
                    try {
                        const decoded = new TextDecoder().decode(errBuf);
                        errMsg = JSON.parse(decoded)?.message || decoded;
                    } catch { }
                }
                toast.error(`TTS: ${errMsg}`, { duration: 5000 });
                setTtsGenerating('idle');
                return;
            }

            const arrayBuffer: ArrayBuffer = res.data;
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                toast.error('TTS returned empty audio');
                setTtsGenerating('idle');
                return;
            }

            // Reset generating state and set speaking state
            setTtsGenerating('idle');
            setTtsStatus('tts-speaking');

            // ── Try AudioContext first (no autoplay restriction) ──
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') await ctx.resume();

            try {
                const decodedBuf = await ctx.decodeAudioData(arrayBuffer.slice(0));
                const source = ctx.createBufferSource();
                source.buffer = decodedBuf;
                source.connect(ctx.destination);
                audioSourceRef.current = source;
                await new Promise<void>((resolve) => {
                    source.onended = () => resolve();
                    source.start(0);
                });
                audioSourceRef.current = null;
            } catch (decodeErr) {
                // ── Fallback: Audio element with blob URL ──
                console.warn('AudioContext decode failed, using Audio element fallback:', decodeErr);
                const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audioFallbackRef.current = audio;
                try {
                    await audio.play();
                    await new Promise<void>((resolve) => {
                        audio.onended = () => resolve();
                        audio.onerror = () => resolve();
                        audio.onpause = () => resolve();
                    });
                } catch (playErr: any) {
                    toast.error('Audio playback blocked — try clicking the mic again first.');
                    console.error('Audio element fallback failed:', playErr);
                }
                URL.revokeObjectURL(url);
                audioFallbackRef.current = null;
            }
        } catch (err: any) {
            console.error('TTS error:', err);
            toast.error('TTS failed unexpectedly');
        } finally {
            setTtsStatus('idle');
            setTtsGenerating('idle');
        }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        playTts,
        stopTts,
        resumeAudioCtx,
    }));

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
        if (!isMuted && (ttsStatus === 'tts-speaking' || ttsGenerating === 'tts-generating')) {
            stopTts();
        }
    };

    return (
        <>
            {/* Mute/Unmute TTS */}
            <button
                className={`${isMuted ? "bg-orange-500" : "bg-green-500"} shadow mr-2`}
                onClick={handleMuteToggle}
                style={{
                    height: '40px',
                    width: '40px',
                    textAlign: 'center',
                    borderRadius: '50%',
                }}
                title={isMuted ? "Unmute AI speech" : "Mute AI speech"}
            >
                {isMuted ? (
                    <LucideVolumeX size={25} className="text-white inline-block" />
                ) : (
                    <LucideVolume2 size={25} className="text-white inline-block" />
                )}
            </button>
        </>
    );
});

TtsControls.displayName = 'TtsControls';

export default TtsControls;