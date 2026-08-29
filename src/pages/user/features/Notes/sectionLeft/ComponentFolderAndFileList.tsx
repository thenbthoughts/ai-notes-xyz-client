import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Folder as FolderIcon, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jotaiNotesModalOpenStatus, jotaiStateNotesWorkspaceId, jotaiStateNotesWorkspaceRefresh, jotaiNotesFolderFilter } from '../stateJotai/notesStateJotai.ts';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import toast from 'react-hot-toast';
import { notesBulkMoveAxios } from '../utils/notesListAxios.ts';
import { INotes } from '../../../../../types/pages/tsNotes.ts';

export type MenuItem = {
    _id: string;
    title: string;
    parent: string;
    order: number;
    isStar?: boolean;
    folder?: string;
};

const ComponentFolderAndFileList = () => {
    const [workspaceId] = useAtom(jotaiStateNotesWorkspaceId);
    const setStateNotesModalOpenStatus = useSetAtom(jotaiNotesModalOpenStatus);
    const [activeItem, setActiveItem] = useState<string>('');
    const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
    const workspaceRefresh = useAtomValue(jotaiStateNotesWorkspaceRefresh);
    const [folderFilter, setFolderFilter] = useAtom(jotaiNotesFolderFilter);
    const [menuItems, setMenuItems] = useState<INotes[]>([]);
    const [dragId, setDragId] = useState<string | null>(null);

    useEffect(() => {
        axiosGetMenuItems();
    }, [workspaceId, workspaceRefresh]);

    const axiosGetMenuItems = async () => {
        try {
            if (workspaceId.length !== 24) {
                return;
            }
            const result = await axiosCustom.post('/api/notes/crud/notesGet', {
                notesWorkspaceId: workspaceId,
                perPage: 1000,
                sort: 'order',
            });
            if (result.data.docs) {
                const docs = result.data.docs as INotes[];
                setMenuItems(docs);
                if (docs.length > 0 && expandedFolders.length === 0) {
                    const folders = Array.from(new Set(docs.map((d) => d.folder || '')));
                    setExpandedFolders(folders);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFolder = (folder: string) => {
        setExpandedFolders((prev) => {
            if (prev.includes(folder)) {
                return prev.filter((f) => f !== folder);
            }
            return [...prev, folder];
        });
    };

    const folderGroups = useMemo(() => {
        const map = new Map<string, INotes[]>();
        for (let i = 0; i < menuItems.length; i++) {
            const note = menuItems[i];
            const folder = note.folder || '';
            if (!map.has(folder)) {
                map.set(folder, []);
            }
            const arr = map.get(folder);
            if (arr) {
                arr.push(note);
            }
        }
        const entries = Array.from(map.entries());
        entries.sort((a, b) => {
            if (a[0] === '') {
                return -1;
            }
            if (b[0] === '') {
                return 1;
            }
            return a[0].localeCompare(b[0]);
        });
        for (let i = 0; i < entries.length; i++) {
            entries[i][1].sort((x, y) => {
                if (x.order !== y.order) {
                    return x.order - y.order;
                }
                return x.title.localeCompare(y.title);
            });
        }
        return entries;
    }, [menuItems]);

    const breadcrumbParts = useMemo(() => {
        if (!folderFilter) {
            return [];
        }
        return folderFilter.split('/').filter((p) => p.length > 0);
    }, [folderFilter]);

    const handleDragStart = (id: string) => {
        setDragId(id);
    };

    const handleDropOnFolder = async (targetFolder: string, targetIndex: number) => {
        if (!dragId) {
            return;
        }
        const dragged = menuItems.find((m) => m._id === dragId);
        if (!dragged) {
            return;
        }
        const sameFolder = (dragged.folder || '') === targetFolder;
        const newOrderMap: Record<string, number> = {};
        const group = folderGroups.find((g) => g[0] === targetFolder);
        const list = group ? [...group[1]] : [];
        if (!sameFolder) {
            const filtered = list.filter((n) => n._id !== dragId);
            filtered.splice(targetIndex, 0, { ...dragged, folder: targetFolder } as INotes);
            for (let i = 0; i < filtered.length; i++) {
                newOrderMap[filtered[i]._id] = i;
            }
            const res = await notesBulkMoveAxios({ noteIds: [dragId], targetFolder, orderMap: newOrderMap });
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Moved to folder');
                axiosGetMenuItems();
            }
        } else {
            const without = list.filter((n) => n._id !== dragId);
            without.splice(targetIndex, 0, dragged);
            for (let i = 0; i < without.length; i++) {
                newOrderMap[without[i]._id] = i;
            }
            const ids = without.map((n) => n._id);
            const res = await notesBulkMoveAxios({ noteIds: ids, orderMap: newOrderMap });
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Reordered');
                axiosGetMenuItems();
            }
        }
        setDragId(null);
    };

    const folderCountLabel = (folder: string, count: number) => {
        if (folder === '') {
            return `Root · ${count}`;
        }
        return `${folder} · ${count}`;
    };

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900 text-zinc-100">
            <div className="border-b border-zinc-800 bg-zinc-950 px-2 py-2">
                <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400" aria-label="Folder breadcrumb">
                    <button
                        type="button"
                        className={`rounded px-1.5 py-0.5 ${!folderFilter ? 'bg-zinc-800 text-zinc-100' : 'hover:bg-zinc-800'}`}
                        onClick={() => {
                            setFolderFilter('');
                        }}
                        aria-label="Show all folders"
                    >
                        All
                    </button>
                    {breadcrumbParts.map((part, idx) => {
                        const path = breadcrumbParts.slice(0, idx + 1).join('/');
                        return (
                            <span key={idx} className="flex items-center gap-1">
                                <span className="text-zinc-600">/</span>
                                <button
                                    type="button"
                                    className="rounded px-1 py-0.5 text-zinc-300 hover:bg-zinc-800"
                                    onClick={() => {
                                        setFolderFilter(path);
                                    }}
                                    aria-label={`Filter folder ${path}`}
                                >
                                    {part}
                                </button>
                            </span>
                        );
                    })}
                    {folderFilter && (
                        <span className="ml-auto text-[10px] text-zinc-500">{folderGroups.find((g) => g[0] === folderFilter)?.[1].length || 0} notes</span>
                    )}
                </div>
            </div>
            <nav className="flex flex-col" aria-label="Notes folder hierarchy">
                {folderGroups.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-zinc-500">No notes in this workspace</div>
                )}
                {folderGroups.map((group) => {
                    const folder = group[0];
                    const notes = group[1];
                    if (folderFilter && folder !== folderFilter) {
                        return null;
                    }
                    const isExpanded = expandedFolders.includes(folder);
                    return (
                        <div key={folder || '__root__'} className="border-b border-zinc-800 last:border-0">
                            <button
                                type="button"
                                className="flex w-full items-center gap-1.5 bg-zinc-950 px-2 py-2 text-left hover:bg-zinc-800/60"
                                onClick={() => toggleFolder(folder)}
                                aria-label={isExpanded ? `Collapse folder ${folder || 'Root'}` : `Expand folder ${folder || 'Root'}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropOnFolder(folder, notes.length)}
                            >
                                <span className="text-zinc-500">{isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
                                <span className="text-zinc-400">{isExpanded ? <FolderOpen size={14} /> : <FolderIcon size={14} />}</span>
                                <span className="flex-1 truncate text-xs font-medium text-zinc-200">{folder || 'Root'}</span>
                                <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-400">{notes.length}</span>
                                <span
                                    className="rounded px-1 py-0.5 text-[10px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFolderFilter(folder);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Filter to ${folder || 'root'} folder`}
                                >
                                    filter
                                </span>
                            </button>
                            {isExpanded && (
                                <div className="bg-zinc-900">
                                    {notes.length === 0 && (
                                        <div className="px-4 py-2 text-[11px] text-zinc-500">Empty folder</div>
                                    )}
                                    {notes.map((note, idx) => {
                                        const isActive = activeItem === note._id;
                                        return (
                                            <div
                                                key={note._id}
                                                draggable
                                                onDragStart={() => handleDragStart(note._id)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => handleDropOnFolder(folder, idx)}
                                                className={`group flex items-center gap-1 border-l-2 px-1 py-1.5 ${isActive ? 'border-indigo-600 bg-indigo-950/30' : 'border-transparent bg-zinc-900 hover:bg-zinc-800/70'} ${idx % 2 === 1 ? 'bg-zinc-800/20' : ''}`}
                                            >
                                                <span className="cursor-grab text-zinc-600 group-hover:text-zinc-400" aria-hidden>
                                                    <GripVertical size={12} />
                                                </span>
                                                <Link
                                                    to={`/user/notes?action=edit&id=${note._id}&workspace=${workspaceId}`}
                                                    title={note.title}
                                                    onClick={() => {
                                                        setActiveItem(note._id);
                                                        setStateNotesModalOpenStatus(false);
                                                    }}
                                                    className="min-w-0 flex-1 truncate text-left text-sm text-zinc-200"
                                                    aria-label={`Open note ${note.title}`}
                                                >
                                                    {note.title || 'Untitled'}
                                                </Link>
                                                {note.isStar && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-label="Starred" />}
                                            </div>
                                        );
                                    })}
                                    <div
                                        className="h-2"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDropOnFolder(folder, notes.length)}
                                        aria-label={`Drop at end of ${folder || 'root'}`}
                                    />
                                    <div className="px-2 pb-2 text-[10px] text-zinc-500">{folderCountLabel(folder, notes.length)}</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

export default ComponentFolderAndFileList;
