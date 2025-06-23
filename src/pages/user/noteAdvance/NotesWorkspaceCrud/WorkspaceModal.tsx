import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { LucideX } from 'lucide-react';

interface INotesWorkspace {
    _id: string;
    title: string;
    description: string;
    createdAt: Date;
}

interface WorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingWorkspace: INotesWorkspace | null;
    onSuccess: () => void;
}

const WorkspaceModal = ({ isOpen, onClose, editingWorkspace, onSuccess }: WorkspaceModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingWorkspace) {
            setFormData({
                title: editingWorkspace.title,
                description: editingWorkspace.description
            });
        } else {
            setFormData({
                title: '',
                description: ''
            });
        }
    }, [editingWorkspace]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setLoading(true);
        
        try {
            const config = {
                method: 'post',
                url: editingWorkspace 
                    ? '/api/notes-workspace/crud/notesWorkspaceEdit'
                    : '/api/notes-workspace/crud/notesWorkspaceAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: editingWorkspace 
                    ? { ...formData, _id: editingWorkspace._id }
                    : formData,
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            
            toast.success(editingWorkspace ? 'Workspace updated successfully!' : 'Workspace created successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save workspace');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingWorkspace ? 'Edit Workspace' : 'Add New Workspace'}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter workspace title"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter workspace description"
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (editingWorkspace ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkspaceModal;
