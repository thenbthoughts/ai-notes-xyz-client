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
                    for (const ws of resultWorkspaceArr) {
                        if (ws._id === workspaceQuery) {
                            tempWorkspaceId = ws._id;
                            break;
                        }
                    }
                }

                if (tempWorkspaceId !== '') {
                    setWorkspaceId(tempWorkspaceId);
                }
            } catch (err) {
                toast.error('Failed to load workspaces');
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] font-semibold text-zinc-800">Workspace</span>
                <Link
                    to="/user/task-workspace"
                    className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:border-zinc-300 hover:bg-white"
                    title="Manage workspaces"
                >
                    <LucideSettings className="h-3 w-3" strokeWidth={2} />
                    Manage
                </Link>
            </div>
            <select
                className="block w-full rounded-lg border border-zinc-200/80 bg-white/80 py-1 px-2 text-[11px] leading-tight text-zinc-900 shadow-sm backdrop-blur-sm focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                value={workspaceId}
                onChange={(e) => {
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
    );
};

export default ComponentTaskWorkspace;
