import { useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { LucidePlus, LucideSave } from 'lucide-react';

interface ComponentMemoryAddProps {
    onAdd: () => void;
}

const ComponentMemoryAdd = ({ onAdd }: ComponentMemoryAddProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [content, setContent] = useState('');
    const [isPermanent, setIsPermanent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!content.trim()) {
            toast.error('Content cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/setting/user/memory/memoryAdd`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    content: content.trim(),
                    isPermanent: isPermanent,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            toast.success('Memory added successfully');
            setContent('');
            setIsPermanent(false);
            setIsAdding(false);
            onAdd();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Failed to add memory';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdding) {
        return (
            <div className="mb-4">
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-sm hover:bg-purple-600 shadow-sm text-sm sm:text-base"
                >
                    <LucidePlus className="w-4 h-4" />
                    Add New Memory
                </button>
            </div>
        );
    }

    return (
        <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-sm shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Add New Memory</h3>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-sm mb-3 min-h-[100px] resize-y"
                placeholder="Enter the fact or insight you want to remember..."
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
                    onClick={handleAdd}
                    disabled={isLoading || !content.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-sm hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base"
                >
                    <LucideSave className="w-4 h-4" />
                    Save Memory
                </button>
                <button
                    onClick={() => {
                        setIsAdding(false);
                        setContent('');
                        setIsPermanent(false);
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-base"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ComponentMemoryAdd;
