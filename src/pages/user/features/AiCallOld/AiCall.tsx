/**
 * AiCall — Voice chat page with configurable timer and send now
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
import { useNavigate } from 'react-router-dom';
import {
    LucideCamera, LucideCameraOff, LucideX,
    LucideMic, LucideMicOff, LucideSettings, LucidePhoneOff,
    LucideMessageSquare, LucideLoader2, LucideBrain, LucideFileAudio, LucideVolume2,
    LucideCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../config/axiosCustom';
import envKeys from '../../../../config/envKeys';
import { uploadFeatureFile } from '../../../../utils/featureFileUpload';

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

// using api for speech recognition instead of SpeechRecognition
const SILENCE_DURATION_OPTIONS = [
  { ms: 2_000, label: '2s' },
  { ms: 5_000, label: '5s' },
  { ms: 10_000, label: '10s' },
  { ms: 15_000, label: '15s' },
  { ms: 30_000, label: '30s' },
  { ms: 60_000, label: '1m' },
  { ms: 120_000, label: '2m' },
  { ms: 300_000, label: '5m' },
] as const;
const DEFAULT_DURATION_MS = 2_000;

// ─── Component ────────────────────────────────────────────────────────────────

const AiCall = ({
    threadId
}: {
    threadId: string;
}) => {
    const navigate = useNavigate();

    const [talkState, setTalkState] = useState<TalkState>('idle');
    const [conversation, setConversation] = useState<Turn[]>(() => {
        try {
            const saved = localStorage.getItem(`aicall-conversation-${threadId}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [interimText, setInterimText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [capturedImageFile, setCapturedImageFile] = useState<File | null>(null);
    const [volume, setVolume] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [silenceLeft, setSilenceLeft] = useState<number>(DEFAULT_DURATION_MS);
    const [silenceDurationMs, setSilenceDurationMs] = useState<number>(DEFAULT_DURATION_MS);
    const [showSettings, setShowSettings] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [hasDetectedSpeech, setHasDetectedSpeech] = useState(false);
    const [latestTranscriptText, setLatestTranscriptText] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const lastSpeechTimeRef = useRef<number>(0);
    const stateRef = useRef<TalkState>('idle');
    const isActiveRef = useRef(false);
    const silenceDurationRef = useRef(DEFAULT_DURATION_MS);
    const hasDetectedSpeechRef = useRef(false);

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
            localStorage.setItem(`aicall-conversation-${threadId}`, JSON.stringify(conversation));
        } catch (error) {
            console.warn('Failed to save conversation to localStorage:', error);
        }
    }, [conversation, threadId]);

    // Sync refs
    useEffect(() => { stateRef.current = talkState; }, [talkState]);
    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
    useEffect(() => { silenceDurationRef.current = silenceDurationMs; }, [silenceDurationMs]);


    // Auto-scroll
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, interimText, showChat]);

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
        setLatestTranscriptText(transcript);
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
            setTalkState(isActiveRef.current ? 'listening' : 'idle');
            setSilenceLeft(DEFAULT_DURATION_MS);
        } catch (err) {
            console.error('Pipeline error:', err);
            toast.error('Something went wrong.');
            setTalkState(isActiveRef.current ? 'listening' : 'idle');
            setSilenceLeft(DEFAULT_DURATION_MS);
        }
    }, [threadId, capturedImageFile, isMuted, playTts]);

    const pickClosestTimerMs = (increaseSeconds: number) => {
        if (!Number.isFinite(increaseSeconds) || increaseSeconds <= 0) {
            return null;
        }

        const targetMs = Math.max(2_000, Math.min(300_000, Math.round(increaseSeconds) * 1000));
        let next: number = SILENCE_DURATION_OPTIONS[0].ms;
        let best = Math.abs(next - targetMs);

        for (let i = 1; i < SILENCE_DURATION_OPTIONS.length; i += 1) {
            const candidate = SILENCE_DURATION_OPTIONS[i].ms;
            const diff = Math.abs(candidate - targetMs);
            if (diff < best) {
                best = diff;
                next = candidate;
            }
        }

        return next;
    };

    const evaluateTranscription = useCallback(async (transcript: string) => {
        const trimmedTranscript = transcript.trim();
        setLatestTranscriptText(trimmedTranscript);
        if (!trimmedTranscript) {
            return {
                shouldSend: false,
                increaseTimerMs: null,
            };
        }

        try {
            const res = await axiosCustom.post('/api/chat-llm/ai-call/decide-send', { threadId, transcript: trimmedTranscript });
            const payload = res?.data || {};
            const shouldSend = typeof payload.shouldSend === 'boolean' ? payload.shouldSend : false;
            const increaseTimer = Number(payload.increaseTimer);

            const nextTimerMs = pickClosestTimerMs(increaseTimer);
            return {
                shouldSend,
                increaseTimerMs: nextTimerMs,
            };
        } catch (error) {
            console.error('Decision endpoint error:', error);
            return {
                shouldSend: false,
                increaseTimerMs: null,
            };
        }
    }, [threadId]);

    // ── MediaRecorder & Silence detection ─────────────────────────────────────

    const startListening = useCallback(async () => {
        // Resume AudioContext inside user gesture
        await resumeAudioCtx();

        if (stateRef.current === 'speaking') stopTts();

        setIsActive(true);
        setTalkState('listening');
        setInterimText('');
        setSilenceLeft(silenceDurationMs);
        setHasDetectedSpeech(false);
        hasDetectedSpeechRef.current = false;

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
                    if (!hasDetectedSpeechRef.current) {
                        hasDetectedSpeechRef.current = true;
                        setHasDetectedSpeech(true);
                    }
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
                if (
                    audioBlob.size > 0 &&
                    hasDetectedSpeechRef.current &&
                    String(stateRef.current) !== 'processing' &&
                    String(stateRef.current) !== 'thinking'
                ) {
                    setTalkState('processing');
                    setInterimText('Transcribing audio...');
                    try {
                        const fileParams = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
                        const audioUrl = await uploadFeatureFile({ file: fileParams, parentEntityId: threadId, apiUrl: envKeys.API_URL });

                        const res = await axiosCustom.post('/api/llm/crud/audioToText', { fileUrl: audioUrl });
                        const transcript = res.data?.data?.contentAudioToText || '';

                        setInterimText('');
                        if (transcript.trim()) {
                            setLatestTranscriptText(transcript.trim());
                            const decision = await evaluateTranscription(transcript);
                            if (decision.shouldSend) {
                                runPipeline(transcript);
                            } else {
                                setTalkState('idle');
                                setIsActive(false);
                                isActiveRef.current = false;
                                setSilenceLeft(DEFAULT_DURATION_MS);
                                setHasDetectedSpeech(false);
                                hasDetectedSpeechRef.current = false;
                                setInterimText('No clear send intent detected. Speak a bit more to continue.');
                                if (decision.increaseTimerMs !== null) {
                                    setSilenceDurationMs(decision.increaseTimerMs);
                                }
                                return;
                            }
                        } else {
                            setLatestTranscriptText('');
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
                setLatestTranscriptText('');
                        setHasDetectedSpeech(false);
                        hasDetectedSpeechRef.current = false;
                        setSilenceLeft(DEFAULT_DURATION_MS);
                    }
                } else {
                    setHasDetectedSpeech(false);
                    hasDetectedSpeechRef.current = false;
                    setTalkState('idle');
                    setIsActive(false);
                    isActiveRef.current = false;
            setLatestTranscriptText('');
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
    }, [stopTts, runPipeline, threadId, evaluateTranscription]);

    const sendNow = useCallback(() => {
        if (!hasDetectedSpeechRef.current) {
            setTalkState('idle');
            setIsActive(false);
            isActiveRef.current = false;
            stopVolumeAnalyser();
            setHasDetectedSpeech(false);
            return;
        }
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop(); // Triggers onstop → transcribe → pipeline
        }
    }, [stopVolumeAnalyser]);

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
        setHasDetectedSpeech(false);
        hasDetectedSpeechRef.current = false;
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

    const cleanup = () => {
        stopListening(); stopVolumeAnalyser();
        camStreamRef.current?.getTracks().forEach(t => t.stop());
        if (audioSourceRef.current) { try { audioSourceRef.current.stop(); } catch { } }
    };

    const handleClose = () => {
        // Navigate back to chat view for the same thread
        if (threadId) {
            navigate(`/user/chat?id=${threadId}`);
        } else {
            navigate('/user/chat');
        }
    };

    const onMessageAdded = () => {
        // Could refresh thread messages, but keeping simple for now
    };

    const clearConversation = () => {
        if (window.confirm('Are you sure you want to clear the conversation? This cannot be undone.')) {
            setConversation([]);
            try {
                localStorage.removeItem(`aicall-conversation-${threadId}`);
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
        a.download = `aicall-conversation-${new Date().toISOString().split('T')[0]}.json`;
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

    const STEPS = [
        { id: 'listening', label: 'Listening', icon: LucideMic },
        { id: 'processing', label: 'Audio to Text', icon: LucideFileAudio },
        { id: 'thinking', label: 'LLM', icon: LucideBrain },
        { id: 'speaking', label: 'TTS', icon: LucideVolume2 },
    ];

    const getStepStatus = (stepId: string) => {
        if (talkState === 'idle') return 'waiting';
        
        // Define order
        const order = ['listening', 'processing', 'thinking', 'speaking'];
        const currentIndex = order.indexOf(talkState);
        const stepIndex = order.indexOf(stepId);

        if (currentIndex === stepIndex) return 'active';
        if (currentIndex > stepIndex) return 'completed';
        return 'waiting';
    };

    const selectedAutoSendLabel = SILENCE_DURATION_OPTIONS.find((option) => option.ms === silenceDurationMs)?.label || `${silenceDurationMs / 1000}s`;

    return (
        <div style={{ height: `calc(100vh - 60px)` }} className="bg-black text-white flex flex-col font-sans">
            {/* 1. Video Background / Main View */}
            <div className="flex-1 overflow-hidden">
                {cameraEnabled ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        {/* Background ambience */}
                        <div className="bg-gradient-to-b from-gray-800 to-black opacity-50" />
                        
                        {/* AI Orb Visualization */}
                            <div className="z-10 flex flex-col items-center">
                            <div
                                className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full transition-all duration-500 blur-sm ${
                                    talkState === 'listening' ? 'animate-pulse' : ''
                                }`}
                                style={{
                                    background: orbColor,
                                    transform: `scale(${orbScale})`,
                                    boxShadow: `0 0 60px 20px ${orbShadow}`,
                                }}
                            />
                            <div 
                                className="rounded-full mix-blend-overlay opacity-50"
                                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent)' }}
                            />
                        </div>
                        
                        {/* Pipeline Steps Visualization */}
                        <div className="mt-12 z-10 w-full max-w-lg px-6">
                            <div className="flex items-center justify-between">
                                {/* Connecting Line */}
                                <div className="h-0.5 bg-white/10 -z-10" />
                                
                                {STEPS.map((step) => {
                                    const status = getStepStatus(step.id);
                                    const isActiveStep = status === 'active';
                                    const isCompleted = status === 'completed';
                                    
                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-2">
                                            <div 
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                    isActiveStep 
                                                        ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/50' 
                                                        : isCompleted 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-gray-800 text-gray-500 border border-white/10'
                                                }`}
                                            >
                                                {isCompleted ? <LucideCheck size={18} /> : <step.icon size={18} className={isActiveStep ? 'animate-pulse' : ''} />}
                                            </div>
                                            <span className={`text-[10px] font-medium tracking-wide uppercase transition-colors ${
                                                isActiveStep ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-600'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 text-center z-10 px-4">
                            <p className="text-sm text-white/50">
                                {isActive ? 'Listening...' : 'Tap mic to start'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

             {/* Silence Timer Progress (Top) */}
             {isActive && (
                <div className="h-1 bg-white/10 z-30">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-linear"
                        style={{ width: `${((silenceDurationMs - silenceLeft) / silenceDurationMs) * 100}%` }}
                    />
                </div>
            )}

            {/* 2. Top Bar */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-black/65 via-black/35 to-transparent z-20">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] border ${
                            isActive
                                ? 'bg-red-500/15 text-red-200 border-red-300/40 animate-pulse'
                                : 'bg-white/10 text-white/90 border-white/20'
                        }`}>
                            {isActive ? 'LIVE' : 'READY'}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/85 border border-white/15 text-xs font-medium tracking-wide">
                            Auto send
                            <span className="mx-2 text-white/60">•</span>
                            <span className="font-semibold text-white/95">{selectedAutoSendLabel}</span>
                            {isActive && (
                                <span className="text-white/60 ml-2">({Math.ceil(silenceLeft / 1000)}s remaining)</span>
                            )}
                        </span>
                    </div>

                    <div className="flex gap-2.5">
                        <button 
                            onClick={() => setShowChat(!showChat)}
                            className={`p-3 rounded-full backdrop-blur-md transition-all ${
                                showChat ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
                            }`}
                        >
                            <LucideMessageSquare size={20} />
                        </button>
                        <button 
                            onClick={handleClose}
                            className="p-3 rounded-full bg-black/40 text-white hover:bg-red-500/80 hover:text-white border border-white/10 backdrop-blur-md transition-all"
                        >
                            <LucideX size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4 pt-2 sm:px-6">
                <div className="flex gap-2 flex-wrap">
                    {SILENCE_DURATION_OPTIONS.map(({ ms, label }) => (
                        <button
                            key={ms}
                            onClick={() => selectDuration(ms)}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-full border transition-all duration-200 ${
                                silenceDurationMs === ms
                                    ? 'bg-white text-black border-white shadow-md shadow-white/20'
                                    : 'bg-white/10 text-white/85 border-white/20 hover:bg-white/20 hover:border-white/30'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Transcript Overlay (Subtitles style) */}
            {interimText && (
                <div className="px-6 text-center z-20 pointer-events-none">
                    <span className="inline-block px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white/90 text-lg font-medium shadow-lg">
                        {interimText}
                    </span>
                </div>
            )}

            {latestTranscriptText && (
                <div className="px-4 sm:px-6 py-2 z-20">
                    <div className="inline-block rounded-2xl border border-white/20 bg-white/5 px-4 py-2">
                        <div className="text-[11px] text-white/60">Latest text</div>
                        <div className="text-[13px] text-white/95 break-words">
                            {latestTranscriptText}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Settings Modal */}
            {showSettings && (
                <div className="bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 text-white rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <LucideX size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                                <button
                                    onClick={exportConversation}
                                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors"
                                >
                                    <span>Export Conversation</span>
                                    <span className="text-gray-400">JSON</span>
                                </button>
                                <button
                                    onClick={clearConversation}
                                    className="w-full py-3 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl flex items-center justify-between transition-colors"
                                >
                                    <span>Clear History</span>
                                    <LucideX size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Chat Drawer */}
            {showChat && (
                <div className="mx-4 sm:mx-auto sm:max-w-md bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 z-30 flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
                        {conversation.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/30">
                                <LucideMessageSquare size={48} className="mb-4 opacity-50" />
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            conversation.map((turn) => (
                                <div key={turn.id} className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                                        turn.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white/10 text-gray-100 rounded-bl-none'
                                    }`}>
                                        {turn.text}
                                    </div>
                                    <span className="text-[10px] text-white/30 mt-1 px-1">
                                        {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>
            )}

            {/* 6. Bottom Controls Bar */}
            <div className="p-5 pb-7 bg-black/95 z-40 shrink-0 border-t border-white/10">
                <div className="flex items-center justify-center gap-3 sm:gap-5">
                    {/* Camera Toggle */}
                    <button
                        onClick={() => setCameraEnabled(!cameraEnabled)}
                        disabled={isProcessing}
                        className={`p-3.5 rounded-full transition-all duration-300 ${
                            cameraEnabled 
                                ? 'bg-white text-black shadow-lg shadow-white/20' 
                                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Toggle Camera"
                    >
                        {cameraEnabled ? <LucideCamera size={24} /> : <LucideCameraOff size={24} />}
                    </button>

                    {/* Settings (Requested: SETTING) */}
                    <button
                        onClick={() => setShowSettings(true)}
                        disabled={isProcessing}
                        className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Settings"
                    >
                        <LucideSettings size={24} />
                    </button>

                    <button
                        onClick={() => setIsMuted((prev) => !prev)}
                        disabled={isProcessing}
                        className={`p-3.5 rounded-full transition-all duration-300 ${
                            isMuted
                                ? 'bg-white/20 text-white/90 border border-white/30'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-md'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        <LucideVolume2 size={20} />
                    </button>

                    <button
                        onClick={sendNow}
                        disabled={!isActive || isProcessing || !hasDetectedSpeech}
                        className={`px-4 py-3 rounded-full border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            hasDetectedSpeech ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/60'
                        }`}
                        title="Send now"
                    >
                        Send now
                    </button>

                    {/* Mic Toggle (Requested: AUDIO) */}
                    <button
                        onClick={() => { if (isActive) stopListening(); else startListening(); }}
                        disabled={isProcessing}
                        className={`p-5 rounded-full transition-all duration-300 transform border ${
                            isActive 
                            ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/40 scale-110 border-blue-400/50' 
                            : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Toggle Microphone"
                    >
                        {isProcessing ? (
                            <LucideLoader2 size={28} className="animate-spin" />
                        ) : isActive ? (
                            <LucideMic size={28} className="animate-pulse" />
                        ) : (
                            <LucideMicOff size={28} />
                        )}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={handleClose}
                        className="p-3.5 rounded-full bg-red-500/85 text-white hover:bg-red-600/95 backdrop-blur-md transition-all duration-300 shadow-lg shadow-red-900/40"
                        title="End Call"
                    >
                        <LucidePhoneOff size={22} />
                    </button>
                </div>

                <div className="mt-3 text-[11px] text-white/50 text-center tracking-wide">
                    <span className={isActive ? 'text-white/80' : ''}>
                        {isActive ? 'Tap mic or hold Send now to submit' : 'Tap mic to start'}
                    </span>
                </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default AiCall;