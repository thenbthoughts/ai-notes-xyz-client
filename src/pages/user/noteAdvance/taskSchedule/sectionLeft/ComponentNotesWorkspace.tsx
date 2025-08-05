import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideSettings } from 'lucide-react';
import { jotaiStateNotesWorkspaceId } from '../stateJotai/notesStateJotai.ts';
import { useAtom } from 'jotai';

interface Workspace {
    _id: string;
    title: string;
}

const ComponentNotesWorkspace = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateNotesWorkspaceId);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: Workspace[]
                }>('/api/notes-workspace/crud/notesWorkspaceGet');
                setWorkspaces(result.data.docs);
            } catch (err) {
                toast.error('Failed to load workspaces');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div>
            {loading && (
                <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value=""
                    onChange={() => { }}
                >
                    <option value="000000000000000000000000">Loading...</option>
                </select>
            )}
            {!loading && (
                <div className="mb-4">
                    <label className="block text-sm font-medium pb-2">
                        Workspace
                        <Link
                            to={'/user/task-schedule-workspace'}
                            className="ml-2 p-0 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 inline-block text-sm"
                        >
                            <LucideSettings className="inline-block m-1"
                                size={'20px'}
                            />
                        </Link>
                    </label>
                    <select
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={workspaceId}
                        onChange={(e) => {
                            // Handle workspace selection
                            setWorkspaceId(e.target.value);
                            navigate(`/user/task-schedule?workspace=${e.target.value}`);
                        }}
                    >
                        {workspaces.map((workspace) => (
                            <option key={workspace._id} value={workspace._id}>
                                {workspace.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default ComponentNotesWorkspace;