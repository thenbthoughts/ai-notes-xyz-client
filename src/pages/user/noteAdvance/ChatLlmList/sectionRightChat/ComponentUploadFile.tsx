import { Fragment } from "react/jsx-runtime";
import toast from "react-hot-toast";
import { ChangeEvent, useRef } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import { LucideFile } from "lucide-react";
import envKeys from "../../../../../config/envKeys";
import axios from "axios";

// Simple utility to extract text from any file type
const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                resolve(`[Binary file: ${file.name}]`);
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        // For text files, read as text
        if (file.type.startsWith('text/') || 
            file.name.endsWith('.txt') || 
            file.name.endsWith('.md') || 
            file.name.endsWith('.json') || 
            file.name.endsWith('.csv') ||
            file.name.endsWith('.xml') ||
            file.name.endsWith('.html') ||
            file.name.endsWith('.css') ||
            file.name.endsWith('.js') ||
            file.name.endsWith('.ts') ||
            file.name.endsWith('.py') ||
            file.name.endsWith('.java') ||
            file.name.endsWith('.cpp') ||
            file.name.endsWith('.c') ||
            file.name.endsWith('.sql')) {
            reader.readAsText(file);
        } else {
            // For other files, just return filename info
            resolve(`[File: ${file.name} (${file.type || 'unknown type'})]`);
        }
    });
};

const ComponentUploadFile = ({
    setRefreshParentRandomNum,
    threadId,
    // files,
    setFiles,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>,
    threadId: string;
    // files: string[];
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

    const addFileAsNote = async (file: File, content: string, fileUrl?: string) => {
        try {
            // Determine file type
            let fileType = 'text';
            if (file.type.startsWith('image/')) {
                fileType = 'image';
            } else if (file.type.startsWith('video/')) {
                fileType = 'video';
            } else if (file.type.startsWith('audio/')) {
                fileType = 'audio';
            }
            
            await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
                threadId: threadId,
                type: fileType,
                content: content,
                visibility: 'public',
                tags: [],
                fileUrl: fileUrl || undefined,
                fileUrlArr: [],
                imagePathsArr: []
            });

            setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));

            // process notes
            await axiosCustom.post("/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage", {
                threadId: threadId,
            });

            toast.success(`File "${file.name}" added successfully!`);
        } catch (error) {
            console.error(error);
            toast.error('Error adding file. Please try again.');
        }
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