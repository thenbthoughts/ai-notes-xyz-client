import { Fragment } from "react/jsx-runtime";
import envKeys from "../../../../../config/envKeys";
import toast from "react-hot-toast";
import axios from "axios";
import { useEffect } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LucideMic, LucidePause, LucidePlay, LucideMicOff } from "lucide-react";

const ComponentUploadFile = ({
    setRefreshParentRandomNum,
    threadId,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>;
    threadId: string;
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

            const config = {
                method: 'post',
                url: `/api/chat-llm/chat-add/notesAdd`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    threadId: threadId,
                    type: fileType,
                    content: `Image: ${tempFilePath}`,
                    visibility: 'public',
                    tags: [],
                    fileUrl: tempFilePath,
                    fileUrlArr: [],
                }
            };

            try {
                const response = await axiosCustom.request(config);
                console.log(JSON.stringify(response.data));
                // Handle the response
                toast.success(`Image added is added successfully!`);
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

            setRefreshParentRandomNum(Math.random() * 1_000_000);

            await apiAddNote({
                tempFilePath: response.data.fileName
            });

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
        </Fragment>
    )
};

export default ComponentUploadFile;