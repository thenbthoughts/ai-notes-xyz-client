import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideSettings } from 'lucide-react';
import { jotaiStateTaskWorkspaceId } from '../stateJotai/taskStateJotai.ts';
import { useAtom } from 'jotai';

interface Workspace {
    _id: string;
    title: string;
}

const ComponentTaskWorkspace = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateTaskWorkspaceId);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: Workspace[]
                }>('/api/task-workspace/crud/taskWorkspaceGet');
                setWorkspaces(result.data.docs);

                const resultWorkspaceArr = result.data.docs;

                let tempWorkspaceId = '';

                if (resultWorkspaceArr.length >= 1) {
                    tempWorkspaceId = resultWorkspaceArr[0]._id;
                }


                const searchParams = new URLSearchParams(window.location.search);
                const workspaceQuery = searchParams.get('workspace');
                if (workspaceQuery) {
                    for (const workspaceId of resultWorkspaceArr) {
                        if (workspaceId._id === workspaceQuery) {
                            tempWorkspaceId = workspaceId._id;
                            break;
                        }
                    }
                }

                if (tempWorkspaceId === '') {
                    setWorkspaceId(tempWorkspaceId);
                }
            } catch (err) {
                toast.error('Failed to load workspaces');
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div>
            <div className="mb-4">
                <h2 className="block text-sm font-medium pb-2 flex justify-between items-center text-blue-600">
                    <span className='text-xl font-semibold mb-1 text-blue-600' >Workspace</span>
                    <Link
                        to={'/user/task-workspace'}
                        className="ml-2 p-0 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 inline-block text-sm"
                    >
                        <LucideSettings className="inline-block m-1"
                            size={'20px'}
                        />
                    </Link>
                </h2>
                <select
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={workspaceId}
                    onChange={(e) => {
                        // Handle workspace selection
                        setWorkspaceId(e.target.value);
                        navigate(`/user/task?workspace=${e.target.value}`);
                    }}
                >
                    {workspaces.map((workspace) => (
                        <option key={workspace._id} value={workspace._id}>
                            {workspace.title}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ComponentTaskWorkspace;