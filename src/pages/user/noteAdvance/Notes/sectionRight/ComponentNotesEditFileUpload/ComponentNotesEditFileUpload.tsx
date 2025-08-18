import { useEffect, useRef, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import envKeys from "../../../../../../config/envKeys";
import toast from "react-hot-toast";
import { LucideFile, LucideTrash2, LucideImage, LucideVideo, LucideMusic } from "lucide-react";
import axios from "axios";

interface ILifeEventsFileUpload {
    _id: string;
    fileType: string;
    fileUrl: string;
    fileTitle: string;
    fileDescription: string;
    aiTags: string[];
    createdAtUtc: string;
}

const getFileType = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
    return "file";
};

const getFileIcon = (fileType: string, fileUrl: string) => {
    if (fileType === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)) return <LucideImage className="w-6 h-6 text-blue-400" />;
    if (fileType === "video" || /\.(mp4|mov|avi|webm)$/i.test(fileUrl)) return <LucideVideo className="w-6 h-6 text-purple-400" />;
    if (fileType === "audio" || /\.(mp3|wav|ogg)$/i.test(fileUrl)) return <LucideMusic className="w-6 h-6 text-green-400" />;
    return <LucideFile className="w-6 h-6 text-gray-400" />;
};

const getFileUrl = (fileUrl: string) =>
    `${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${fileUrl}`;

const ComponentNotesEditFileUpload = ({ noteId }: { noteId: string }) => {
    const [files, setFiles] = useState<ILifeEventsFileUpload[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch files
    const fetchFiles = async () => {
        if (!noteId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/notes/file-upload-crud/notesFileUploadGet", { noteId });
            setFiles(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load files");
        }
        setLoading(false);
    };

    useEffect(() => { fetchFiles(); }, [noteId]);

    // Upload files
    const uploadFiles = async (fileList: FileList | File[]) => {
        if (!fileList || !noteId) return;
        setUploading(true);
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const formData = new FormData();
            formData.append("file", file);
            toast.loading("Uploading...", { id: `upload-${i}` });
            try {
                const uploadRes = await axios.post(
                    `${envKeys.API_URL}/api/uploads/crudS3/uploadFile`,
                    formData,
                    { withCredentials: true }
                );
                const fileUrl = uploadRes.data.fileName;
                const fileType = getFileType(file);
                await axiosCustom.post("/api/notes/file-upload-crud/notesFileUploadAdd", {
                    fileType,
                    fileUrl,
                    fileTitle: file.name,
                    fileDescription: file.name,
                    aiTags: [],
                    noteId,
                });
                toast.success("File uploaded!", { id: `upload-${i}` });
            } catch {
                toast.error("Upload failed", { id: `upload-${i}` });
            }
        }
        setUploading(false);
        fetchFiles();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Delete file
    const handleDelete = async (_id: string) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            await axiosCustom.post("/api/notes/file-upload-crud/notesFileUploadDelete", { _id });
            toast.success("File deleted");
            fetchFiles();
        } catch {
            toast.error("Delete failed");
        }
    };

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) uploadFiles(e.target.files);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    return (
        <div>
            <div
                className={`flex items-center gap-2 mb-2 relative`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                    border: dragActive ? "2px dashed #6366f1" : undefined,
                    background: dragActive ? "#f0f4ff" : undefined,
                    borderRadius: "0.5rem",
                    minHeight: "60px",
                    transition: "background 0.2s, border 0.2s"
                }}
            >
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded focus:outline-none focus:shadow-outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                >
                    <LucideFile className="inline-block w-5 h-5 mr-1" />
                    Upload File
                </button>
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    hidden
                    ref={fileInputRef}
                />
                {uploading && <span className="text-blue-500 text-sm">Uploading...</span>}
                {dragActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-indigo-600 font-semibold text-lg">Drop files to upload</span>
                    </div>
                )}
            </div>
            {loading ? (
                <div className="text-gray-400 text-sm">Loading files...</div>
            ) : (
                <div>
                    {files.length === 0 && (
                        <div className="text-gray-400 text-sm">No files uploaded yet.</div>
                    )}
                    {files.map((file, idx) => (
                        <div key={file._id} className="border border-gray-200 p-2 relative mb-2 rounded">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="text-gray-400 text-sm flex-shrink-0 mb-1 sm:mb-0">#{idx + 1}</div>
                                <div className="flex-shrink-0 mb-1 sm:mb-0">{getFileIcon(file.fileType, file.fileUrl)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800 truncate">{file.fileTitle || "Untitled"}</div>
                                    <div className="text-xs text-gray-500 truncate">{file.fileDescription}</div>
                                    <div className="text-xs text-gray-400">{new Date(file.createdAtUtc).toLocaleString()}</div>
                                    {file.aiTags && file.aiTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {file.aiTags.map((tag, i) => (
                                                <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-1">
                                        <button
                                            className="inline-flex items-center text-blue-600 hover:underline text-xs"
                                            title="Download file"
                                            type="button"
                                            onClick={() => {
                                                // Directly download
                                                fetch(getFileUrl(file.fileUrl), {
                                                    credentials: "include"
                                                })
                                                    .then(async (response) => {
                                                        if (!response.ok) throw new Error("Network response was not ok");
                                                        const blob = await response.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const link = document.createElement("a");
                                                        link.href = url;
                                                        link.download = file.fileTitle || "download";
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        setTimeout(() => {
                                                            window.URL.revokeObjectURL(url);
                                                            document.body.removeChild(link);
                                                        }, 1000);
                                                    })
                                                    .catch(() => {
                                                        toast.error("Failed to download file");
                                                    });
                                            }}
                                        >
                                            <LucideFile className="w-4 h-4 mr-1" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-2 sm:mt-0"
                                    title="Delete"
                                    onClick={() => handleDelete(file._id)}
                                    type="button"
                                >
                                    <LucideTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-2">
                                {file.fileType === "image" && (
                                    <a href={getFileUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={getFileUrl(file.fileUrl)}
                                            alt={file.fileTitle}
                                            className="w-full object-contain rounded"
                                            style={{ maxHeight: 200 }}
                                        />
                                    </a>
                                )}
                                {file.fileType === "video" && (
                                    <video
                                        src={getFileUrl(file.fileUrl)}
                                        controls
                                        className="w-full object-contain rounded"
                                        style={{ maxHeight: 200 }}
                                    />
                                )}
                                {file.fileType === "audio" && (
                                    <audio
                                        src={getFileUrl(file.fileUrl)}
                                        controls
                                        className="w-full rounded"
                                    />
                                )}
                                {file.fileType === "file" && (
                                    <div className="flex justify-center">
                                        <a href={getFileUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer">
                                            <LucideFile className="w-10 h-10 text-gray-400" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComponentNotesEditFileUpload;