import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import htmlToMarkdown from '@wcj/html-to-markdown';

import styleQuillCustom from "./scss/QuillEditorCustom1.module.scss";

import envKeys from "../../../config/envKeys";
import { uploadFeatureFile } from "../../../utils/featureFileUpload";
import SpeechToTextComponent from "../../componentCommon/SpeechToTextComponent";

const preprocessContent = (content: string): string => {
    // Convert plain text line breaks to HTML line breaks
    if (content.length > 0) {
        if (content[0] !== '<') {
            return content.replace(/\n/g, '<br>');
        }
    }
    return content;
};

type FeatureType = 'notes' | 'task' | 'lifeevent' | 'infovault' | 'chat';
type SubType = 'messages' | 'comments';

const QuillEditorCustom1 = ({
    value,
    setValue,
    featureType,
    parentEntityId,
    subType = 'messages',
}: {
    value: string;
    setValue: (value: string) => void;
    featureType?: FeatureType;
    parentEntityId?: string;
    subType?: SubType;
}) => {
    const quillRef = useRef<any>(null);

    const [isVisible, setIsVisible] = useState(true);
    const [key, setKey] = useState(0);

    const processedValue = useMemo(() => {
        return preprocessContent(value);
    }, [value]);

    // Handle tab visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
                // Force re-render when tab becomes visible again
                setTimeout(() => {
                    setKey(prev => prev + 1);
                }, 100);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Re-initialize editor when it becomes visible
    useEffect(() => {
        if (isVisible && quillRef.current) {
            const quill = quillRef.current.getEditor();
            if (quill) {
                // Refresh the editor
                quill.update();
            }
        }
    }, [isVisible]);

    // Helper function to convert base64 to File
    const base64ToFile = useCallback((base64: string, filename: string): File => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }, []);

    // Upload image function
    const uploadImageToServer = useCallback(async (file: File): Promise<string> => {
        const toastDismissId = toast.loading('Uploading image...');

        try {
            let fileName: string;

            if (parentEntityId) {
                // Use the new structured upload
                fileName = await uploadFeatureFile({
                    file,
                    parentEntityId,
                    apiUrl: envKeys.API_URL,
                });
            } else {
                // Fallback to basic upload for backward compatibility
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${envKeys.API_URL}/api/uploads/crudS3/uploadFile`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                fileName = data.fileName;
            }

            toast.success('Image uploaded successfully!');
            toast.dismiss(toastDismissId);

            return `${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${fileName}`;
        } catch (err) {
            toast.error('Image upload failed');
            toast.dismiss(toastDismissId);
            console.error("Image upload failed:", err);
            throw err;
        }
    }, [featureType, parentEntityId, subType]);

    // Handle manual image upload
    const handleImageUpload = useCallback(() => {
        try {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
                try {
                    const file = input.files?.[0];
                    if (file) {
                        try {
                            const finalImageUrl = await uploadImageToServer(file);

                            const quill = quillRef.current?.getEditor?.();
                            const range = quill?.getSelection?.();
                            if (range) {
                                quill.insertEmbed(range.index, "image", finalImageUrl);
                            }
                        } catch (err) {
                            console.error("Image upload failed:", err);
                        }
                    }
                } catch (error) {
                    console.error("Error handling file input change:", error);
                }
            };
        } catch (error) {
            console.error("Error in handleImageUpload:", error);
        }
    }, [uploadImageToServer]);

    // Handle content change and detect pasted base64 images
    const handleChange = useCallback(async (content: string, _delta: any, source: any, _editor: any) => {
        setValue(content);

        // Check if content was pasted and contains base64 images
        if (source === 'user') {
            const quill = quillRef.current?.getEditor?.();
            if (quill) {
                const ops = quill.getContents().ops;

                // Find base64 images in the content
                for (let i = 0; i < ops.length; i++) {
                    const op = ops[i];
                    if (op.insert && op.insert.image && typeof op.insert.image === 'string') {
                        const imageSrc = op.insert.image;

                        // Check if it's a base64 image
                        if (imageSrc.startsWith('data:image/')) {
                            try {
                                // Convert base64 to file
                                const filename = `pasted-image-${Date.now()}.png`;
                                const file = base64ToFile(imageSrc, filename);

                                // Upload to server
                                const uploadedUrl = await uploadImageToServer(file);

                                // Replace the base64 image with uploaded URL
                                let currentIndex = 0;
                                for (let j = 0; j < i; j++) {
                                    if (ops[j].insert) {
                                        if (typeof ops[j].insert === 'string') {
                                            currentIndex += ops[j].insert.length;
                                        } else {
                                            currentIndex += 1;
                                        }
                                    }
                                }

                                // Delete the old image and insert the new one
                                quill.deleteText(currentIndex, 1);
                                quill.insertEmbed(currentIndex, 'image', uploadedUrl);

                            } catch (error) {
                                console.error('Failed to upload pasted image:', error);
                            }
                        }
                    }
                }
            }
        }
    }, [setValue, base64ToFile, uploadImageToServer]);

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ font: [] }, { size: [] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    [{ direction: "rtl" }, { align: [] }],
                    ["link", "image", "video", "code-block"],
                    ["clean"],
                ],
                handlers: {
                    image: handleImageUpload,
                },
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        [handleImageUpload]
    );

    const formats = [
        "header", "font", "size",
        "bold", "italic", "underline", "strike",
        "color", "background",
        "script", "super", "sub",
        "list", "bullet", "indent",
        "direction", "align",
        "link", "image", "video", "code-block",
    ];

    return (
        <div>
            <div className={styleQuillCustom.quillCusomContainer}>
                <ReactQuill
                    key={key}
                    ref={quillRef}
                    value={processedValue}
                    onChange={handleChange}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    placeholder="Start writing here..."
                />
            </div>

            {/* download button */}
            <div className="flex justify-end mt-2">
                {parentEntityId && (
                    <span className='px-2 py-1'>
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setValue(value + '\n' + text);
                                }
                            }}
                            parentEntityId={parentEntityId}
                        />
                    </span>
                )}

                {/* Copy Button */}
                <button
                    className="text-sm bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 p-2 mt-1 rounded-sm mr-2"
                    onClick={async () => {
                        const markdownContent = await htmlToMarkdown({
                            html: processedValue,
                        });
                        navigator.clipboard.writeText(markdownContent);
                        toast.success('Copied to clipboard');
                    }}
                >Copy</button>

                <button
                    className="text-sm bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 p-2 mt-1 rounded-sm"
                    onClick={async () => {
                        const quill = quillRef.current?.getEditor?.();
                        if (quill) {
                            const markdownContent = await htmlToMarkdown({
                                html: processedValue,
                            });

                            const blob = new Blob([markdownContent], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `note_${new Date().toISOString()}.txt`;
                            a.click();

                            toast.success('Downloaded');
                        }
                    }}
                >Download</button>
            </div>
        </div>
    );
};

export default QuillEditorCustom1;