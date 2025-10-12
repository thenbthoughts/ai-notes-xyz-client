import axiosCustom from "../../config/axiosCustom";
import toast from "react-hot-toast";

export const commentAddAudioToTextAxios = async ({
    fileName,
    commentType,
    entityId,
}:{
    fileName: string
    commentType: string
    entityId: string
}) => {
    try {
        // audio to text
        const audioToTextRes = await axiosCustom.post("/api/llm/crud/audioToText", {
            fileUrl: fileName,
        });
        const audioToTextResData = audioToTextRes.data;
        const text = audioToTextResData.data.contentAudioToText;

        if (audioToTextResData.error !== '') {
            toast.error(audioToTextResData.error);
            return;
        }

        // Then add a comment with the transcribed text
        if (text !== '') {
            await axiosCustom.post("/api/comment-common/crud/commentCommonAdd", {
                // comment type and reference id
                commentType,
                entityId,

                // is ai
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
    } catch (error) {
        console.error(error);
    }
}