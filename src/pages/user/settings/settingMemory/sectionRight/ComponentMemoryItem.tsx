import { useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { LucideEdit, LucideTrash2, LucideLock, LucideUnlock, LucideSave, LucideX } from 'lucide-react';

interface IUserMemory {
    _id: string;
    username: string;
    content: string;
    isPermanent: boolean;
    createdAtUtc: string | null;
    updatedAtUtc: string | null;
}

interface ComponentMemoryItemProps {
    memoryObj: IUserMemory;
    onUpdate: () => void;
    onDelete: () => void;
}

const ComponentMemoryItem = ({ memoryObj, onUpdate, onDelete }: ComponentMemoryItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(memoryObj.content);
    const [isPermanent, setIsPermanent] = useState(memoryObj.isPermanent);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error('Content cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/setting/user/memory/memoryUpdate`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: memoryObj._id,
                    content: content.trim(),
                    isPermanent: isPermanent,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            toast.success('Memory updated successfully');
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to update memory';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (memoryObj.isPermanent) {
            toast.error('Cannot delete protected memory');
            return;
        }

        if (!confirm('Are you sure you want to delete this memory?')) {
            return;
        }

        setIsLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/setting/user/memory/memoryDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: memoryObj._id,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            toast.success('Memory deleted successfully');
            onDelete();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to delete memory';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setContent(memoryObj.content);
        setIsPermanent(memoryObj.isPermanent);
        setIsEditing(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="mb-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-sm shadow-sm hover:shadow-md transition-shadow">
            {isEditing ? (
                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-sm mb-3 min-h-[80px] resize-y"
                        placeholder="Enter memory content..."
                    />
                    <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPermanent}
                                onChange={(e) => setIsPermanent(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-xs sm:text-sm text-gray-700">Protect from deletion</span>
                        </label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-sm hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base"
                        >
                            <LucideSave className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-sm hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-base"
                        >
                            <LucideX className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-gray-800 leading-relaxed break-words">{memoryObj.content}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                            {memoryObj.isPermanent && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-sm text-xs whitespace-nowrap">
                                    <LucideLock className="w-3 h-3" />
                                    <span className="hidden xs:inline">Protected</span>
                                </div>
                            )}
                            {!memoryObj.isPermanent && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-sm text-xs whitespace-nowrap">
                                    <LucideUnlock className="w-3 h-3" />
                                    <span className="hidden xs:inline">Unprotected</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-200 gap-2">
                        <div className="text-xs text-gray-500 break-words">
                            <div className="block sm:inline">Created: {formatDate(memoryObj.createdAtUtc)}</div>
                            <span className="hidden sm:inline"> | </span>
                            <div className="block sm:inline">Updated: {formatDate(memoryObj.updatedAtUtc)}</div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-sm hover:bg-blue-600 disabled:opacity-50 text-xs sm:text-sm"
                            >
                                <LucideEdit className="w-3 h-3" />
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading || memoryObj.isPermanent}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-500 text-white rounded-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                                title={memoryObj.isPermanent ? 'Protected memories cannot be deleted' : 'Delete memory'}
                            >
                                <LucideTrash2 className="w-3 h-3" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentMemoryItem;
