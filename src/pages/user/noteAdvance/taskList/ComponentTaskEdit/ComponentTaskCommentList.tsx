import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Send, LucideFile } from 'lucide-react';
import axios from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';
import { DateTime } from 'luxon';
import toast from 'react-hot-toast';
import envKeys from '../../../../../config/envKeys';

interface TaskComment {
    _id: string;
    commentText: string;
    isAi: boolean;
    createdAtUtc: Date;
    fileType: string;
    fileUrl: string;
}

const ComponentTaskCommentListFileUpload = ({
    taskId,
    setTaskCommentsReloadRandomNumCurrent,
}: {
    taskId: string;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileType = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || "";
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
        if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
        if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
        return "file";
    };

    const uploadFiles = async (fileList: FileList | File[]) => {
        if (!fileList || !taskId) return;
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
                await axiosCustom.post("/api/task-comments/crud/taskCommentAdd", {
                    // task
                    taskId,
                    isAi: false,

                    // 
                    commentText: '',

                    // file
                    fileType,
                    fileUrl,
                    fileTitle: file.name,
                    fileDescription: file.name,
                });
                toast.success("File uploaded!", { id: `upload-${i}` });
            } catch {
                toast.error("Upload failed", { id: `upload-${i}` });
            }
        }
        setUploading(false);
        setTaskCommentsReloadRandomNumCurrent(prev => prev + 1);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) uploadFiles(e.target.files);
    };

    return (
        <div>
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
        </div>
    );
};

const ComponentTaskCommentItem = ({
    comment,
    setTaskCommentsReloadRandomNumCurrent,
}: {
    comment: TaskComment;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const deleteComment = async (id: string) => {
        try {
            await axiosCustom.post(
                '/api/task-comments/crud/taskCommentDelete',
                {
                    id
                }
            );
            setTaskCommentsReloadRandomNumCurrent(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const getFileUrl = (fileUrl: string) =>
        `${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${fileUrl}`;

    return (
        <div>
            <div key={comment._id} className="">
                <div className="bg-gray-50 rounded-lg p-2">
                    <div>
                        <p className="mt-1 text-gray-700">
                            {comment?.isAi ? 'AI' : 'You'}:
                            {comment.commentText && (
                                <span>
                                    {' '}
                                    {comment.commentText}
                                </span>
                            )}
                            {
                                comment.fileType && comment.fileUrl && (
                                    <span>
                                        {' '}
                                        Attached {comment.fileType}
                                    </span>
                                )
                            }
                        </p>

                        {comment.fileType && comment.fileUrl && (
                            <div className="bg-gray-50 rounded-lg py-2">
                                {comment.fileType === "image" && (
                                    <img src={getFileUrl(comment.fileUrl)} alt={comment.fileType} className="w-full"
                                        style={{
                                            objectFit: 'contain',
                                            maxHeight: '200px',
                                        }}
                                    />
                                )}
                                {comment.fileType === "video" && (
                                    <video src={getFileUrl(comment.fileUrl)} controls />
                                )}
                                {comment.fileType === "audio" && (
                                    <audio src={getFileUrl(comment.fileUrl)} controls />
                                )}
                                {comment.fileType === "file" && (
                                    <a href={getFileUrl(comment.fileUrl)} download>File: {getFileUrl(comment.fileUrl)}</a>
                                )}
                            </div>
                        )}

                        <div>
                            <span className="text-s text-gray-500 mr-2">
                                {DateTime.fromISO(comment?.createdAtUtc?.toString()).toRelative()}
                                {' | '}
                                {DateTime.fromISO(comment?.createdAtUtc?.toString()).toFormat('yyyy-MM-dd - hh:mm a')}
                            </span>
                            <button
                                onClick={() => deleteComment(comment._id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const ComponentTaskCommentAdd = ({
    taskId,
    setTaskCommentsReloadRandomNumCurrent,
}: {
    taskId: string;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const [newComment, setNewCommand] = useState('');

    const onAddComment = async () => {
        if (newComment.trim()) {
            try {
                await axiosCustom.post('/api/task-comments/crud/taskCommentAdd', {
                    commentText: newComment,
                    taskId,
                    isAi: false,
                });
                setNewCommand('');
                setTaskCommentsReloadRandomNumCurrent(prev => prev + 1);
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    };

    return (
        <div className="gap-2 mt-2">
            <div className="flex mt-1">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewCommand(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                />
            </div>
            <div className="flex justify-end mt-1">
                <button
                    onClick={onAddComment}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
                    disabled={!newComment.trim()}
                >
                    <Send size={14} />
                    Comment
                </button>
            </div>

        </div>
    );
};

const ComponentTaskCommentList: React.FC<{
    parentTaskId: string;
    taskCommentsReloadRandomNum: number;
}> = ({ parentTaskId, taskCommentsReloadRandomNum }) => {
    const [comments, setCommands] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(true);

    const [taskCommentsReloadRandomNumCurrent, setTaskCommentsReloadRandomNumCurrent] = useState(0);

    useEffect(() => {
        fetchCommands();
    }, [parentTaskId, taskCommentsReloadRandomNum, taskCommentsReloadRandomNumCurrent]);

    const fetchCommands = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/task-comments/crud/taskCommentGet', { taskId: parentTaskId });
            setCommands(response.data.docs);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-700">
                    Comments {loading && <span className="text-blue-500">Loading...</span>}
                </h3>
            </div>

            {/* upload file */}
            <div>
                <ComponentTaskCommentListFileUpload
                    taskId={parentTaskId}
                    setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}
                />
            </div>

            <div className="space-y-1 mt-2">
                {comments.map((comment) => (
                    <ComponentTaskCommentItem
                        key={comment._id}
                        comment={comment}
                        setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}
                    />
                ))}

                <ComponentTaskCommentAdd
                    taskId={parentTaskId}
                    setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}
                />

            </div>
        </div>
    );
};

export default ComponentTaskCommentList;
