/**
 * AiCall — Speech → LLM → Speech conversational app
 *
 * Pipeline: VAD (onSpeechEnd) → STT → LLM → TTS
 * Interrupt: speak while AI talks → stop TTS immediately
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMicVAD } from '@ricky0123/vad-react';
import { LucideMic, LucideMicOff, LucidePhoneOff, LucideVolume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../config/axiosCustom';
import envKeys from '../../../../config/envKeys';
import { uploadFeatureFile } from '../../../../utils/featureFileUpload';
import { float32ToWavBlob } from './utils/float32ToWav';

type State = 'idle' | 'listening' | 'speaking' | 'processing' | 'thinking';

interface Turn {
  role: 'user' | 'ai';
  text: string;
  id: string;
}

const AiCall = ({ threadId }: { threadId: string }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<State>('idle');
  const [conversation, setConversation] = useState<Turn[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pipelineLockRef = useRef(false);

  const getAudioCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const stopTts = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
      audioSourceRef.current = null;
    }
    setState((s) => (s === 'speaking' ? 'listening' : s));
  }, []);

  const playTts = useCallback(
    async (text: string) => {
      if (isMuted) return;
      const safeText = text.slice(0, 1000);

      try {
        const res = await axiosCustom.post('/api/chat-llm/tts/speak', { text: safeText }, { responseType: 'arraybuffer' });
        const arrayBuffer: ArrayBuffer = res.data;
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          toast.error('TTS returned empty audio');
          return;
        }

        setState('speaking');
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
        } catch {
          const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          await audio.play();
          await new Promise<void>((resolve) => {
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
          });
          URL.revokeObjectURL(url);
        }
        audioSourceRef.current = null;
        setState('listening');
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : null;
        toast.error(msg ? String(msg) : 'TTS failed');
        setState('listening');
      }
    },
    [isMuted, getAudioCtx]
  );

  const runPipeline = useCallback(
    async (transcript: string) => {
      if (pipelineLockRef.current) return;
      pipelineLockRef.current = true;
      setState('processing');
      setConversation((prev) => [...prev, { role: 'user', text: transcript, id: `u-${Date.now()}` }]);

      try {
        await axiosCustom.post('/api/chat-llm/chat-add/notesAdd', {
          threadId,
          type: 'text',
          content: transcript,
          tags: [],
          fileUrl: '',
          fileUrlArr: '',
        });

        setState('thinking');
        await axiosCustom.post('/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage', { threadId });

        const msgsRes = await axiosCustom.post('/api/chat-llm/crud/notesGet', { threadId, limit: 2, skip: 0 });
        const docs: { content?: string; fileContentAi?: string }[] = msgsRes.data?.docs ?? [];
        const last = docs[docs.length - 1];
        const aiText: string = last?.content ?? last?.fileContentAi ?? '';

        if (aiText) {
          setConversation((prev) => [...prev, { role: 'ai', text: aiText, id: `a-${Date.now()}` }]);
          await playTts(aiText);
        } else {
          setState('listening');
        }
      } catch (err) {
        console.error('Pipeline error:', err);
        toast.error('Something went wrong');
        setState('listening');
      } finally {
        pipelineLockRef.current = false;
      }
    },
    [threadId, playTts]
  );

  const onSpeechStart = useCallback(() => {
    stopTts();
    setState('speaking');
  }, [stopTts]);

  const onSpeechEnd = useCallback(
    async (audio: Float32Array) => {
      setState('listening');
      if (audio.length < 1600) return; // ~0.1s minimum

      if (pipelineLockRef.current) return;

      try {
        setState('processing');
        const wavBlob = float32ToWavBlob(audio);
        const file = new File([wavBlob], 'audio.wav', { type: 'audio/wav' });
        const audioUrl = await uploadFeatureFile({
          file,
          parentEntityId: threadId,
          apiUrl: envKeys.API_URL,
        });

        const res = await axiosCustom.post('/api/llm/crud/audioToText', { fileUrl: audioUrl });
        const transcript = res.data?.data?.contentAudioToText ?? '';

        if (transcript.trim()) {
          await runPipeline(transcript.trim());
        } else {
          setState('listening');
        }
      } catch (err) {
        console.error('STT error:', err);
        toast.error('Failed to transcribe');
        setState('listening');
      }
    },
    [threadId, runPipeline]
  );

  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart,
    onSpeechEnd,
    redemptionMs: 800,
    minSpeechMs: 300,
    positiveSpeechThreshold: 0.6,
    baseAssetPath: '/vad/',
    onnxWASMBasePath: '/vad/',
  });

  useEffect(() => {
    if (!vad.listening) setState('idle');
  }, [vad.listening]);

  useEffect(() => () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
    }
  }, []);

  const handleEndCall = () => {
    vad.pause();
    navigate(`/user/chat?id=${threadId}`);
  };

  const handleMicClick = async () => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    await vad.toggle();
  };

  const isProcessing = state === 'processing' || state === 'thinking';

  return (
    <div className="flex flex-col bg-gray-900 text-white" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div
          className={`w-32 h-32 rounded-full transition-all duration-300 ${
            state === 'speaking' ? 'animate-pulse' : ''
          }`}
          style={{
            background: state === 'speaking' ? '#3b82f6' : state === 'processing' || state === 'thinking' ? '#f59e0b' : '#4f46e5',
            boxShadow: `0 0 40px ${state === 'speaking' ? 'rgba(59,130,246,0.5)' : 'rgba(79,70,229,0.4)'}`,
          }}
        />
        <p className="mt-4 text-sm text-gray-400">
          {!vad.listening && 'Tap mic to start'}
          {vad.listening && state === 'listening' && 'Listening...'}
          {vad.listening && state === 'speaking' && 'You are speaking...'}
          {state === 'processing' && 'Transcribing...'}
          {state === 'thinking' && 'Thinking...'}
          {state === 'speaking' && !vad.listening && 'AI speaking...'}
        </p>

        {conversation.length > 0 && (
          <div className="mt-6 w-full max-w-md space-y-2">
            {conversation.slice(-4).map((t) => (
              <div
                key={t.id}
                className={`px-3 py-2 rounded-lg text-sm ${
                  t.role === 'user' ? 'bg-blue-600/30 ml-8' : 'bg-gray-700/50 mr-8'
                }`}
              >
                {t.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700 flex justify-center gap-3">
        <button
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`p-3 rounded-full ${vad.listening ? 'bg-blue-500' : 'bg-gray-600'} disabled:opacity-50`}
          title="Microphone"
        >
          {vad.listening ? <LucideMic size={24} /> : <LucideMicOff size={24} />}
        </button>
        <button
          onClick={() => setIsMuted((m) => !m)}
          className={`p-3 rounded-full ${isMuted ? 'bg-amber-600' : 'bg-gray-600'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <LucideVolume2 size={24} />
        </button>
        <button
          onClick={handleEndCall}
          className="p-3 rounded-full bg-red-500"
          title="End call"
        >
          <LucidePhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default AiCall;
