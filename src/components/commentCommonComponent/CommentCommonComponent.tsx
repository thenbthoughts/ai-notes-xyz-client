import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Send, LucideFile, LucideDownload, LucideFileAudio } from 'lucide-react';
import axiosCustom from '../../config/axiosCustom';
import { DateTime } from 'luxon';
import toast from 'react-hot-toast';
import envKeys from '../../config/envKeys';
import ComponentTaskCommentListAudioInput from './ComponentTaskCommentListAudioInput';
import { commentAddAudioToTextAxios } from './commentCommonAxiosUtils';
import { uploadFeatureFile } from '../../utils/featureFileUpload';
import SpeechToTextComponent from '../componentCommon/SpeechToTextComponent';

interface TaskComment {
    _id: string;
    commentText: string;
    isAi: boolean;
    createdAtUtc: Date;
    fileType: string;
    fileUrl: string;
}

export type ICommentType = 'note' | 'task' | 'lifeEvent' | 'infoVault';

const getFileType = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
    return "file";
};

const ComponentTaskCommentListFileUpload = ({
    commentType,
    entityId,
    setTaskCommentsReloadRandomNumCurrent,
}: {
    commentType: ICommentType;
    entityId: string;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFiles = async (fileList: FileList | File[]) => {
        if (!fileList || !entityId) return;

        setUploading(true);
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];

            let randomToastUploadId = `upload-${Math.floor(Math.random() * 1_000_000)}`;

            toast.loading("Uploading...", { id: randomToastUploadId });
            try {
                const fileUrl = await uploadFeatureFile({
                    file,
                    parentEntityId: entityId,
                    apiUrl: envKeys.API_URL,
                });

                const fileType = getFileType(file);
                await axiosCustom.post("/api/comment-common/crud/commentCommonAdd", {
                    // comment type and reference id
                    commentType,
                    entityId,

                    // is ai
                    isAi: false,

                    // comment text
                    commentText: '',

                    // file type, url, title, description
                    fileType,
                    fileUrl,
                    fileTitle: file.name,
                    fileDescription: file.name,
                });
                toast.success("File uploaded!", { id: randomToastUploadId });
                toast.dismiss(randomToastUploadId);
            } catch {
                toast.error("Upload failed", { id: randomToastUploadId });
                toast.dismiss(randomToastUploadId);
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-sm focus:outline-none focus:shadow-outline"
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

    commentType,
    entityId,
}: {
    comment: TaskComment;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;

    commentType: ICommentType;
    entityId: string;
}) => {

    const deleteComment = async (id: string) => {
        try {
            await axiosCustom.post(
                '/api/comment-common/crud/commentCommonDelete',
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
        `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${fileUrl}`;

    return (
        <div>
            <div key={comment._id} className="">
                <div className="bg-gray-50 rounded-sm p-2">
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
                            <div className="bg-gray-50 rounded-sm py-2">
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
                                className="text-red-500 hover:text-red-700 px-3"
                            >
                                <Trash2 size={16} />
                            </button>

                            {comment.fileType && comment.fileUrl && (
                                <a
                                    href={getFileUrl(comment.fileUrl)}
                                    download={comment.fileUrl.split('/').pop() || "download"}
                                    className="text-blue-500 hover:text-blue-700 text-sm px-3"
                                    target='_blank'
                                >
                                    <LucideDownload
                                        size={16}
                                        className="inline-block"
                                        style={{
                                            marginTop: '-8px',
                                        }}
                                    />
                                </a>
                            )}

                            {comment.fileType === "audio" && (
                                <button
                                    onClick={async () => {
                                        await commentAddAudioToTextAxios({
                                            fileName: comment.fileUrl,
                                            commentType,
                                            entityId,
                                        });
                                        setTaskCommentsReloadRandomNumCurrent(prev => prev + 1);
                                        toast.success("Audio to Text completed!");
                                    }}
                                    className="text-blue-500 hover:text-blue-700 text-sm px-3"
                                >
                                    <LucideFileAudio
                                        size={16}
                                        className="inline-block"
                                        style={{
                                            marginTop: '-4px',
                                        }}
                                    />
                                    <span
                                        className='inline-block pl-2'
                                    >Audio to Text</span>
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const ComponentTaskCommentAdd = ({
    entityId,
    commentType,
    setTaskCommentsReloadRandomNumCurrent,
}: {
    entityId: string;
    commentType: ICommentType;
    setTaskCommentsReloadRandomNumCurrent: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const [newComment, setNewCommand] = useState('');

    const onAddComment = async () => {
        if (newComment.trim()) {
            try {
                await axiosCustom.post('/api/comment-common/crud/commentCommonAdd', {
                    // comment text
                    commentText: newComment,

                    // comment type and reference id
                    commentType,
                    entityId,

                    // is ai
                    isAi: false,
                });
                setNewCommand('');
                setTaskCommentsReloadRandomNumCurrent(prev => prev + 1);
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    };

    // upload file
    const uploadFileToStorage = async (file: File) => {
        let randomToastUploadId = `upload-${Math.floor(Math.random() * 1_000_000)}`;
        const toastDismissId = toast.loading("Uploading...", { id: `upload-${randomToastUploadId}` });
        try {
            const fileUrl = await uploadFeatureFile({
                file,
                parentEntityId: entityId,
                apiUrl: envKeys.API_URL,
            });

            const fileType = getFileType(file);

            await axiosCustom.post("/api/comment-common/crud/commentCommonAdd", {
                // comment type and reference id
                commentType,
                entityId,

                // is ai
                isAi: false,

                // comment text
                commentText: '',

                // file type, url, title, description
                fileType,
                fileUrl,
                fileTitle: file.name,
                fileDescription: file.name,
            });

            setTaskCommentsReloadRandomNumCurrent(prev => prev + 1);

            toast.dismiss(toastDismissId);
            toast.success(`File "${file.name}" uploaded successfully!`);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.dismiss(toastDismissId);
            toast.error('Error uploading file!');
        }
    };

    const uploadFilesToStorage = async (files: File[]) => {
        await Promise.all(Array.from(files).map(uploadFileToStorage));
    };

    const handleFileDrop = async (event: React.DragEvent<HTMLTextAreaElement>): Promise<void> => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        await uploadFilesToStorage(Array.from(droppedFiles));
    };

    const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
        const items = event.clipboardData.items;

        const pastedFiles: File[] = [];
        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) pastedFiles.push(file);
            }
        }
        await uploadFilesToStorage(pastedFiles);
    };

    const handleDragOver = (event: React.DragEvent<HTMLTextAreaElement>): void => {
        event.preventDefault();
    };

    return (
        <div className="gap-2 mt-2">
            <div className="mt-1">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewCommand(e.target.value)}
                    placeholder="Write a comment or drag & drop any files here..."
                    className="w-full p-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}

                    // file upload
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onPaste={handlePaste}
                />

                <span className='pr-2 py-1'>
                    <SpeechToTextComponent
                        onTranscriptionComplete={(text: string) => {
                            if (text.trim() !== '') {
                                setNewCommand((prev: string) => prev.trim() + '\n' + text.trim());
                            }
                        }}
                        parentEntityId={entityId}
                    />
                </span>
            </div>
            <div className="flex justify-end mt-1">
                <button
                    onClick={onAddComment}
                    className="px-2 py-1 bg-blue-500 text-white rounded-sm hover:bg-blue-600 flex items-center gap-1"
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
    entityId: string;
    taskCommentsReloadRandomNum: number;
    commentType: ICommentType;
}> = ({ entityId, taskCommentsReloadRandomNum, commentType }) => {
    const [comments, setCommands] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(true);

    const [taskCommentsReloadRandomNumCurrent, setTaskCommentsReloadRandomNumCurrent] = useState(0);

    useEffect(() => {
        fetchCommands();
    }, [entityId, taskCommentsReloadRandomNum, taskCommentsReloadRandomNumCurrent]);

    const fetchCommands = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/comment-common/crud/commentCommonGet', { entityId: entityId });
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
                <h3 className="text-lg font-medium text-gray-700">
                    Comments {loading && <span className="text-blue-500">Loading...</span>}
                </h3>
            </div>

            {/* upload file */}
            <div>
                <ComponentTaskCommentListFileUpload
                    entityId={entityId}
                    setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}
                    commentType={commentType}
                />
            </div>

            {/* audio input */}
            <div>
                    <ComponentTaskCommentListAudioInput
                        entityId={entityId}
                        setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}
                        commentType={commentType}
                    />
            </div>

            <div className="space-y-1 mt-2">
                <ComponentTaskCommentAdd
                    entityId={entityId}
                    setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}
                    commentType={commentType}
                />

                {comments.map((comment) => (
                    <ComponentTaskCommentItem
                        key={comment._id}
                        comment={comment}
                        setTaskCommentsReloadRandomNumCurrent={setTaskCommentsReloadRandomNumCurrent}

                        commentType={commentType}
                        entityId={entityId}
                    />
                ))}
            </div>
        </div>
    );
};

const CommentCommonComponent = ({
    commentType,
    recordId
}: {
    commentType: 'note' | 'task' | 'lifeEvent' | 'infoVault';
    recordId: string;
}) => {
    return (
        <div>
            <ComponentTaskCommentList
                entityId={recordId}
                taskCommentsReloadRandomNum={0}
                commentType={commentType}
            />
        </div>
    );
};

export default CommentCommonComponent;
