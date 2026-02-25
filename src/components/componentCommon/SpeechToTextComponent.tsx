

import { Fragment, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosCustom from "../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LucideMic, LucidePause, LucidePlay, LucideMicOff } from "lucide-react";
import { uploadFeatureFile } from "../../utils/featureFileUpload";
import envKeys from "../../config/envKeys";

const SpeechToText = ({
    onTranscriptionComplete,
    parentEntityId,
}: {
    onTranscriptionComplete: (text: string) => void;
    parentEntityId: string;
}) => {
    const [isTranscribing, setIsTranscribing] = useState(false);

    const {
        startRecording,
        stopRecording,
        togglePauseResume,
        recordingBlob,
        isRecording,
        isPaused,
    } = useAudioRecorder();

    useEffect(() => {
        if (!recordingBlob) return;
        handleAudioTranscription(recordingBlob);
    }, [recordingBlob]);

    const convertAudioToText = async (fileUrl: string): Promise<string> => {
        try {
            const response = await axiosCustom.post("/api/llm/crud/audioToText", {
                fileUrl: fileUrl,
            });
            return response.data.data.contentAudioToText || "";
        } catch (error) {
            console.error("Error converting audio to text:", error);
            throw new Error("Failed to convert audio to text");
        }
    };

    const handleAudioTranscription = async (blob: Blob) => {
        try {
            setIsTranscribing(true);

            const toastDismissId = toast.loading('Converting speech to text...');

            // Create file from blob
            const audioFile = new File([blob], 'speech.webm', { type: 'audio/webm' });

            // Upload to storage
            const fileUrl = await uploadFeatureFile({
                file: audioFile,
                parentEntityId: parentEntityId,
                apiUrl: envKeys.API_URL,
            });

            // Convert to text
            const transcribedText = await convertAudioToText(fileUrl);

            toast.dismiss(toastDismissId);

            if (transcribedText && transcribedText.trim() !== '') {
                toast.success('Speech converted to text successfully!');
                onTranscriptionComplete?.(transcribedText);
            } else {
                toast.error('No speech detected in the recording');
                onTranscriptionComplete?.('');
            }

        } catch (error) {
            console.error("Error in speech transcription:", error);
            toast.error('Failed to convert speech to text. Please try again.');
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleStartRecording = () => {
        startRecording();
    };

    const handleStopRecording = () => {
        stopRecording();
    };

    const handleTogglePauseResume = () => {
        togglePauseResume();
    };

    return (
        <Fragment>
            {!isRecording && !isTranscribing && (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{
                        height: '40px',
                    }}
                    onClick={handleStartRecording}
                    disabled={isTranscribing}
                    title="Start recording"
                >
                    <LucideMic
                        style={{
                            height: '25px',
                        }}
                    />
                </button>
            )}

            {isRecording && (
                <Fragment>
                    {isPaused && (
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                            style={{
                                height: '40px',
                            }}
                            onClick={handleTogglePauseResume}
                            title="Resume recording"
                        >
                            <LucidePlay
                                style={{
                                    height: '25px',
                                }}
                            />
                        </button>
                    )}
                    {!isPaused && (
                        <Fragment>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                                style={{
                                    height: '40px',
                                }}
                                onClick={handleStopRecording}
                                title="Stop recording"
                            >
                                <LucideMicOff
                                    style={{
                                        height: '25px',
                                    }}
                                />
                            </button>

                            <button
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                                style={{
                                    height: '40px',
                                }}
                                onClick={handleTogglePauseResume}
                                title="Pause recording"
                            >
                                <LucidePause
                                    style={{
                                        height: '25px',
                                    }}
                                />
                            </button>
                        </Fragment>
                    )}
                </Fragment>
            )}

            {isTranscribing && (
                <button
                    className="bg-gray-500 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded cursor-wait"
                    style={{
                        height: '40px',
                    }}
                    disabled
                    title="Converting speech to text..."
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </button>
            )}
        </Fragment>
    );
};

export default SpeechToText;