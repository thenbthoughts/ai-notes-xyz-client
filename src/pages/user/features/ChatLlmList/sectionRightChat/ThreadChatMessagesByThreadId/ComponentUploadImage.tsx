import { Fragment } from "react/jsx-runtime";
import toast from "react-hot-toast";
import { ChangeEvent, useRef } from "react";
import { LucideImagePlus } from "lucide-react";
import envKeys from "../../../../../../config/envKeys";
import { uploadFeatureFile } from "../../../../../../utils/featureFileUpload";

const ComponentUploadImage = ({
    setFiles,
    threadId,
}: {
    setFiles: React.Dispatch<React.SetStateAction<string[]>>;
    threadId: string;
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const uploadFileToStorage = async (file: File): Promise<string> => {
        if (!threadId) {
            throw new Error('Thread ID is required for file upload');
        }

        return await uploadFeatureFile({
            file,
            parentEntityId: threadId,
            apiUrl: envKeys.API_URL,
        });
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
                type="button"
                title="Add image"
                aria-label="Add image"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
                onClick={() => {
                    if (fileInputRef?.current) {
                        fileInputRef.current.click()
                    }
                }}
            >
                <LucideImagePlus className="h-4 w-4" strokeWidth={2} />
            </button>
            <input
                type="file"
                onChange={handleFileChange}
                className="mb-4 p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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