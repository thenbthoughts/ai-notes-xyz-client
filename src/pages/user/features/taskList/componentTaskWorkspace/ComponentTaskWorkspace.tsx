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
                <span className="text-xs font-semibold text-violet-900">Workspace</span>
                <Link
                    to="/user/task-workspace"
                    className="inline-flex items-center gap-0.5 rounded-md border border-cyan-200/80 bg-gradient-to-r from-cyan-50 to-sky-50 px-1.5 py-0.5 text-[11px] font-semibold text-cyan-900 shadow-sm backdrop-blur-sm transition-colors hover:border-cyan-300 hover:from-cyan-100 hover:to-sky-100"
                    title="Manage workspaces"
                >
                    <LucideSettings className="h-3 w-3" strokeWidth={2} />
                    Manage
                </Link>
            </div>
            <select
                className="block w-full rounded-lg border border-violet-200/70 bg-gradient-to-r from-white to-violet-50/40 py-1.5 px-2 text-xs leading-tight text-zinc-900 shadow-sm backdrop-blur-sm focus:border-fuchsia-400 focus:outline-none focus:ring-1 focus:ring-fuchsia-200/50"
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
