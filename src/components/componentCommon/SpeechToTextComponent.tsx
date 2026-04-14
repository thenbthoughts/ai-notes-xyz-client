

import { Fragment, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosCustom from "../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import {
    LucideAudioLines,
    LucideLoader2,
    LucideMicOff,
    LucidePause,
    LucidePlay,
} from 'lucide-react';
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

    const btnIcon =
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-zinc-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25 disabled:opacity-50';

    return (
        <Fragment>
            {!isRecording && !isTranscribing && (
                <button
                    type="button"
                    className={
                        btnIcon +
                        ' border-zinc-200/80 bg-white shadow-sm hover:bg-zinc-50 hover:text-zinc-900'
                    }
                    onClick={handleStartRecording}
                    disabled={isTranscribing}
                    title="Dictate to title (speech to text)"
                >
                    <LucideAudioLines className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
            )}

            {isRecording && (
                <Fragment>
                    {isPaused && (
                        <button
                            type="button"
                            className={
                                btnIcon +
                                ' border-emerald-200/80 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90'
                            }
                            onClick={handleTogglePauseResume}
                            title="Resume recording"
                        >
                            <LucidePlay className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </button>
                    )}
                    {!isPaused && (
                        <Fragment>
                            <button
                                type="button"
                                className={
                                    btnIcon +
                                    ' border-red-200/80 bg-red-50 text-red-800 hover:bg-red-100/90'
                                }
                                onClick={handleStopRecording}
                                title="Stop and transcribe"
                            >
                                <LucideMicOff className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </button>

                            <button
                                type="button"
                                className={
                                    btnIcon +
                                    ' border-amber-200/80 bg-amber-50 text-amber-900 hover:bg-amber-100/90'
                                }
                                onClick={handleTogglePauseResume}
                                title="Pause recording"
                            >
                                <LucidePause className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </button>
                        </Fragment>
                    )}
                </Fragment>
            )}

            {isTranscribing && (
                <button
                    type="button"
                    className={
                        btnIcon +
                        ' cursor-wait border-zinc-200/80 bg-zinc-50 text-zinc-500'
                    }
                    disabled
                    title="Converting speech to text…"
                >
                    <LucideLoader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
                </button>
            )}
        </Fragment>
    );
};

export default SpeechToText;