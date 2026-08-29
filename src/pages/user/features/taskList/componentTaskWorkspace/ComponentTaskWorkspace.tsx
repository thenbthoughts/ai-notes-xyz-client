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

const lastWorkspaceKey = "taskList-lastWorkspaceId";

const readLastWorkspace = () => {
    try {
        const raw = localStorage.getItem(lastWorkspaceKey);
        if (typeof raw === "string" && raw.length === 24) {
            return raw;
        }
        return "";
    } catch {
        return "";
    }
};

const writeLastWorkspace = (next: string) => {
    try {
        localStorage.setItem(lastWorkspaceKey, next);
    } catch {
        return;
    }
};

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
                let tempWorkspaceId = "";

                if (resultWorkspaceArr.length >= 1) {
                    tempWorkspaceId = resultWorkspaceArr[0]._id;
                }

                const searchParams = new URLSearchParams(window.location.search);
                const workspaceQuery = searchParams.get("workspace");
                if (workspaceQuery) {
                    for (const ws of resultWorkspaceArr) {
                        if (ws._id === workspaceQuery) {
                            tempWorkspaceId = ws._id;
                            break;
                        }
                    }
                } else {
                    const last = readLastWorkspace();
                    if (last) {
                        for (const ws of resultWorkspaceArr) {
                            if (ws._id === last) {
                                tempWorkspaceId = ws._id;
                                break;
                            }
                        }
                    }
                }

                if (tempWorkspaceId !== "") {
                    setWorkspaceId(tempWorkspaceId);
                    writeLastWorkspace(tempWorkspaceId);
                }
            } catch (err) {
                toast.error("Failed to load workspaces");
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Workspace</span>
                <Link
                    to="/user/task-workspace"
                    className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 shadow-sm transition-colors hover:bg-zinc-800"
                    title="Manage workspaces"
                >
                    <LucideSettings className="h-3 w-3" strokeWidth={2} />
                    Manage
                </Link>
            </div>
            <select
                className="block w-full rounded-lg border border-zinc-700/90 bg-zinc-900 py-2 pl-2.5 pr-2 text-xs text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                value={workspaceId}
                onChange={(e) => {
                    setWorkspaceId(e.target.value);
                    writeLastWorkspace(e.target.value);
                    navigate(`/user/task?workspace=${e.target.value}`);
                }}
                aria-label="Select workspace"
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
