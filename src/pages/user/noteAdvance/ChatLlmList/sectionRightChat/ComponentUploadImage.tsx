import { Fragment } from "react/jsx-runtime";
import toast from "react-hot-toast";
import { ChangeEvent, useRef } from "react";
import { LucideCamera } from "lucide-react";
import envKeys from "../../../../../config/envKeys";
import axios from "axios";

const ComponentUploadImage = ({
    setFiles,
}: {
    setFiles: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const uploadFileToStorage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            method: 'post',
            url: `${envKeys.API_URL}/api/uploads/crudS3/uploadFile`,
            data: formData,
            withCredentials: true,
        };

        const response = await axios.request(config);
        return response.data.fileName;
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (uploadedFiles) {
            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                
                toast.loading(`Processing ${file.name}...`, {
                    id: `upload-${i}`,
                });

                try {
                    const fileUrl = await uploadFileToStorage(file);
                    setFiles(prev => [...prev, fileUrl]);
                    
                    toast.success(`File "${file.name}" processed successfully!`, {
                        id: `upload-${i}`,
                    });
                } catch (error) {
                    console.error(error);
                    toast.error(`Error processing "${file.name}"!`, {
                        id: `upload-${i}`,
                    });
                } finally {
                    toast.dismiss(`upload-${i}`);
                }
            }

            // Clear the input after processing
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
                <LucideCamera
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
                accept="image/*"
                capture="environment"
            />
        </Fragment>
    )
};

export default ComponentUploadImage;