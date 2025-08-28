import { Fragment } from "react/jsx-runtime";
import envKeys from "../../../../../config/envKeys";
import toast from "react-hot-toast";
import axios from "axios";
import { useEffect } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LucideMic, LucidePause, LucidePlay, LucideMicOff } from "lucide-react";

const ComponentUploadFile = ({
    taskId,
    setTaskCommentsReloadRandomNumCurrent,
}: {
    taskId: string;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
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

    const handleAudioUpload = async (blob: Blob) => {
        try {
            const toastDismissId = toast.loading('Loading...');
            console.log(blob);

            console.log(new File([blob], 'audio.webm', { type: 'audio/webm' }));

            const tempFile = new File([blob], 'audio.webm', { type: 'audio/webm' });

            const formData = new FormData();
            formData.append('file', tempFile);

            const config = {
                method: 'post',
                url: `${envKeys.API_URL}/api/uploads/crudS3/uploadFile`,
                data: formData,
                withCredentials: true,
            };

            const response = await axios.request(config);

            // add a comment
            // First add the audio file
            await axiosCustom.post("/api/task-comments/crud/taskCommentAdd", {
                // task
                taskId: taskId,
                isAi: false,

                // 
                commentText: '',

                // file
                fileType: 'audio',
                fileUrl: response.data.fileName,
                fileTitle: 'audio.webm',
                fileDescription: 'Audio recording',
            });

            setTaskCommentsReloadRandomNumCurrent(Math.random() * 1_000_000);

            // audio to text
            const audioToTextRes = await axiosCustom.post("/api/llm/crud/audioToText", {
                fileUrl: response.data.fileName,
            });
            const audioToTextResData = audioToTextRes.data;
            const text = audioToTextResData.data.contentAudioToText;

            if (audioToTextResData.error !== '') {
                toast.error(audioToTextResData.error);
                return;
            }

            // Then add a comment with the transcribed text
            if (text !== '') {
                await axiosCustom.post("/api/task-comments/crud/taskCommentAdd", {
                    // task
                    taskId: taskId,
                    isAi: false,

                    // 
                    commentText: text,

                    // file
                    fileType: '',
                    fileUrl: '',
                    fileTitle: '',
                    fileDescription: '',
                });
            }

            setTaskCommentsReloadRandomNumCurrent(Math.random() * 1_000_000);

            toast.dismiss(toastDismissId);
        } catch (error) {
            console.error(error);
            toast.error('Error uploading audio!', {
                id: 'audio-upload',
            });
        }
    };

    return (
        <div className="py-2">

            <h3 className="text-lg font-semibold mb-2">Audio Comment</h3>

            {!isRecording && (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{
                        height: '40px',
                    }}
                    onClick={() => {
                        startRecording();
                    }}
                >
                    <LucideMic
                        style={{
                            height: '20px',
                        }}
                    />
                </button>
            )}

            {isRecording && (
                <Fragment>
                    {isPaused && (
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                            style={{
                                height: '40px',
                            }}
                            onClick={() => {
                                togglePauseResume();
                            }}
                        >
                            <LucidePlay
                                style={{
                                    height: '20px',
                                }}
                            />
                        </button>
                    )}
                    {!isPaused && (
                        <Fragment>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                                style={{
                                    height: '40px',
                                }}
                                onClick={() => {
                                    stopRecording();
                                }}
                            >
                                <LucideMicOff
                                    style={{
                                        height: '20px',
                                    }}
                                />
                            </button>

                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                                style={{
                                    height: '40px',
                                }}
                                onClick={() => {
                                    togglePauseResume();
                                }}
                            >
                                <LucidePause
                                    style={{
                                        height: '20px',
                                    }}
                                />
                            </button>
                        </Fragment>
                    )}
                </Fragment>
            )}
        </div>
    )
};

export default ComponentUploadFile;