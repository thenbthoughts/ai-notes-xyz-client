import { useEffect, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import { LucideMic, LucideMicOff, LucidePhoneOff, LucideSettings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import stateJotaiAuthAtom from "../../../../jotai/stateJotaiAuth";
import { float32ToWavBlob } from "./utils/float32ToWav";
import { uploadFeatureFile } from "../../../../utils/featureFileUpload";
import envKeys from "../../../../config/envKeys";
import axiosCustom from "../../../../config/axiosCustom";
import { toast } from "react-hot-toast";

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


const AiCallNew = ({
    threadId,
}: {
    threadId: string;
}) => {
    const [nextMessage, setNextMessage] = useState<string>("");

    const [timer, setTimer] = useState<number>(0);

    const [sendingInSeconds, setSendingInSeconds] = useState<number>(5);

    const [status, setStatus] = useState<"idle" | "listening" | "speaking">("idle");

    const [conversation, setConversation] = useState<ConversationItem[]>([]);
    const [generatingAiResponse, setGeneratingAiResponse] = useState<boolean>(false);

    const navigate = useNavigate();
    const onSpeechStart = () => {
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
        positiveSpeechThreshold: 0.75,
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
        timer,
    ]);

    // ----- functions -----
    const getStt = async ({
        audio,
    }: {
        audio: Float32Array;
    }) => {
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

            // Call STT API
            const res = await axiosCustom.post('/api/llm/crud/audioToText', {
                fileUrl: audioUrl
            });

            // Extract transcript from response
            const transcript = res.data?.data?.contentAudioToText ?? '';

            if (transcript.trim().length > 0) {
                setNextMessage((prev) => {
                    return `${prev}\n${transcript.trim()}`;
                });
            }
        } catch (error) {
            console.error('STT error:', error);
            toast.error('Failed to transcribe audio');
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

    // ----- render functions -----
    const renderTextNextMessage = () => {
        return (
            <div
                className="text-sm"
            >
                {nextMessage.length > 0 ? (
                    <p>Next message: {nextMessage}</p>
                ) : (
                    <p>Speak to start the conversation</p>
                )}
            </div>
        );
    }

    const renderWillSendStatus = () => {
        return (
            <div>
                <p>Will send...</p>
            </div>
        );
    }

    const renderMainContent = () => {
        return (
            <div>
                <div className="status-badge">
                    <span className={`dot ${vad.listening ? "active" : ""}`} />
                    {status}
                </div>
                <div>
                    <p>Timer: {timer} seconds</p>
                </div>
                <div>
                    <p>Sending in: {sendingInSeconds} seconds</p>
                </div>
                <div>
                    <p>Generating AI response: {generatingAiResponse ? "Yes" : "No"}</p>
                </div>
                {renderTextNextMessage()}
                {renderWillSendStatus()}
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
                    className="text-center"
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

    const renderConversation = () => {
        if (conversation.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-2">Speak to start the conversation</p>
                </div>
            );
        }
        return (
            <div className="px-2">
            <div
                className="overflow-y-auto px-2"
                style={{
                    height: '60vh',
                    overflowY: 'auto'
                }}
            >
                {conversation.map((turn) => {
                    // Determine who is speaking based on isAi field
                    const isUser = !turn.isAi;
                    // Use _id as the unique key
                    return (
                        <div
                            key={turn._id}
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
                    <div className="flex justify-start">
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

    if (!threadId) {
        return null;
    }

    return (
        <AiCallNew threadId={threadId} />
    );
};

export default AiCallWrapper;