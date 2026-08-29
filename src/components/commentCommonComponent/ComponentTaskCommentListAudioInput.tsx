import { Fragment } from "react/jsx-runtime";
import envKeys from "../../config/envKeys";
import toast from "react-hot-toast";
import { useEffect } from "react";
import axiosCustom from "../../config/axiosCustom";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { LucideMic, LucidePause, LucidePlay, LucideMicOff } from "lucide-react";
import { ICommentType } from "./CommentCommonComponent";
import { commentAddAudioToTextAxios } from "./commentCommonAxiosUtils";
import { uploadFeatureFile } from "../../utils/featureFileUpload";

const ComponentUploadFile = ({
    entityId,
    setTaskCommentsReloadRandomNumCurrent,
    commentType,
}: {
    entityId: string;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
    commentType: ICommentType;
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

            const fileName = await uploadFeatureFile({
                file: tempFile,
                parentEntityId: entityId,
                apiUrl: envKeys.API_URL,
            });

            // add a comment
            // First add the audio file
            await axiosCustom.post("/api/comment-common/crud/commentCommonAdd", {
                // comment type and reference id
                commentType,
                entityId,

                // is ai
                isAi: false,

                // comment text
                commentText: '',

                // file type, url, title, description
                fileType: 'audio',
                fileUrl: fileName,
                fileTitle: 'audio.webm',
                fileDescription: 'Audio recording',
            });

            setTaskCommentsReloadRandomNumCurrent(Math.random() * 1_000_000);

            await commentAddAudioToTextAxios({
                fileName: fileName,
                commentType,
                entityId,
            })

            // // audio to text
            // const audioToTextRes = await axiosCustom.post("/api/llm/crud/audioToText", {
            //     fileUrl: response.data.fileName,
            // });
            // const audioToTextResData = audioToTextRes.data;
            // const text = audioToTextResData.data.contentAudioToText;

            // if (audioToTextResData.error !== '') {
            //     toast.error(audioToTextResData.error);
            //     return;
            // }

            // // Then add a comment with the transcribed text
            // if (text !== '') {
            //     await axiosCustom.post("/api/comment-common/crud/commentCommonAdd", {
            //         // comment type and reference id
            //         commentType,
            //         entityId,

            //         // is ai
            //         isAi: false,

            //         // 
            //         commentText: text,

            //         // file
            //         fileType: '',
            //         fileUrl: '',
            //         fileTitle: '',
            //         fileDescription: '',
            //     });
            // }

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

            <h4 className="text-md font-semibold mb-2">Audio Comment</h4>

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