import React, { useEffect, useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';
import { DateTime } from 'luxon';

interface TaskComment {
    _id: string;
    commentText: string;
    isAi: boolean;
    createdAtUtc: Date;
}

const ComponentTaskCommentList: React.FC<{
    parentTaskId: string;
    taskCommentsReloadRandomNum: number;
}> = ({ parentTaskId, taskCommentsReloadRandomNum }) => {
    const [comments, setCommands] = useState<TaskComment[]>([]);
    const [newComment, setNewCommand] = useState('');
    const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
        fetchCommands();
    }, [parentTaskId, taskCommentsReloadRandomNum]);

    const fetchCommands = async () => {
        setLoading(true); // Set loading to true when fetching
        try {
            const response = await axiosCustom.post('/api/task-comments/crud/taskCommentGet', { taskId: parentTaskId });
            setCommands(response.data.docs);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    const onAddComment = async () => {
        if (newComment.trim()) {
            try {
                await axiosCustom.post('/api/task-comments/crud/taskCommentAdd', {
                    commentText: newComment,
                    taskId: parentTaskId,
                    isAi: false,
                });
                setNewCommand('');
                await fetchCommands();
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    };

    const deleteComment = async (id: string) => {
        try {
            await axiosCustom.post(
                '/api/task-comments/crud/taskCommentDelete',
                {
                    id
                }
            );
            await fetchCommands();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-700">
                    Comments {loading && <span className="text-blue-500">Loading...</span>} {/* Loading indicator */}
                </h3>
            </div>
            <div className="space-y-1">
                {comments.map((comment) => (
                    <div key={comment._id} className="">
                        <div className="bg-gray-50 rounded-lg p-2">
                            <div>
                                <p className="mt-1 text-gray-700">{comment?.isAi ? 'AI' : 'You'}: {comment.commentText}</p>
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
                ))}
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
            </div>
        </div>
    );
};

export default ComponentTaskCommentList;
