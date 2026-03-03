/**
 * TalkWithAi — Voice chat page with configurable timer and send now
 *
 * Features:
 * 1. Audio output: uses shared AudioContext (resumed on mic click = user gesture)
 *    + axiosCustom responseType:'arraybuffer' → decodeAudioData → no autoplay block
 * 2. Configurable silence timer: 10s, 20s, 30s, 1min, 2min
 * 3. Manual "Send now" button to trigger immediate processing
 *
 * Pipeline: Web Speech API → configurable silence auto-send → LLM → TTS
 * Interrupt: speak while AI talks → stop TTS immediately
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LucideCamera, LucideX, LucideLoader2,
    LucideVolume2, LucideVolumeX, LucideMic, LucideMicOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../../../config/axiosCustom';
import envKeys from '../../../../../../config/envKeys';
import { uploadFeatureFile } from '../../../../../../utils/featureFileUpload';

// ─── Types ────────────────────────────────────────────────────────────────────

type TalkState = 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking';

interface Turn {
    role: 'user' | 'ai';
    text: string;
    timestamp: number;
    id: string;
}

// ─── Small orb ───────────────────────────────────────────────────────────────

const ORB_COLOR: Record<TalkState, string> = {
    idle: '#4f46e5',
    listening: '#3b82f6',
    processing: '#f59e0b',
    thinking: '#8b5cf6',
    speaking: '#10b981',
};

const ORB_SHADOW: Record<TalkState, string> = {
    idle: 'rgba(99,102,241,0.3)',
    listening: 'rgba(59,130,246,0.55)',
    processing: 'rgba(245,158,11,0.45)',
    thinking: 'rgba(139,92,246,0.45)',
    speaking: 'rgba(16,185,129,0.5)',
};

const STATE_LABEL: Record<TalkState, string> = {
    idle: 'Paused',
    listening: 'Listening…',
    processing: 'Transcribing…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
};

// using api for speech recognition instead of SpeechRecognition
const SILENCE_DURATION_OPTIONS = [
  { ms: 10_000, label: '10s' },
  { ms: 20_000, label: '20s' },
  { ms: 30_000, label: '30s' },
  { ms: 60_000, label: '1m' },
  { ms: 120_000, label: '2m' },
] as const;
const DEFAULT_DURATION_MS = 20_000;

// ─── Component ────────────────────────────────────────────────────────────────

const TalkWithAi = ({
    threadId
}: {
    threadId: string;
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [talkState, setTalkState] = useState<TalkState>('idle');
    const [conversation, setConversation] = useState<Turn[]>(() => {
        // Load conversation from localStorage on initialization
        try {
            const saved = localStorage.getItem(`talkwithai-conversation-${threadId}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [interimText, setInterimText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [capturedImageFile, setCapturedImageFile] = useState<File | null>(null);
    const [capturedImageThumb, setCapturedImageThumb] = useState<string | null>(null);
    const [volume, setVolume] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [silenceLeft, setSilenceLeft] = useState<number>(DEFAULT_DURATION_MS);
    const [silenceDurationMs, setSilenceDurationMs] = useState(DEFAULT_DURATION_MS);

    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const lastSpeechTimeRef = useRef<number>(0);
    const stateRef = useRef<TalkState>('idle');
    const isActiveRef = useRef(false);
    const silenceDurationRef = useRef(DEFAULT_DURATION_MS);

    // Audio (AudioContext primary + Audio element fallback)
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioFallbackRef = useRef<HTMLAudioElement | null>(null);

    // Volume analyser
    const micStreamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // Camera
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const camStreamRef = useRef<MediaStream | null>(null);

    // Save conversation to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(`talkwithai-conversation-${threadId}`, JSON.stringify(conversation));
        } catch (error) {
            console.warn('Failed to save conversation to localStorage:', error);
        }
    }, [conversation, threadId]);

    // Sync refs
    useEffect(() => { stateRef.current = talkState; }, [talkState]);
    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
    useEffect(() => { silenceDurationRef.current = silenceDurationMs; }, [silenceDurationMs]);


    // Auto-scroll
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, interimText]);

    // Cleanup on unmount
    useEffect(() => () => { cleanup(); }, []);

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

    const stopTts = useCallback(() => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch { }
            audioSourceRef.current = null;
        }
        if (audioFallbackRef.current) {
            audioFallbackRef.current.pause();
            audioFallbackRef.current = null;
        }
        if (stateRef.current === 'speaking') {
            setTalkState('listening');
            setSilenceLeft(DEFAULT_DURATION_MS);
        }
    }, []);

    const playTts = useCallback(async (text: string) => {
        if (isMuted) return;
        try {
            const safeText = text.slice(0, 1000);

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
                return;
            }

            const arrayBuffer: ArrayBuffer = res.data;
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                toast.error('TTS returned empty audio');
                return;
            }

            setTalkState('speaking');

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
        }
    }, [isMuted]);

    // ── Volume analyser & Recording setup ─────────────────────────────────────

    const stopVolumeAnalyser = () => {
        if (animFrameRef.current) { clearInterval(animFrameRef.current); animFrameRef.current = null; }
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
        setVolume(0);
    };

    // ── Pipeline ──────────────────────────────────────────────────────────────

    const runPipeline = useCallback(async (transcript: string) => {
        setTalkState('processing');
        setConversation(prev => [...prev, {
            role: 'user',
            text: transcript,
            timestamp: Date.now(),
            id: `user-${Date.now()}-${Math.random()}`
        }]);

        try {
            // 1. Optional camera image
            let imgPath: string | null = null;
            if (capturedImageFile) {
                try {
                    imgPath = await uploadFeatureFile({ file: capturedImageFile, parentEntityId: threadId, apiUrl: envKeys.API_URL });
                    await axiosCustom.post('/api/chat-llm/chat-add/notesAdd', { threadId, type: 'image', content: `Camera context: ${imgPath}`, tags: [], fileUrl: imgPath, fileUrlArr: [] });
                } catch { }
            }

            // 2. Save user message
            await axiosCustom.post('/api/chat-llm/chat-add/notesAdd', {
                threadId, type: 'text',
                content: imgPath ? `${transcript}\n\n[Camera context attached]` : transcript,
                tags: [], fileUrl: '', fileUrlArr: '',
            });

            setTalkState('thinking');

            // 3. LLM
            await axiosCustom.post('/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage', { threadId });

            // 4. Get AI reply
            const msgsRes = await axiosCustom.post('/api/chat-llm/crud/notesGet', { threadId, limit: 2, skip: 0 });
            const docs: any[] = msgsRes.data?.docs || [];
            const last = docs[docs.length - 1];
            const aiText: string = last?.content || last?.fileContentAi || '';

            if (aiText) setConversation(prev => [...prev, {
                role: 'ai',
                text: aiText,
                timestamp: Date.now(),
                id: `ai-${Date.now()}-${Math.random()}`
            }]);

            // 5. TTS
            if (aiText && !isMuted) await playTts(aiText);

            onMessageAdded();
            setCapturedImageFile(null);
            setCapturedImageThumb(null);
            setTalkState(isActiveRef.current ? 'listening' : 'idle');
            setSilenceLeft(DEFAULT_DURATION_MS);
        } catch (err) {
            console.error('Pipeline error:', err);
            toast.error('Something went wrong.');
            setTalkState(isActiveRef.current ? 'listening' : 'idle');
            setSilenceLeft(DEFAULT_DURATION_MS);
        }
    }, [threadId, capturedImageFile, isMuted, playTts]);

    // ── MediaRecorder & Silence detection ─────────────────────────────────────

    const startListening = useCallback(async () => {
        // Resume AudioContext inside user gesture
        await resumeAudioCtx();

        if (stateRef.current === 'speaking') stopTts();

        setIsActive(true);
        setTalkState('listening');
        setInterimText('');
        setSilenceLeft(silenceDurationMs);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            // Start volume analyser
            const ctx = getAudioCtx();
            const src = ctx.createMediaStreamSource(stream);
            const anal = ctx.createAnalyser();
            anal.fftSize = 256;
            src.connect(anal);

            lastSpeechTimeRef.current = Date.now();

            const volumeInterval = setInterval(() => {
                if (!isActiveRef.current) {
                    clearInterval(volumeInterval);
                    return;
                }
                const buf = new Uint8Array(anal.frequencyBinCount);
                anal.getByteFrequencyData(buf);
                const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
                setVolume(Math.min(avg / 100, 1));

                if (avg > 25) { // Speech threshold raised significantly to avoid static noise resetting the timer
                    lastSpeechTimeRef.current = Date.now();
                }

                const elapsed = Date.now() - lastSpeechTimeRef.current;
                const remaining = Math.max(0, silenceDurationRef.current - elapsed);

                setSilenceLeft(prev => {
                    if (Math.abs(remaining - prev) > 90) return remaining;
                    return prev;
                });

                if (elapsed > silenceDurationRef.current) {
                    // Silence detected -> stop recording and process if valid
                    clearInterval(volumeInterval);
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.stop();
                    }
                }
            }, 100);
            animFrameRef.current = volumeInterval as unknown as number;

            // Start MediaRecorder
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mr.onstop = async () => {
                // Determine whether we should process the audio
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome supports webm out of box
                audioChunksRef.current = [];
                stopVolumeAnalyser();

                // If it's still marked as active, it means silence threshold was reached or user hit stop.
                if (audioBlob.size > 0 && String(stateRef.current) !== 'processing' && String(stateRef.current) !== 'thinking') {
                    setTalkState('processing');
                    setInterimText('Transcribing audio...');
                    try {
                        const fileParams = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
                        const audioUrl = await uploadFeatureFile({ file: fileParams, parentEntityId: threadId, apiUrl: envKeys.API_URL });

                        const res = await axiosCustom.post('/api/llm/crud/audioToText', { fileUrl: audioUrl });
                        const transcript = res.data?.data?.contentAudioToText || '';

                        setInterimText('');
                        if (transcript.trim()) {
                            runPipeline(transcript);
                        } else {
                            // Empty transcript
                            setTalkState('idle');
                            setIsActive(false);
                            isActiveRef.current = false;
                            setSilenceLeft(DEFAULT_DURATION_MS);
                        }
                    } catch (e: any) {
                        console.error('Audio to text error:', e);
                        toast.error('Failed to transcribe audio.');
                        setTalkState('idle');
                        setIsActive(false);
                        isActiveRef.current = false;
                        setInterimText('');
                        setSilenceLeft(DEFAULT_DURATION_MS);
                    }
                } else {
                    setTalkState('idle');
                    setIsActive(false);
                    isActiveRef.current = false;
                    setInterimText('');
                    setSilenceLeft(DEFAULT_DURATION_MS);
                }
            };

            mr.start(100);

        } catch (e) {
            console.error('Mic error:', e);
            toast.error('Microphone access denied or error occurred.');
            setIsActive(false);
            setTalkState('idle');
            setSilenceLeft(DEFAULT_DURATION_MS);
        }
    }, [stopTts, runPipeline, threadId]);

    const sendNow = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop(); // Triggers onstop → transcribe → pipeline
        }
    }, []);

    const selectDuration = useCallback((newDurationMs: number) => {
        setSilenceDurationMs(newDurationMs);
        if (isActive) {
            // Reset countdown when changing duration while listening
            lastSpeechTimeRef.current = Date.now();
            setSilenceLeft(newDurationMs);
        }
    }, [isActive]);

    const stopListening = useCallback(() => {
        setIsActive(false);
        isActiveRef.current = false;
        setSilenceLeft(silenceDurationMs);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop(); // Triggers onstop which handles the rest
        } else {
            stopVolumeAnalyser();
            setTalkState('idle');
            setInterimText('');
        }
    }, []);

    // ── Camera ────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (cameraEnabled) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(s => { camStreamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; })
                .catch(() => { toast.error('Camera denied.'); setCameraEnabled(false); });
        } else {
            camStreamRef.current?.getTracks().forEach(t => t.stop());
            camStreamRef.current = null;
        }
        return () => { camStreamRef.current?.getTracks().forEach(t => t.stop()); };
    }, [cameraEnabled]);

    const snapCamera = () => {
        if (!canvasRef.current || !videoRef.current) return;
        const c = canvasRef.current; const v = videoRef.current;
        c.width = v.videoWidth || 320; c.height = v.videoHeight || 240;
        c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
        const thumb = c.toDataURL('image/jpeg', 0.7);
        setCapturedImageThumb(thumb);
        c.toBlob(b => { if (b) setCapturedImageFile(new File([b], 'cam.jpg', { type: 'image/jpeg' })); }, 'image/jpeg', 0.7);
        toast.success('Photo captured!');
    };

    const cleanup = () => {
        stopListening(); stopVolumeAnalyser();
        camStreamRef.current?.getTracks().forEach(t => t.stop());
        if (audioSourceRef.current) { try { audioSourceRef.current.stop(); } catch { } }
    };

    const handleClose = () => {
        // Navigate back to chat view for the same thread
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', 'chat');
        if (threadId) searchParams.set('id', threadId);
        navigate({ pathname: location.pathname, search: searchParams.toString() });
    };

    const onMessageAdded = () => {
        // Could refresh thread messages, but keeping simple for now
    };

    const clearConversation = () => {
        if (window.confirm('Are you sure you want to clear the conversation? This cannot be undone.')) {
            setConversation([]);
            try {
                localStorage.removeItem(`talkwithai-conversation-${threadId}`);
            } catch (error) {
                console.warn('Failed to clear conversation from localStorage:', error);
            }
            toast.success('Conversation cleared');
        }
    };

    const exportConversation = () => {
        const exportData = {
            threadId,
            timestamp: new Date().toISOString(),
            messages: conversation.map(turn => ({
                role: turn.role,
                text: turn.text,
                timestamp: new Date(turn.timestamp).toLocaleString(),
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `talkwithai-conversation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Conversation exported');
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            const isCurrentlyProcessing = talkState === 'processing' || talkState === 'thinking';

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (!isCurrentlyProcessing) {
                        if (isActive) {
                            stopListening();
                        } else {
                            startListening();
                        }
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    if (isActive) {
                        stopListening();
                    } else {
                        handleClose();
                    }
                    break;
                case 'KeyS':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        if (isActive && talkState === 'listening' && !isCurrentlyProcessing) {
                            sendNow();
                        }
                    }
                    break;
                case 'KeyC':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        setCameraEnabled(v => !v);
                    }
                    break;
                case 'KeyM':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        setIsMuted(v => !v);
                        if (!isMuted) stopTts();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, talkState, startListening, stopListening, sendNow, handleClose, setCameraEnabled, setIsMuted, stopTts, isMuted]);

    // ─── Render ───────────────────────────────────────────────────────────────

    const isProcessing = talkState === 'processing' || talkState === 'thinking';
    const orbScale = talkState === 'listening' ? 1 + volume * 0.2 : 1;
    const orbColor = ORB_COLOR[talkState];
    const orbShadow = ORB_SHADOW[talkState];

    return (
        <div className="px-2 sm:px-4 py-2 sm:py-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Status orb */}
                        <div className="relative">
                            <div
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-500 ${
                                    talkState === 'listening' ? 'animate-pulse' : ''
                                }`}
                                style={{
                                    background: orbColor,
                                    transform: `scale(${orbScale})`,
                                    boxShadow: `0 0 16px 6px ${orbShadow}`,
                                }}
                            />
                            {talkState === 'listening' && (
                                <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
                            )}
                            {volume > 0.1 && talkState === 'listening' && (
                                <div
                                    className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-pulse"
                                    style={{
                                        transform: `scale(${1 + volume * 0.5})`,
                                        animationDuration: '0.3s'
                                    }}
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🎙️ Talk with AI</h1>
                            <p className="text-sm text-gray-500">{STATE_LABEL[talkState]}</p>
                            <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                                Space: start/stop • Esc: close • Ctrl+S: send now • Ctrl+C: camera • Ctrl+M: mute
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <button
                            onClick={clearConversation}
                            disabled={conversation.length === 0}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Clear conversation"
                        >
                            🗑️
                        </button>
                        <button
                            onClick={exportConversation}
                            disabled={conversation.length === 0}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Export conversation"
                        >
                            📤
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1" />
                        <button
                            onClick={() => { setIsMuted(v => !v); if (!isMuted) stopTts(); }}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <LucideVolumeX size={20} /> : <LucideVolume2 size={20} />}
                        </button>
                        <button
                            onClick={() => setCameraEnabled(v => !v)}
                            className={`p-2 rounded-lg transition-colors ${cameraEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                            title="Camera"
                        >
                            <LucideCamera size={20} />
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Close"
                        >
                            <LucideX size={20} />
                        </button>
                    </div>
                </div>

                {/* Camera section */}
                <canvas ref={canvasRef} className="hidden" />
                {cameraEnabled && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                            <div className="flex-1 relative bg-black rounded-lg overflow-hidden max-h-32 sm:max-h-48 w-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {capturedImageThumb && (
                                    <img
                                        src={capturedImageThumb}
                                        alt="snap"
                                        className="absolute inset-0 w-full h-full object-cover opacity-65"
                                    />
                                )}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto sm:flex-col">
                                <button
                                    onClick={snapCamera}
                                    className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    📸 Snap
                                </button>
                                {capturedImageThumb && (
                                    <button
                                        onClick={() => { setCapturedImageFile(null); setCapturedImageThumb(null); }}
                                        className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        ✕ Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Conversation */}
                <div className="mb-4 sm:mb-6">
                    <div className="bg-white border rounded-xl shadow-sm p-3 sm:p-4 min-h-80 sm:min-h-96 max-h-80 sm:max-h-96 overflow-y-auto">
                        {conversation.length === 0 && (
                            <div className="text-center text-gray-400 py-12">
                                <div className="text-4xl mb-4">🎙️</div>
                                <div className="text-lg font-medium mb-2">
                                    {isActive ? 'Listening...' : 'Start a conversation'}
                                </div>
                                <div className="text-sm">
                                    {isActive ? 'Say something to begin' : 'Press the microphone button below'}
                                </div>
                            </div>
                        )}
                        <div className="space-y-6">
                            {conversation.map((turn) => (
                                <div key={turn.id} className={`flex items-start gap-3 ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {turn.role === 'ai' && (
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            AI
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                                        <div
                                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                turn.role === 'user'
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-md border border-gray-200'
                                            }`}
                                        >
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{turn.text}</div>
                                        </div>
                                        <div className={`text-xs text-gray-500 mt-1 px-2 ${turn.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {turn.role === 'user' && (
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            You
                                        </div>
                                    )}
                                </div>
                            ))}
                            {interimText && (
                                <div className="flex items-start gap-3 justify-end">
                                    <div className="flex flex-col items-end max-w-xs lg:max-w-md">
                                        <div className="px-4 py-3 rounded-2xl bg-blue-100 text-blue-800 italic rounded-br-md border border-blue-200 shadow-sm">
                                            <div className="text-sm leading-relaxed">{interimText}</div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        You
                                    </div>
                                </div>
                            )}
                        </div>
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* Timer controls */}
                <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-700">Auto-send timer</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {isActive ? 'Active' : 'Ready'}
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                            {isActive
                                ? `${Math.ceil(silenceLeft / 1000)}s remaining`
                                : `${silenceDurationMs / 1000}s delay`
                            }
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                            <div
                                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                                    isActive ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-blue-400'
                                }`}
                                style={{
                                    width: isActive
                                        ? `${((silenceDurationMs - silenceLeft) / silenceDurationMs) * 100}%`
                                        : '0%'
                                }}
                            />
                        </div>
                    </div>

                    {/* Duration buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs text-gray-500 sm:mr-2">Duration:</span>
                        <div className="flex gap-1 overflow-x-auto">
                            {SILENCE_DURATION_OPTIONS.map(({ ms, label }) => (
                                <button
                                    key={ms}
                                    onClick={() => selectDuration(ms)}
                                    disabled={isProcessing}
                                    className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                                        silenceDurationMs === ms
                                            ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Helper text */}
                    <div className="mt-2 text-xs text-gray-500">
                        {isActive
                            ? 'Recording will auto-send when silence is detected for the selected duration'
                            : 'Choose how long to wait for silence before auto-sending your message'
                        }
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 order-2 sm:order-1">
                        {talkState === 'speaking' && (
                            <button
                                onClick={stopTts}
                                className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base"
                            >
                                ✋ Interrupt
                            </button>
                        )}
                        {isActive && talkState === 'listening' && (
                            <button
                                onClick={sendNow}
                                disabled={isProcessing}
                                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                                title="Send immediately (Ctrl+S)"
                            >
                                Send now
                            </button>
                        )}
                    </div>

                    {/* Mic button */}
                    <div className="relative order-1 sm:order-2">
                        <button
                            onClick={() => { if (isActive) stopListening(); else startListening(); }}
                            disabled={isProcessing}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 transition-all duration-300 transform ${
                                isActive
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-2xl scale-110 hover:scale-115'
                                    : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:from-gray-300 hover:to-gray-400 shadow-lg hover:shadow-xl'
                            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group`}
                            title={isActive ? 'Stop recording (Space)' : 'Start recording (Space)'}
                            style={{
                                boxShadow: isActive
                                    ? `0 0 30px 8px ${orbShadow}, inset 0 2px 4px rgba(0,0,0,0.1)`
                                    : '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)',
                            }}
                        >
                            {isProcessing ? (
                                <LucideLoader2 size={24} className="animate-spin text-white drop-shadow-sm" />
                            ) : isActive ? (
                                <LucideMic size={24} className="text-white drop-shadow-sm animate-pulse" />
                            ) : (
                                <LucideMicOff size={24} className="text-gray-600 drop-shadow-sm group-hover:text-gray-700" />
                            )}
                        </button>

                        {/* Recording indicator */}
                        {isActive && (
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                            </div>
                        )}

                        {/* Ripple effect when recording */}
                        {isActive && talkState === 'listening' && (
                            <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-20" />
                        )}
                    </div>

                    <div className="text-xs sm:text-sm text-gray-500 text-center max-w-32 order-3">
                        {isActive ? 'Auto-detects speech' : 'Press to start'}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TalkWithAi;