import { Link } from 'react-router-dom';
import { LucideSettings } from 'lucide-react';

import { NotesWorkspaceSelect } from './NotesWorkspaceSelect.tsx';

export type { NotesWorkspaceDoc } from './NotesWorkspaceSelect.tsx';

type NotesWorkspacePickerProps = {
    selectedId: string;
    onSelect: (workspaceId: string) => void;
};

/** Workspace header + dropdown (sidebar and note edit). */
export function NotesWorkspacePicker({ selectedId, onSelect }: NotesWorkspacePickerProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    Workspace
                </span>
                <Link
                    to="/user/notes-workspace"
                    className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200/80 bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50"
                    title="Manage workspaces"
                >
                    <LucideSettings className="h-3 w-3" strokeWidth={2} />
                    Manage
                </Link>
            </div>

            <NotesWorkspaceSelect selectedId={selectedId} onSelect={onSelect} />
        </div>
    );
}
