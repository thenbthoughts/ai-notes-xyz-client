import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../../../../config/axiosCustom.ts';

interface Workspace {
    _id: string;
    title: string;
}

const ComponentSelectWorkspace = ({
    workspaceId,
    setWorkspaceIdFunc,
}: {
    workspaceId: string;
    setWorkspaceIdFunc: (workspaceId: string) => void;
}) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: Workspace[]
                }>('/api/task-workspace/crud/taskWorkspaceGet');

                const docs = result.data.docs;

                setWorkspaces(docs);

                if (docs.length >= 1) {
                    let shouldSelectDefault = true;
                    for (let index = 0; index < docs.length; index++) {
                        const element = docs[index];
                        if (element._id === workspaceId) {
                            shouldSelectDefault = false;
                            break;
                        }
                    }
                    if (shouldSelectDefault) {
                        setWorkspaceIdFunc(docs[0]._id);
                    }
                }
            } catch (err) {
                toast.error('Failed to load workspaces');
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <Fragment>
            {workspaces.length > 0 && (
                <select
                    className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={workspaceId}
                    onChange={(e) => {
                        // Handle workspace selection
                        setWorkspaceIdFunc(e.target.value);
                    }}
                >
                    {workspaces.map((workspace) => (
                        <option key={workspace._id} value={workspace._id}>
                            {workspace.title}
                        </option>
                    ))}
                </select>

            )}
            {workspaces.length === 0 && (
                <div className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    No workspaces found
                </div>
            )}
        </Fragment>
    );
};

export default ComponentSelectWorkspace;