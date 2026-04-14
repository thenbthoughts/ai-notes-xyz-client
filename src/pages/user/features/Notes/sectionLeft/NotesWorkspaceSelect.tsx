import { forwardRef, useEffect, useState, type SelectHTMLAttributes } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import axiosCustom from '../../../../../config/axiosCustom.ts';

type SelectOption = { value: string; label: string };

const notesChromeSelectClass =
    'w-full rounded-none border border-zinc-300 bg-white py-1.5 pl-2 pr-2 text-[11px] font-medium text-zinc-950 shadow-[3px_3px_0_0_rgb(228_228_231)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50';

/** Styled native &lt;select&gt; for notes chrome — reusable within this module. */
const NotesChromeSelect = forwardRef<
    HTMLSelectElement,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { options: SelectOption[] }
>(function NotesChromeSelect({ className = '', options, ...rest }, ref) {
    return (
        <select ref={ref} className={`${notesChromeSelectClass} ${className}`.trim()} {...rest}>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
});

export interface NotesWorkspaceDoc {
    _id: string;
    title: string;
}

type NotesWorkspaceSelectProps = {
    selectedId: string;
    onSelect: (workspaceId: string) => void;
};

export function NotesWorkspaceSelect({ selectedId, onSelect }: NotesWorkspaceSelectProps) {
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

    useEffect(() => {
        if (loading || workspaces.length === 0) return;
        if (!workspaces.some((w) => w._id === selectedId)) {
            onSelect(workspaces[0]._id);
        }
    }, [loading, workspaces, selectedId, onSelect]);

    if (loading) {
        return (
            <div className="rounded-none border border-dashed border-zinc-300 bg-zinc-50/80 px-2 py-3 text-center font-mono text-[10px] text-zinc-500">
                Loading workspaces…
            </div>
        );
    }

    if (workspaces.length === 0) {
        return (
            <div className="rounded-none border border-zinc-300 bg-white px-2 py-2 text-[11px] text-zinc-600">
                No workspaces.{' '}
                <Link to="/user/notes-workspace" className="font-medium text-indigo-600 hover:underline">
                    Create one
                </Link>
            </div>
        );
    }

    const options = workspaces.map((ws) => ({ value: ws._id, label: ws.title }));
    const resolvedId = workspaces.some((w) => w._id === selectedId) ? selectedId : workspaces[0]._id;

    return (
        <NotesChromeSelect
            aria-label="Workspaces"
            value={resolvedId}
            options={options}
            onChange={(e) => onSelect(e.target.value)}
        />
    );
}
