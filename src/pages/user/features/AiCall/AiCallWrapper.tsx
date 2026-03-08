import { useEffect, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import { LucideMic, LucideMicOff, LucidePhoneOff, LucideSettings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import stateJotaiAuthAtom from "../../../../jotai/stateJotaiAuth";

const AiCallNew = ({
    threadId,
}: {
    threadId: string;
}) => {
    const [status, setStatus] = useState<"idle" | "listening" | "speaking">("idle");
    const navigate = useNavigate();
    const onSpeechStart = () => {
        setStatus("speaking");
    };

    const onSpeechEnd = (audio: Float32Array) => {
        setStatus("listening");
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

    useEffect(() => {
        if (!vad.listening) {
            setStatus("idle");
        }
    }, [vad.listening]);

    return (
        <div style={{ height: `calc(100vh - 60px)` }}>
            {/* Main Content */}
            <div
                style={{
                    height: "calc(100vh - 60px - 60px)",
                    overflowY: "auto"
                }}
            >
                <div className="status-badge">
                    <span className={`dot ${vad.listening ? "active" : ""}`} />
                    {status}
                </div>
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