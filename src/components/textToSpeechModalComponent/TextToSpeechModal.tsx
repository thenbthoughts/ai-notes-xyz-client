import { useAtom } from "jotai";
import { jotaiTtsModalOpenStatus } from "../../jotai/stateJotaiTextToSpeechModal";
import Modal from "react-modal";
import useScreenWidth from "../../hooks/useScreenWidth";
import { useEffect } from "react";
import { LucidePlay, LucideStopCircle } from "lucide-react";

const getModalStyles = (isMobile: boolean) => ({
    overlay: {
        backgroundColor: 'rgb(0 0 0 / 75%)',
        zIndex: 1000,
    },
    content: isMobile ? {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        margin: '0',
        padding: '0',
        border: 'none',
        borderRadius: '0',
        background: 'white',
        overflow: 'hidden',
    } : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '1200px',
        height: '85vh',
        maxHeight: '800px',
        border: 'none',
        borderRadius: '8px',
        background: 'transparent',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
});

const TextToSpeechModal = () => {
    const [ttsModalOpenStatus, setTtsModalOpenStatus] = useAtom(jotaiTtsModalOpenStatus);
    const { screenSize } = useScreenWidth();

    useEffect(() => {
        if (ttsModalOpenStatus.playingStatus === false) {
            return;
        }

        console.log('ttsModalOpenStatus.currentTextIndex: ', ttsModalOpenStatus.currentTextIndex);
        if(ttsModalOpenStatus.currentTextIndex <= -1) {
            setTtsModalOpenStatus(prev => ({ ...prev, currentTextIndex: 0 }));
            return;
        }

        if(ttsModalOpenStatus.currentTextIndex >= ttsModalOpenStatus.textSplit.length) {
            setTtsModalOpenStatus(prev => ({ ...prev, playingStatus: false }));
            return;
        }

        speakText({ playIndex: ttsModalOpenStatus.currentTextIndex });
    }, [ttsModalOpenStatus.playingStatus, ttsModalOpenStatus.currentTextIndex]);

    const handlePlay = () => {
        setTtsModalOpenStatus(prev => ({ ...prev, playingStatus: true }));
    };

    const handleStop = () => {
        speechSynthesis.cancel();
        setTtsModalOpenStatus(prev => ({ ...prev, playingStatus: false }));
    };

    const speakText = ({
        playIndex,
    }: {
        playIndex: number;
    }) => {
        console.log('playIndex: ', playIndex);
        try {
            console.log('ttsModalOpenStatus.textSplit: ', ttsModalOpenStatus.textSplit);
            const text = ttsModalOpenStatus.textSplit[playIndex];
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                setTtsModalOpenStatus(prev => ({ ...prev, currentTextIndex: playIndex + 1 }));
            };
            utterance.onerror = (event) => {
                console.error('Error speaking text: ', event);
            };
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error speaking text: ', error);
        }
    }

    return (
        <Modal
            isOpen={ttsModalOpenStatus.openStatus}
            onRequestClose={() => setTtsModalOpenStatus({ ...ttsModalOpenStatus, openStatus: false })}
            style={getModalStyles(screenSize === 'sm' ? true : false)}
            contentLabel="Text To Speech Modal"
        >
            <div className="container mx-auto bg-white rounded-sm p-4" style={{ maxWidth: '600px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Text To Speech</h1>
                    <button
                        onClick={() => setTtsModalOpenStatus({ ...ttsModalOpenStatus, openStatus: false })}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        X
                    </button>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 mb-4">
                    {!ttsModalOpenStatus.playingStatus ? (
                        <button
                            onClick={handlePlay}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-sm transition"
                        >
                            <LucidePlay size={20} />
                            <span>Play</span>
                        </button>
                    ) : (
                        <>
                                <button
                                    onClick={handleStop}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-sm transition"
                                >
                                    <LucideStopCircle size={20} />
                                    <span>Stop</span>
                                </button>
                        </>
                    )}
                </div>

                {/* Text Content */}
                <div className="max-h-96 overflow-y-auto">
                    <div className="mb-4 p-3 bg-gray-50 rounded-sm">
                        <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
                            <p className="text-gray-800 whitespace-pre-wrap">{ttsModalOpenStatus.text}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TextToSpeechModal;