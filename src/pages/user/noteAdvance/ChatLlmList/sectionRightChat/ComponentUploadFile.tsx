import { Fragment } from "react/jsx-runtime";
import envKeys from "../../../../../config/envKeys";
import toast from "react-hot-toast";
import axios from "axios";
import { ChangeEvent, useRef } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import { LucideFile } from "lucide-react";

const ComponentUploadFile = ({
    setRefreshParentRandomNum,
    threadId,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>,
    threadId: string;
}) => {

    const fileInputRef = useRef<HTMLInputElement | null>(null);

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

                setRefreshParentRandomNum(
                    Math.floor(
                        Math.random() * 1_000_000
                    )
                )

                // process notes
                await axiosCustom.post("/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage", {
                    threadId: threadId,
                });

                // Handle the response
                toast.success(`File added is added successfully!`);
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

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const config = {
                    method: 'post',
                    url: `${envKeys.API_URL}/api/uploads/crudS3/uploadFile`,
                    data: formData,
                    withCredentials: true,
                };

                toast.loading('Uploading file...', {
                    id: `upload-${i}`,
                });

                try {
                    const response = await axios.request(config);

                    setRefreshParentRandomNum(Math.random() * 1_000_000);

                    const tempFilePath = response.data.fileName;

                    await apiAddNote({
                        tempFilePath
                    })

                    toast.success('File uploaded successfully!', {
                        id: `upload-${i}`,
                    });

                    setRefreshParentRandomNum(Math.random() * 1_000_000);
                } catch (error) {
                    console.error(error);
                    toast.error('Error uploading file!', {
                        id: `upload-${i}`,
                    });
                }
            }

            // Clear the input after function handleFileChange called
            e.target.value = '';
        }
    };

    return (
        <Fragment>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                style={{
                    height: '40px'
                }}
                onClick={() => {
                    if (fileInputRef?.current) {
                        fileInputRef.current.click()
                    }
                }}
            >
                <LucideFile
                    style={{
                        height: '20px',
                    }}
                />
            </button>
            <input
                type="file"
                onChange={handleFileChange}
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                multiple
                hidden
                ref={fileInputRef}
            />
        </Fragment>
    )
};

export default ComponentUploadFile;