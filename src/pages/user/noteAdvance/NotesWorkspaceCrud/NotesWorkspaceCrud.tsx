import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import axiosCustom from "../../../../config/axiosCustom";
import { LucidePlus, LucideEdit, LucideTrash, LucideEye } from 'lucide-react';
import { AxiosRequestConfig } from 'axios';
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
        const fetchNotesWorkspace = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: INotesWorkspace[]
                }>('/api/notes-workspace/crud/notesWorkspaceGet');
                setNotesWorkspace(result.data.docs);
            } catch (err) {
                toast.error('Failed to load workspaces');
            } finally {
                setLoading(false);
            }
        };

        fetchNotesWorkspace();
    }, []);

    const openModal = (workspace?: INotesWorkspace) => {
        setEditingWorkspace(workspace || null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingWorkspace(null);
    };

    const refreshWorkspaces = async () => {
        try {
            const result = await axiosCustom.post<{
                docs: INotesWorkspace[]
            }>('/api/notes-workspace/crud/notesWorkspaceGet');
            setNotesWorkspace(result.data.docs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to refresh workspaces');
        }
    };

    const handleDelete = async (workspace: INotesWorkspace) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${workspace.title}"?`);
        if (!confirmDelete) return;

        try {
            const config = {
                method: 'post',
                url: '/api/notes-workspace/crud/notesWorkspaceDelete',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: workspace._id
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            toast.success('Workspace deleted successfully!');
            await refreshWorkspaces();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete workspace');
        }
    };

    return (
        <div className="px-4">
            <div className="container mx-auto">
                <div className="bg-white rounded p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Notes Workspace</h1>
                            <p className="text-gray-600">Manage your notes workspace</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 flex items-center gap-2"
                        >
                            <LucidePlus size={20} />
                            Add Workspace
                        </button>
                    </div>

                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-lg text-blue-500">Loading workspaces...</p>
                        </div>
                    )}

                    {!loading && (
                        <div className="mt-4">
                            {notesWorkspace.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No workspaces found. Create your first workspace!</p>
                                </div>
                            ) : (
                                notesWorkspace.map((workspace) => (
                                    <div key={workspace._id} className="border border-gray-200 p-4 mb-3 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-800">{workspace.title}</h3>
                                                <p className="text-gray-600 mt-1">{workspace.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.location.href = `/user/notes?workspace=${workspace._id}`}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors inline-flex items-center"
                                                    title="Visit workspace"
                                                >
                                                    <LucideEye size={16} className="mr-2" style={{
                                                        position: 'relative',
                                                        top: '1px',
                                                    }} />
                                                    Visit Workspace
                                                </button>
                                                <button
                                                    onClick={() => openModal(workspace)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit workspace"
                                                >
                                                    <LucideEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(workspace)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete workspace"
                                                >
                                                    <LucideTrash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <WorkspaceModal
                        isOpen={modalOpen}
                        onClose={closeModal}
                        editingWorkspace={editingWorkspace}
                        onSuccess={refreshWorkspaces}
                    />
                </div>
            </div>
        </div>
    )
}

export default NotesWorkspaceCrud;