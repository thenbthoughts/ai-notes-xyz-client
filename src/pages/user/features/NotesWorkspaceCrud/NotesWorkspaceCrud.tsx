import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import axiosCustom from "../../../../config/axiosCustom";
import { LucidePlus, LucideEdit, LucideTrash, LucideEye } from 'lucide-react';
import WorkspaceModal from './WorkspaceModal.tsx';

interface INotesWorkspace {
    _id: string;
    title: string;
    description: string;
    createdAt: Date;
}

const NotesWorkspaceCrud = () => {
    const [notesWorkspace, setNotesWorkspace] = useState<INotesWorkspace[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingWorkspace, setEditingWorkspace] = useState<INotesWorkspace | null>(null);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const result = await axiosCustom.post<{ docs: INotesWorkspace[] }>('/api/notes-workspace/crud/notesWorkspaceGet');
            setNotesWorkspace(result.data.docs);
        } catch (err) {
            toast.error('Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (workspace?: INotesWorkspace) => {
        setEditingWorkspace(workspace || null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingWorkspace(null);
    };

    const handleDelete = async (workspace: INotesWorkspace) => {
        if (!window.confirm(`Delete "${workspace.title}"?`)) return;

        try {
            await axiosCustom.post('/api/notes-workspace/crud/notesWorkspaceDelete', { _id: workspace._id });
            toast.success('Workspace deleted!');
            fetchWorkspaces();
        } catch (error) {
            toast.error('Failed to delete workspace');
        }
    };

    const visitWorkspace = (workspaceId: string) => {
        window.location.href = `/user/notes?workspace=${workspaceId}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-6 sm:h-8 bg-gray-300 rounded-sm w-1/2 sm:w-1/3 mb-4"></div>
                        <div className="grid gap-3 sm:gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 sm:h-32 bg-white rounded-xl shadow-sm"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Workspaces</h1>
                        <p className="text-sm sm:text-base text-gray-600">Organize your notes in beautiful workspaces</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto"
                    >
                        <LucidePlus size={18} className="sm:w-5 sm:h-5" />
                        <span className="sm:inline">Create Workspace</span>
                    </button>
                </div>

                {/* Workspaces Grid */}
                {notesWorkspace.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-sm sm:max-w-md mx-auto">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                                <LucidePlus className="text-indigo-600" size={20} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No workspaces yet</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6">Create your first workspace to get started!</p>
                            <button
                                onClick={() => openModal()}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-sm hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                            >
                                Create Now
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {notesWorkspace.map((workspace) => (
                            <div key={workspace._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{workspace.title}</h3>
                                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{workspace.description}</p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => visitWorkspace(workspace._id)}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-sm hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                                        >
                                            <LucideEye size={14} className="sm:w-4 sm:h-4" />
                                            Open
                                        </button>
                                        <div className="flex gap-2 sm:gap-1">
                                            <button
                                                onClick={() => openModal(workspace)}
                                                className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                                                title="Edit"
                                            >
                                                <LucideEdit size={14} className="sm:w-4 sm:h-4 mx-auto" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(workspace)}
                                                className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                                title="Delete"
                                            >
                                                <LucideTrash size={14} className="sm:w-4 sm:h-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <WorkspaceModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    editingWorkspace={editingWorkspace}
                    onSuccess={fetchWorkspaces}
                />
            </div>
        </div>
    );
};

export default NotesWorkspaceCrud;