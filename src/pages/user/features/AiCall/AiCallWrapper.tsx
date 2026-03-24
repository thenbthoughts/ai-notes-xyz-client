import { Fragment, useEffect, useRef, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import { LucideBrain, LucideClock, LucideMic, LucideMicOff, LucidePhoneOff, LucideSettings, LucideSpeech, LucideTimer, LucideVolume2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import stateJotaiAuthAtom from "../../../../jotai/stateJotaiAuth";
import { float32ToWavBlob } from "./utils/float32ToWav";
import { uploadFeatureFile } from "../../../../utils/featureFileUpload";
import envKeys from "../../../../config/envKeys";
import axiosCustom from "../../../../config/axiosCustom";
import { toast } from "react-hot-toast";
import TtsControls, { TtsControlsRef, TtsStatus, TtsGenerating } from "./TtsControls";
import { waitForMillis } from "../../../../utils/waitForMillis";

interface ConversationItem {
    _id: string;
    threadId: string;
    type: string;
    content: string;
    reasoningContent: string;
    username: string;
    tags: string[];
    visibility: string;
    fileUrl: string;
    fileContentText: string;
    fileContentAi: string;
    fileUrlArr: string[];
    isAi: boolean;
    aiModelName: string;
    aiModelProvider: string;
    createdAtUtc: string;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: string;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
    tagsAutoAi: string[];
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    totalTokens: number;
    costInUsd: number;
    __v: number;
}

const getDecisionFromContent = async ({
    transcript,
    threadId,
}: {
    transcript: string;
    threadId: string;
}) => {
    let returnObj = {
        shouldSend: true,
        increaseTimer: 0,
    }

    try {
        const res = await axiosCustom.post<{ shouldSend?: boolean; increaseTimer?: number }>(
            '/api/chat-llm/ai-call/decide-send',
            { transcript: transcript.trim(), threadId }
        );
        const payload = res?.data ?? {};
        const shouldSend = typeof payload.shouldSend === 'boolean' ? payload.shouldSend : false;
        const increaseTimer = typeof payload.increaseTimer === 'number' ? payload.increaseTimer : 0;

        if (typeof shouldSend === 'boolean') {
            returnObj.shouldSend = shouldSend;
        }
        if (typeof increaseTimer === 'number') {
            returnObj.increaseTimer = increaseTimer;
        }
        return returnObj;
    } catch (error) {
        console.error('Decision endpoint error:', error);
        return returnObj;
    }
}

interface ThreadSettings {
    sttModelProvider: string;
    sttModelName: string;
    ttsModelProvider: string;
    ttsModelName: string;
}

const AiCallNew = ({
    threadId,
}: {
    threadId: string;
}) => {
    const [nextMessage, setNextMessage] = useState<string>("");

    const [timer, setTimer] = useState<number>(0);

    const [sendingInSeconds, setSendingInSeconds] = useState<number>(5);

    const [status, setStatus] = useState<"idle" | "listening" | "speaking">("idle");
    const [isTranscripting, setIsTranscripting] = useState<boolean>(false);

    const [threadSettings, setThreadSettings] = useState<ThreadSettings>({
        sttModelProvider: '',
        sttModelName: '',
        ttsModelProvider: '',
        ttsModelName: '',
    });

    useEffect(() => {
        const fetchThread = async () => {
            try {
                const res = await axiosCustom.post<{ docs?: Array<{ sttModelProvider?: string; sttModelName?: string; ttsModelProvider?: string; ttsModelName?: string }> }>(
                    '/api/chat-llm/threads-crud/threadsGet',
                    { threadId }
                );
                const docs = res.data?.docs ?? [];
                if (docs.length > 0) {
                    const t = docs[0];
                    setThreadSettings({
                        sttModelProvider: t.sttModelProvider ?? '',
                        sttModelName: t.sttModelName ?? '',
                        ttsModelProvider: t.ttsModelProvider ?? '',
                        ttsModelName: t.ttsModelName ?? '',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch thread settings for AiCall:', err);
            }
        };
        fetchThread();
    }, [threadId]);

    // TTS state
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [ttsStatus, setTtsStatus] = useState<TtsStatus>("idle");
    const [ttsGenerating, setTtsGenerating] = useState<TtsGenerating>("idle");
    const ttsControlsRef = useRef<TtsControlsRef>(null);


    const [conversation, setConversation] = useState<ConversationItem[]>([]);
    const [generatingAiResponse, setGeneratingAiResponse] = useState<boolean>(false);

    const navigate = useNavigate();
    const onSpeechStart = () => {
        // Stop TTS if currently playing when user starts speaking
        if (ttsStatus === 'tts-speaking' && ttsControlsRef.current) {
            ttsControlsRef.current.stopTts();
        }
        // Resume AudioContext for TTS (user gesture)
        if (ttsControlsRef.current) {
            ttsControlsRef.current.resumeAudioCtx();
        }
        setStatus("speaking");
    };

    const onSpeechEnd = (audio: Float32Array) => {
        setStatus("listening");
        getStt({
            audio,
        });
    };

    const vad = useMicVAD({
        startOnLoad: true,
        onSpeechStart,
        onSpeechEnd,
        redemptionMs: 1500,
        minSpeechMs: 100,
        positiveSpeechThreshold: 0.90,
        baseAssetPath: "/vad/",
        onnxWASMBasePath: "/vad/",
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimer((prev) => {
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        if (!vad.listening) {
            setStatus("idle");
        }
    }, [vad.listening]);

    useEffect(() => {
        setSendingInSeconds((prev) => {
            return Math.max(0, prev - 1);
        });
    }, [timer]);

    useEffect(() => {
        if (generatingAiResponse) {
            return;
        }

        if (nextMessage.trim().length >= 1 && sendingInSeconds <= 0) {
            let tempMessage = nextMessage.trim();

            // TODO should process the message

            setNextMessage(() => {
                return "";
            });

            sendMessage({
                message: tempMessage,
            });
        }
    }, [
        nextMessage,
        sendingInSeconds,
    ]);

    // ----- functions -----
    const getStt = async ({
        audio,
    }: {
        audio: Float32Array;
    }) => {
        setIsTranscripting(true);

        try {
            // Convert Float32Array to WAV blob
            const wavBlob = float32ToWavBlob(audio);

            // Create File object from blob
            const file = new File([wavBlob], 'audio.wav', { type: 'audio/wav' });

            // Upload the audio file
            const audioUrl = await uploadFeatureFile({
                file,
                parentEntityId: threadId,
                apiUrl: envKeys.API_URL,
            });

            // Call STT API (threadId passes thread's sttModelProvider/sttModelName)
            const res = await axiosCustom.post('/api/llm/crud/audioToText', {
                fileUrl: audioUrl,
                threadId,
            });

            // Extract transcript from response
            const transcript = res.data?.data?.contentAudioToText ?? '';

            if (transcript.trim().length > 0) {
                const decision = await getDecisionFromContent({
                    transcript: transcript.trim(),
                    threadId,
                });
                console.log('decision', decision);

                if (decision.shouldSend) {
                    setNextMessage((prev) => {
                        return `${prev}\n${transcript.trim()}`;
                    });

                    await waitForMillis(500);

                    setSendingInSeconds(0);
                } else {
                    if (decision.increaseTimer > 0) {
                        console.log('increaseTimer', decision.increaseTimer);
                        setSendingInSeconds((prev) => {
                            console.log('prev 30 seconds', prev);
                            return prev + decision.increaseTimer;
                        });

                        await waitForMillis(1000);

                        setNextMessage((prev) => {
                            return `${prev}\n${transcript.trim()}`;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('STT error:', error);
            toast.error('Failed to transcribe audio');
        } finally {
            setIsTranscripting(false);
        }
    };

    const sendMessage = async ({
        message,
    }: {
        message: string;
    }) => {
        try {
            setGeneratingAiResponse(true);

            // 1. Send the user message
            await axiosCustom.post('/api/chat-llm/chat-add/notesAdd', {
                threadId,
                type: 'text',
                content: message,
                tags: [],
                fileUrl: '',
                fileUrlArr: '',
            });

            // 2. Trigger AI to generate a response
            await axiosCustom.post('/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage', {
                threadId
            });

            // 3. Optionally fetch the latest messages to get AI response
            const msgsRes = await axiosCustom.post('/api/chat-llm/crud/notesGet', {
                threadId,
            });

            const docs: ConversationItem[] = msgsRes.data?.docs ?? [];

            // Add all documents to conversation as turns
            if (docs.length > 0) {
                setConversation(docs);

                // Get the latest AI message for TTS
                const latestMessage = docs[docs.length - 1];
                const aiText = latestMessage?.content || latestMessage?.fileContentAi || '';

                // Play TTS if there's AI text and not muted
                if (aiText && !isMuted && ttsControlsRef.current) {
                    let tempAiText = aiText.replace('AI: ', '');
                    await ttsControlsRef.current.playTts(tempAiText);
                }
            }

            // Scroll to the bottom of the conversation
            const messageItem = document.getElementById(`message-item-${docs[docs.length - 1]._id}`);
            if (messageItem) {
                messageItem.scrollIntoView({ behavior: 'smooth' });
            }

            // Reset the timer after sending
            setSendingInSeconds(5);

        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
            setGeneratingAiResponse(false);
        } finally {
            setGeneratingAiResponse(false);
        }
    };

    const renderStats = () => {
        return (
            <div>
                {/* Stats */}
                <div className="bg-white/80 backdrop-blur-sm rounded p-2 mt-2 border border-gray-200/50 shadow-sm">
                    {/* Header */}
                    <div
                        className="inline-block mr-3 bg-blue-500 rounded-md px-2 text-white flex"
                        style={{
                            height: '24px',
                        }}
                    >
                        <div
                            className="flex items-center justify-center"
                            style={{
                                height: '24px',
                            }}
                        >
                            <LucideBrain
                                size={16}
                                className="inline-block align-text-bottom mr-[3px] text-white inline-block"
                            />
                            <span className="text-xs inline-block">AI Call</span>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="inline-block mr-3">
                        <LucideClock size={24} className="inline-block align-text-bottom mr-[3px] text-[#42a5f5]" />
                        Timer: {timer}s
                    </div>

                    {/* Voice status */}
                    <div className="inline-block mr-3">
                        <LucideMic size={24} className="inline-block align-text-bottom mr-[3px] text-[#42a5f5]" />
                        {ttsStatus === 'tts-speaking' ? 'AI speaking' : status}
                    </div>

                    {/* Sending in seconds */}
                    {sendingInSeconds > 0 && (
                        <div className="inline-block mr-3">
                            <LucideTimer
                                size={24}
                                className="inline-block align-text-bottom mr-[3px] text-[#42a5f5]"
                            />
                            Sending in: {sendingInSeconds}s
                        </div>
                    )}

                    {/* Transcripting */}
                    {isTranscripting && (
                        <div className="inline-block mr-3">
                            <LucideSpeech
                                size={24}
                                className={`inline-block align-text-bottom mr-[3px] ${isTranscripting ? "text-[#ffc107]" : "text-[#aaa]"}`}
                            />
                            Transcripting
                        </div>
                    )}

                    {/* Generating AI response */}
                    {generatingAiResponse && (
                        <div className="inline-block mr-3">
                            <LucideBrain
                                size={24}
                                className={`inline-block align-text-bottom mr-[3px] ${generatingAiResponse ? "text-[#42e49f]" : "text-[#aaa]"}`}
                            />
                            Generating
                        </div>
                    )}

                    {/* TTS Generating */}
                    {ttsGenerating === 'tts-generating' && (
                        <div className="inline-block mr-3">
                            <LucideVolume2
                                size={24}
                                className="inline-block align-text-bottom mr-[3px] text-[#ff9800] animate-spin"
                            />
                            Generating
                        </div>
                    )}

                    {/* TTS Speaking */}
                    {ttsStatus === 'tts-speaking' && (
                        <div className="inline-block">
                            <LucideVolume2
                                size={24}
                                className="inline-block align-text-bottom mr-[3px] text-[#ff9800] animate-pulse"
                            />
                            Speaking
                        </div>
                    )}

                </div>

                {/* Improved Send Timing Controls */}
                <div className="bg-white/80 backdrop-blur-sm rounded p-2 mt-2 border border-gray-200/50 shadow-sm">
                    {/* Header with countdown */}
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-700">Next message in</span>
                        </div>
                        <div className="text-base font-bold text-blue-600 bg-blue-50 px-2 py-[2px] rounded">
                            {sendingInSeconds}s
                        </div>
                    </div>

                    {/* Progress bar */}
                    {sendingInSeconds <= 30 && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mb-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.max(0, (sendingInSeconds / 30) * 100)}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-1">
                        {/* Send Now */}
                        {sendingInSeconds >= 1 && (
                            <button
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-2 py-1.5 rounded-md shadow hover:shadow-md text-xs flex items-center gap-1 transition-all duration-150"
                                onClick={() => setSendingInSeconds(0)}
                                style={{ minWidth: 0 }}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send
                            </button>
                        )}

                        {/* Quick extensions */}
                        <div className="flex flex-wrap gap-0.5">
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 10
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(10)}
                            >
                                +10s
                            </button>
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 20
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(20)}
                            >
                                +20s
                            </button>
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 30
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(30)}
                            >
                                +30s
                            </button>
                        </div>

                        {/* Longer extensions */}
                        <div className="flex flex-wrap gap-0.5">
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 45
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(45)}
                            >
                                +45s
                            </button>
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 60
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(60)}
                            >
                                +1m
                            </button>
                        </div>

                        {/* Long extensions */}
                        <div className="flex flex-wrap gap-0.5">
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 120
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(120)}
                            >
                                +2m
                            </button>
                            <button
                                className={`px-2 py-1 rounded font-medium text-xs transition-all duration-150 ${sendingInSeconds === 300
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm'
                                    }`}
                                onClick={() => setSendingInSeconds(300)}
                            >
                                +5m
                            </button>
                        </div>
                    </div>
                </div>

                {/* TTS Preview */}
                {nextMessage.trim().length > 0 && (
                    <div className="mt-6 flex items-center gap-3 px-3 py-2 rounded bg-gradient-to-r from-blue-100 via-blue-50 to-white shadow">
                        <LucideSpeech className="text-blue-400" size={24} />
                        <div className="flex-1 overflow-x-auto scrollbar-thin">
                            <span className="font-medium text-blue-900">Voice Preview:</span>
                            <span className="ml-2 text-blue-700">{nextMessage.trim()}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderConversation = () => {
        if (conversation.length === 0) {
            return (
                <div className="bg-white/80 backdrop-blur-sm rounded p-2 mt-2 border border-gray-200/50 shadow-sm">
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-lg">No messages yet</p>
                        <p className="text-sm mt-2">Speak to start the conversation</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded p-2 mt-2 border border-gray-200/50 shadow-sm">
                <div
                    className="overflow-y-auto px-2"
                    style={{
                        height: '50vh',
                        overflowY: 'auto'
                    }}
                >
                    {conversation.map((turn) => {
                        // Determine who is speaking based on isAi field
                        const isUser = !turn.isAi;
                        // Use _id as the unique key
                        return (
                            <div
                                key={`message-item-${turn._id}`}
                                id={`message-item-${turn._id}`}
                                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isUser
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : 'bg-gray-200 text-gray-800 rounded-bl-md'
                                        }`}
                                >
                                    {/* Display content for user/AI */}
                                    {turn.content}
                                    {turn.createdAtUtc && (
                                        <div className={`text-xs mt-1 opacity-70 ${isUser ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {new Date(turn.createdAtUtc).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {generatingAiResponse && (
                        <div className="flex justify-start mt-2">
                            <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                                    <span className="text-sm">AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMainContent = () => {
        return (
            <div className="px-2">
                {renderStats()}
                {renderConversation()}
            </div>
        );
    }

    const renderButtons = () => {
        return (
            <div
                style={{
                    height: "60px",
                }}
            >
                <div
                    className="flex items-center justify-center"
                >

                    {/* Toggle Microphone */}
                    <button
                        className={`${vad.listening ? "bg-blue-500" : "bg-red-500"} shadow mr-2`}
                        onClick={vad.toggle}
                        style={{
                            height: '40px',
                            width: '40px',
                            textAlign: 'center',
                            borderRadius: '50%',
                        }}
                    >
                        {vad.listening ? (
                            <>
                                <LucideMic
                                    size={25}
                                    className="text-white inline-block"
                                />
                            </>
                        ) : (
                            <>
                                <LucideMicOff
                                    size={25}
                                    className="text-white inline-block"
                                />
                            </>
                        )}
                    </button>

                    {/* TTS Controls */}
                    <TtsControls
                        ref={ttsControlsRef}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                        ttsStatus={ttsStatus}
                        setTtsStatus={setTtsStatus}
                        ttsGenerating={ttsGenerating}
                        setTtsGenerating={setTtsGenerating}
                        ttsModelProvider={threadSettings.ttsModelProvider}
                        ttsModelName={threadSettings.ttsModelName}
                    />

                    {/* Settings */}
                    <button
                        className={`bg-gray-500 shadow mr-2`}
                        style={{
                            height: '40px',
                            width: '40px',
                            textAlign: 'center',
                            borderRadius: '50%',
                        }}
                        title="Settings"
                    >
                        <LucideSettings
                            size={25}
                            className="text-white inline-block"
                        />
                    </button>

                    {/* End Call */}
                    <button
                        onClick={() => {
                            if (ttsControlsRef.current) {
                                ttsControlsRef.current.stopTts();
                            }
                            vad.toggle();
                            navigate(`/user/chat?id=${threadId}`);
                        }}
                        // className="p-3.5 rounded-full bg-red-500/85 text-white hover:bg-red-600/95 backdrop-blur-md transition-all duration-300 shadow-lg shadow-red-900/40"
                        className={`bg-red-500 shadow`}
                        style={{
                            height: '40px',
                            width: '40px',
                            textAlign: 'center',
                            borderRadius: '50%',
                        }}
                        title="End Call"
                    >
                        <LucidePhoneOff
                            size={25}
                            className="text-white inline-block"
                        />
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div style={{ height: `calc(100vh - 60px)` }}>
            {/* Main Content */}
            <div
                style={{
                    height: "calc(100vh - 60px - 60px)",
                    overflowY: "auto"
                }}
            >
                {renderMainContent()}
            </div>

            {/* Buttons */}
            {renderButtons()}
        </div>
    );
};

const AiCallWrapper = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const authState = useAtomValue(stateJotaiAuthAtom);

    const [threadId, setThreadId] = useState('');
    const [openaiCompatibleConfigs, setOpenaiCompatibleConfigs] = useState<Array<{ _id: string }>>([]);

    useEffect(() => {
        if (authState.isLoggedIn === 'false') {
            navigate('/login');
        }
    }, [authState.isLoggedIn, navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const chatId = queryParams.get('id');
        if (chatId) {
            setThreadId(chatId);
        } else {
            navigate('/user/chat');
        }
    }, [location.search, navigate]);

    useEffect(() => {
        const fetchOpenaiCompatibleConfigs = async () => {
            try {
                const response = await axiosCustom.post<{ docs?: Array<{ _id: string }> }>(
                    `/api/user/openai-compatible-model/crud/openaiCompatibleModelGet`,
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );
                let tempOpenaiCompatibleConfigs = [] as any[];
                if (response.data.docs && response.data.docs.length > 0) {
                    tempOpenaiCompatibleConfigs = response.data.docs.filter(
                        (model: any) => {
                            return model.isInputModalityText === 'true' &&
                                model.isOutputModalityText === 'true'
                        }
                    );
                }
                // Filter and set only configs that support both input modality text and output modality text
                setOpenaiCompatibleConfigs(tempOpenaiCompatibleConfigs);
            } catch (error) {
                console.error('Error fetching OpenAI compatible configs:', error);
            }
        };
        fetchOpenaiCompatibleConfigs();
    }, []);

    if (!threadId) {
        return null;
    }

    const areApiKeysValid = () => {
        let isValidStt = false;
        let isValidLlm = false;
        let isValidTts = false;

        // STT: Requires OpenAI (Whisper), Groq, or LocalAI
        if (authState.apiKeyGroqValid || authState.apiKeyOpenaiValid || authState.apiKeyLocalaiValid) {
            isValidStt = true;
        }

        // LLM: Groq, OpenRouter, Ollama, LocalAI, or at least one saved OpenAI-compatible endpoint
        if (
            authState.apiKeyGroqValid ||
            authState.apiKeyOpenrouterValid ||
            authState.apiKeyOllamaValid ||
            authState.apiKeyLocalaiValid ||
            openaiCompatibleConfigs.length > 0
        ) {
            isValidLlm = true;
        }

        // TTS: Requires OpenAI, Groq, or LocalAI
        if (authState.apiKeyOpenaiValid || authState.apiKeyGroqValid || authState.apiKeyLocalaiValid) {
            isValidTts = true;
        }

        return {
            stt: isValidStt,
            llm: isValidLlm,
            tts: isValidTts,
            all: isValidStt && isValidLlm && isValidTts,
        };
    };

    const areApiKeysValidResult = areApiKeysValid();

    const renderConfigureApiKeys = () => {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black">
                <div className="p-3 w-full max-w-sm rounded border border-blue-100 bg-white/90 backdrop-blur flex flex-col items-center shadow animate-fade-in">
                    <div className="flex items-center gap-1 mb-2">
                        <span className="inline-block w-2 h-2 rounded bg-blue-500 animate-pulse" />
                        <h2 className="text-base font-bold text-blue-900">AI Call Setup Needed</h2>
                    </div>
                    <p className="text-xs text-blue-800 mb-3 text-center">
                        You need to configure these missing API keys for AI Calling:
                    </p>

                    <div className="space-y-2 w-full mb-3">
                        {/* Speech-to-Text (STT) */}
                        {!areApiKeysValidResult.stt && (
                            <div className="flex items-center justify-between bg-blue-50 border-l-2 border-blue-300 px-2 py-1 rounded-sm">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded border bg-red-300 border-red-300 animate-pulse"></span>
                                    <span className="font-medium text-blue-900 text-xs">
                                        STT
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <button
                                        onClick={() => navigate(`/user/setting/api-key?focus=stt`)}
                                        className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Configure
                                    </button>
                                    <div className="text-[10px] text-blue-900/80 mt-0.5 text-right">
                                        {authState.apiKeyGroqValid ? null : <span>Groq,&nbsp;</span>}
                                        {authState.apiKeyOpenaiValid ? null : <span>OpenAI,&nbsp;</span>}
                                        {authState.apiKeyLocalaiValid ? null : <span>LocalAI</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* LLM */}
                        {!areApiKeysValidResult.llm && (
                            <div className="flex items-center justify-between bg-indigo-50 border-l-2 border-indigo-300 px-2 py-1 rounded-sm">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded border bg-red-300 border-red-300 animate-pulse"></span>
                                    <span className="font-medium text-indigo-900 text-xs">
                                        LLM
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <button
                                        onClick={() => navigate(`/user/setting/api-key?focus=llm`)}
                                        className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        Configure
                                    </button>
                                    <div className="text-[10px] text-indigo-900/80 mt-0.5 text-right">
                                        {authState.apiKeyGroqValid ? null : <span>Groq,&nbsp;</span>}
                                        {authState.apiKeyOpenrouterValid ? null : <span>OpenRouter,&nbsp;</span>}
                                        {authState.apiKeyOllamaValid ? null : <span>Ollama,&nbsp;</span>}
                                        {openaiCompatibleConfigs.length > 0 ? null : <span>OpenAI-compatible</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Text-to-Speech (TTS) */}
                        {!areApiKeysValidResult.tts && (
                            <div className="flex items-center justify-between bg-purple-50 border-l-2 border-purple-300 px-2 py-1 rounded-sm">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded border bg-red-300 border-red-300 animate-pulse"></span>
                                    <span className="font-medium text-purple-900 text-xs">
                                        TTS
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <button
                                        onClick={() => navigate(`/user/setting/api-key?focus=tts`)}
                                        className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-purple-700 text-white hover:bg-purple-800"
                                    >
                                        Configure
                                    </button>
                                    <div className="text-[10px] text-purple-900/80 mt-0.5 text-right">
                                        {authState.apiKeyOpenaiValid ? null : <span>OpenAI,&nbsp;</span>}
                                        {authState.apiKeyGroqValid ? null : <span>Groq,&nbsp;</span>}
                                        {authState.apiKeyLocalaiValid ? null : <span>LocalAI</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {(areApiKeysValidResult.stt || areApiKeysValidResult.llm || areApiKeysValidResult.tts) ? null : (
                            <div className="text-[11px] text-gray-700 text-center py-1">No valid API keys found.</div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-center mt-1 w-full">
                        <button
                            onClick={() => navigate(`/user/chat?id=${threadId}`)}
                            className="px-2 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => navigate(`/user/setting/api-key`)}
                            className="px-2 py-1 rounded bg-blue-700 text-white hover:bg-blue-800 text-xs font-semibold"
                        >
                            Configure All
                        </button>
                    </div>
                    <div className="mt-3 text-[10px] text-gray-500 text-center">
                        Need help? See docs for setup tips.<br />
                        <b>Missing keys are shown above.</b>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Fragment>
            {areApiKeysValidResult.all ? (
                <AiCallNew threadId={threadId} />
            ) : (
                <Fragment>
                    {renderConfigureApiKeys()}
                </Fragment>
            )}
        </Fragment>
    );
};

export default AiCallWrapper;