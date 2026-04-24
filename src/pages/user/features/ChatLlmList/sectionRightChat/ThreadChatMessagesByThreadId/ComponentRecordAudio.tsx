import { Fragment } from "react/jsx-runtime";
import envKeys from "../../../../../../config/envKeys";
import toast from "react-hot-toast";
import { useEffect } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LucideMic, LucidePause, LucidePlay, LucideSquare } from "lucide-react";
import { uploadFeatureFile, UPLOAD_PATH_LAYOUT_THREAD_OPENCODE_INPUTFILES } from "../../../../../../utils/featureFileUpload";

const btnIdle =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40';

const btnRecording =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200/90 bg-rose-50 text-rose-700 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40';

const ComponentRecordAudio = ({
    setRefreshParentRandomNum,
    threadId,
    setChatInputValue,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>;
    threadId: string;
    setChatInputValue: React.Dispatch<React.SetStateAction<string>>;
}) => {

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
        console.log(recordingBlob);
        handleAudioUpload(recordingBlob);
        // recordingBlob will be present at this point after 'stopRecording' has been called
    }, [recordingBlob])

    const apiAddNote = async ({
        tempFilePath
    }: {
        tempFilePath: string,
    }) => {
        try {
            console.log(tempFilePath,'called apiAddNote');
            // Call axios

            // fileType (text, image, video, location, contacts, file)
            let fileType = 'file';
            if (tempFilePath.endsWith('.jpg') || tempFilePath.endsWith('.jpeg') || tempFilePath.endsWith('.png')) {
                fileType = 'image';
            } else if (tempFilePath.endsWith('.mp4') || tempFilePath.endsWith('.mov') || tempFilePath.endsWith('.avi')) {
                fileType = 'video';
            } else if (tempFilePath.endsWith('.pdf') || tempFilePath.endsWith('.doc') || tempFilePath.endsWith('.docx') || tempFilePath.endsWith('.txt')) {
                fileType = 'file';
            } else if (tempFilePath.endsWith('.webm') || tempFilePath.endsWith('.mp3') || tempFilePath.endsWith('.wav')) {
                fileType = 'audio';
            }

            try {
                const response = await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
                    threadId: threadId,
                    type: fileType,
                    content: `Image: ${tempFilePath}`,
                    visibility: 'public',
                    tags: [],
                    fileUrl: tempFilePath,
                    fileUrlArr: [],
                });
                console.log(JSON.stringify(response.data));

                // refresh parent random num
                setRefreshParentRandomNum(Math.random() * 1_000_000);

                // Handle the response
                toast.success(`Audio added is added successfully!`);
            } catch (error) {
                console.error(error);
                toast.error('Error adding note. Please try again.');
                // Handle the error
            }

        } catch (error) {
            console.error(error);
            toast.error('Error adding note. Please try again.');
        }
    };

    const setChatInputAudioText = async (tempFilePath: string) => {
        try {
            const response = await axiosCustom.post("/api/llm/crud/audioToText", {
                fileUrl: tempFilePath,
            });
            const audioText = response.data.data.contentAudioToText;

            // Set the audio text to the chat input
            if (audioText && audioText.trim() !== '') {
                setChatInputValue((prev) => {
                    if(prev === '') {
                        return audioText;
                    } else {
                        return `${prev}\n${audioText}`;
                    }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Error getting audio text! Please try again.');
            return '';
        }
    }

    const handleAudioUpload = async (blob: Blob) => {
        try {
            const toastDismissId = toast.loading('Loading...');
            console.log(blob);

            console.log(new File([blob], 'audio.webm', { type: 'audio/webm' }));

            const tempFile = new File([blob], 'audio.webm', { type: 'audio/webm' });

            // upload to s3
            const fileName = await uploadFeatureFile({
                file: tempFile,
                parentEntityId: threadId,
                apiUrl: envKeys.API_URL,
                pathLayout: UPLOAD_PATH_LAYOUT_THREAD_OPENCODE_INPUTFILES,
            });

            // add to chat thread
            await apiAddNote({
                tempFilePath: fileName
            });

            // step 3: get audio text and add to chat input
            const audioText = await setChatInputAudioText(fileName);
            console.log(audioText,'audioText');

            toast.success('Audio uploaded successfully!', {
                id: 'audio-upload',
            });

            setRefreshParentRandomNum(Math.random() * 1_000_000);

            toast.dismiss(toastDismissId);
        } catch (error) {
            console.error(error);
            toast.error('Error uploading audio!', {
                id: 'audio-upload',
            });
        }
    };

    return (
        <Fragment>

            {!isRecording && (
                <button
                    type="button"
                    title="Record voice"
                    aria-label="Record voice"
                    className={btnIdle}
                    onClick={() => {
                        startRecording();
                    }}
                >
                    <LucideMic className="h-4 w-4" strokeWidth={2} />
                </button>
            )}

            {isRecording && (
                <Fragment>
                    {isPaused && (
                        <button
                            type="button"
                            title="Resume recording"
                            aria-label="Resume recording"
                            className={btnRecording}
                            onClick={() => {
                                togglePauseResume();
                            }}
                        >
                            <LucidePlay className="h-4 w-4" strokeWidth={2} />
                        </button>
                    )}
                    {!isPaused && (
                        <Fragment>
                            <button
                                type="button"
                                title="Stop and send recording"
                                aria-label="Stop and send recording"
                                className={btnRecording}
                                onClick={() => {
                                    stopRecording();
                                }}
                            >
                                <LucideSquare className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                            </button>

                            <button
                                type="button"
                                title="Pause recording"
                                aria-label="Pause recording"
                                className={btnRecording}
                                onClick={() => {
                                    togglePauseResume();
                                }}
                            >
                                <LucidePause className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </Fragment>
                    )}
                </Fragment>
            )}
        </Fragment>
    )
};

export default ComponentRecordAudio;