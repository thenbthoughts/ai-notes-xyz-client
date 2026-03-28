import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { LucideFolderOpen, LucideSettings } from 'lucide-react';

import axiosCustom from '../../../../../config/axiosCustom.ts';

export interface NotesWorkspaceDoc {
    _id: string;
    title: string;
}

type NotesWorkspacePickerProps = {
    selectedId: string;
    onSelect: (workspaceId: string) => void;
};

/**
 * Scrollable workspace list (replaces native &lt;select&gt;) — same UX in sidebar and note edit.
 */
export function NotesWorkspacePicker({ selectedId, onSelect }: NotesWorkspacePickerProps) {
    const [workspaces, setWorkspaces] = useState<NotesWorkspaceDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{ docs: NotesWorkspaceDoc[] }>(
                    '/api/notes-workspace/crud/notesWorkspaceGet'
                );
                setWorkspaces(result.data.docs);
            } catch {
                toast.error('Failed to load workspaces');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Workspace
                </span>
                <Link
                    to="/user/notes-workspace"
                    className="inline-flex items-center gap-0.5 rounded-none border border-zinc-300 bg-white px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 shadow-[1px_1px_0_0_rgb(212_212_216)] hover:bg-zinc-50"
                    title="Manage workspaces"
                >
                    <LucideSettings className="h-3 w-3" strokeWidth={2} />
                    Manage
                </Link>
            </div>

            {loading && (
                <div className="rounded-none border border-dashed border-zinc-300 bg-zinc-50/80 px-2 py-3 text-center font-mono text-[10px] text-zinc-500">
                    Loading workspaces…
                </div>
            )}

            {!loading && workspaces.length === 0 && (
                <div className="rounded-none border border-zinc-300 bg-white px-2 py-2 text-[11px] text-zinc-600">
                    No workspaces.{' '}
                    <Link to="/user/notes-workspace" className="font-medium text-indigo-600 hover:underline">
                        Create one
                    </Link>
                </div>
            )}

            {!loading && workspaces.length > 0 && (
                <div className="rounded-none border border-zinc-300 bg-white">
                    <ul
                        className="max-h-[11rem] divide-y divide-zinc-100 overflow-y-auto overscroll-contain"
                        role="listbox"
                        aria-label="Workspaces"
                    >
                        {workspaces.map((ws) => {
                            const active = selectedId === ws._id;
                            return (
                                <li key={ws._id} role="option" aria-selected={active}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(ws._id)}
                                        title={ws.title}
                                        className={
                                            (active
                                                ? 'border-l-indigo-600 bg-indigo-50/80 text-zinc-950'
                                                : 'border-l-transparent text-zinc-700 hover:bg-zinc-50') +
                                            ' flex w-full items-center gap-1.5 border-l-2 border-t-0 border-b-0 border-r-0 py-1.5 pl-2 pr-1.5 text-left text-[11px] font-medium transition-colors'
                                        }
                                    >
                                        <LucideFolderOpen
                                            className={
                                                (active ? 'text-indigo-600' : 'text-zinc-400') +
                                                ' h-3.5 w-3.5 shrink-0'
                                            }
                                            strokeWidth={2}
                                        />
                                        <span className="min-w-0 flex-1 truncate">{ws.title}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
