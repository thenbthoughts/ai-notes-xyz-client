import { Fragment } from "react/jsx-runtime";
import envKeys from "../../../../../../config/envKeys";
import toast from "react-hot-toast";
import { useEffect } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LucideMic, LucidePause, LucidePlay, LucideMicOff } from "lucide-react";
import { uploadFeatureFile } from "../../../../../../utils/featureFileUpload";

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

export default ComponentRecordAudio;