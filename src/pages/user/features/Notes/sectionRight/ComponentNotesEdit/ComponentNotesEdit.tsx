import { useState, useEffect, useMemo, useRef } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import {
    LucideArrowLeft,
    LucideBot,
    LucideCopy,
    LucideMessageSquare,
    LucidePlus,
    LucideSave,
    LucideSparkles,
    LucideStar,
    LucideTrash2,
    LucideX,
    LucideHistory,
    LucideFileText,
    LucideCode,
    LucideMaximize2,
    LucideMinimize2,
    LucideCalendar,
    LucideDownload,
    LucideCopy as LucideDuplicate,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAtom, useSetAtom } from 'jotai';
import htmlToMarkdown from '@wcj/html-to-markdown';
import { Helmet } from 'react-helmet-async';
import { DateTime } from 'luxon';

import { jotaiStateNotesWorkspaceRefresh, jotaiNotesAutosave, jotaiNotesMarkdownRaw } from '../../stateJotai/notesStateJotai.ts';
import { INotes } from '../../../../../../types/pages/tsNotes.ts';
import QuillEditorCustom1 from '../../../../../../components/quillJs/QuillEditorCustom1/QuillEditorCustom1';
import CommentCommonComponent from '../../../../../../components/commentCommonComponent/CommentCommonComponent';
import CommonComponentAiFaq from '../../../../../../components/commonComponent/commonComponentAiFaq/CommonComponentAiFaq';
import CommonComponentAiKeywords from '../../../../../../components/commonComponent/commonComponentAiKeywords/CommonComponentAiKeywords';
import SpeechToTextComponent from '../../../../../../components/componentCommon/SpeechToTextComponent';
import { NotesWorkspacePicker } from '../../sectionLeft/NotesWorkspacePicker.tsx';
import { notesVersionsGetAxios } from '../../utils/notesListAxios.ts';

const panelTitle =
    'text-[10px] font-medium uppercase tracking-wider text-zinc-400';

type VersionDoc = {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    folder: string;
    createdAtUtc: string;
};

const stripHtml = (html: string) => {
    if (!html) {
        return '';
    }
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const ComponentNotesVersionModal = ({
    noteId,
    isOpen,
    onClose,
    onRestore,
}: {
    noteId: string;
    isOpen: boolean;
    onClose: () => void;
    onRestore: (doc: VersionDoc) => void;
}) => {
    const [versions, setVersions] = useState<VersionDoc[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const fetch = async () => {
            setLoading(true);
            const res = await notesVersionsGetAxios({ noteId });
            if (res.error) {
                toast.error(res.error);
            } else {
                setVersions(res.docs as VersionDoc[]);
            }
            setLoading(false);
        };
        fetch();
    }, [isOpen, noteId]);
    if (!isOpen) {
        return null;
    }
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Version history">
            <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <h3 className="text-sm font-semibold text-zinc-100">Version history</h3>
                    <button type="button" className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" onClick={onClose} aria-label="Close version history">
                        <LucideX className="h-4 w-4" />
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-3">
                    {loading && <div className="py-6 text-center text-xs text-zinc-500">Loading versions…</div>}
                    {!loading && versions.length === 0 && <div className="py-6 text-center text-xs text-zinc-500">No versions yet. Edits create snapshots.</div>}
                    {!loading && versions.map((v) => {
                        const rel = DateTime.fromISO(new Date(v.createdAtUtc).toISOString()).toRelative() || '';
                        return (
                            <div key={v._id} className="mb-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-xs font-medium text-zinc-200">{v.title || 'Untitled'}</span>
                                    <span className="shrink-0 text-[10px] text-zinc-500">{rel}</span>
                                </div>
                                <p className="mt-1 line-clamp-3 text-xs text-zinc-400">{stripHtml(v.description).slice(0, 180)}</p>
                                <div className="mt-2 flex gap-1">
                                    <button type="button" className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-indigo-500" onClick={() => onRestore(v)} aria-label={`Restore version ${v.title}`}>
                                        Restore
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(v.description);
                                                toast.success('Version copied');
                                            } catch (e) {
                                                toast.error('Copy failed');
                                            }
                                        }}
                                        aria-label="Copy version content"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ComponentNotesDeleteConfirm = ({
    isOpen,
    onCancel,
    onConfirm,
}: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    if (!isOpen) {
        return null;
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Confirm delete">
            <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                <h3 className="text-sm font-semibold text-zinc-100">Delete note?</h3>
                <p className="mt-1 text-xs text-zinc-400">This action cannot be undone.</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700" onClick={onCancel} aria-label="Cancel delete">Cancel</button>
                    <button type="button" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500" onClick={onConfirm} aria-label="Confirm delete note">Delete</button>
                </div>
            </div>
        </div>
    );
};

const ComponentNotesEdit = ({
    notesObj
}: {
    notesObj: INotes
}) => {
    const setWorkspaceRefresh = useSetAtom(jotaiStateNotesWorkspaceRefresh);
    const navigate = useNavigate();
    const [autosaveEnabled, setAutosaveEnabled] = useAtom(jotaiNotesAutosave);
    const [markdownRaw, setMarkdownRaw] = useAtom(jotaiNotesMarkdownRaw);
    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    });
    const [showVersions, setShowVersions] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [rawMarkdownText, setRawMarkdownText] = useState<string>('');
    const autosaveTimerRef = useRef<number | null>(null);
    const [lastSavedAt, setLastSavedAt] = useState<string>('');

    const [formData, setFormData] = useState({
        title: notesObj.title,
        description: notesObj.description,
        isStar: notesObj.isStar,
        tags: notesObj.tags,
        aiTags: notesObj.aiTags,
        aiSummary: notesObj.aiSummary,
        aiSuggestions: notesObj.aiSuggestions,
        tagsInput: '',
        notesWorkspaceId: notesObj.notesWorkspaceId,
        folder: (notesObj as any).folder || '',
        order: (notesObj as any).order || 0,
    } as {
        title: string;
        description: string;
        isStar: boolean;
        tags: string[];
        aiTags: string[];
        aiSummary: string;
        aiSuggestions: string;
        tagsInput: string;
        notesWorkspaceId: string;
        folder: string;
        order: number;
    });

    const initialSnapshot = useRef<string>(JSON.stringify({ title: notesObj.title, description: notesObj.description, isStar: notesObj.isStar, tags: notesObj.tags, folder: (notesObj as any).folder || '', order: (notesObj as any).order || 0, notesWorkspaceId: notesObj.notesWorkspaceId }));

    const isDirty = useMemo(() => {
        const cur = JSON.stringify({ title: formData.title, description: formData.description, isStar: formData.isStar, tags: formData.tags, folder: formData.folder, order: formData.order, notesWorkspaceId: formData.notesWorkspaceId });
        return cur !== initialSnapshot.current;
    }, [formData]);

    const wordStats = useMemo(() => {
        const text = `${formData.title} ${stripHtml(formData.description)}`;
        const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
        const chars = text.length;
        const readMin = Math.max(1, Math.ceil(words.length / 200));
        return { words: words.length, chars, readMin };
    }, [formData.title, formData.description]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => {
            window.removeEventListener('beforeunload', handler);
        };
    }, [isDirty]);

    useEffect(() => {
        if (!autosaveEnabled) {
            return;
        }
        if (!isDirty) {
            return;
        }
        if (autosaveTimerRef.current) {
            window.clearTimeout(autosaveTimerRef.current);
        }
        autosaveTimerRef.current = window.setTimeout(() => {
            editRecord();
        }, 2000);
        return () => {
            if (autosaveTimerRef.current) {
                window.clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [formData, autosaveEnabled, isDirty]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            if (!isTyping && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                editRecord();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [formData]);

    useEffect(() => {
        if (markdownRaw) {
            htmlToMarkdown({ html: formData.description }).then((md) => {
                setRawMarkdownText(md);
            });
        }
    }, [markdownRaw, formData.description]);

    const editRecord = async () => {
        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    "_id": notesObj._id,
                },
            } as AxiosRequestConfig;
            await axiosCustom.request(config);
            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Note updated successfully!');
            setWorkspaceRefresh(prev => prev + 1);
            initialSnapshot.current = JSON.stringify({ title: formData.title, description: formData.description, isStar: formData.isStar, tags: formData.tags, folder: formData.folder, order: formData.order, notesWorkspaceId: formData.notesWorkspaceId });
            setLastSavedAt(new Date().toISOString());
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the note. Please try again later.');
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the note. Please try again later.',
            });
        }
    };

    const deleteRecord = async () => {
        try {
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: notesObj._id,
                },
            };

            await axiosCustom.request(config);

            setWorkspaceRefresh(prev => prev + 1);
            toast.success('Note deleted successfully!');
            navigate(`/user/notes?workspace=${formData.notesWorkspaceId}`);
        } catch (error) {
            console.error(error);
        }
    };

    const duplicateNote = async () => {
        try {
            const res = await axiosCustom.post('/api/notes/crud/notesAdd', {
                title: `${formData.title} (copy)`,
                description: formData.description,
                notesWorkspaceId: formData.notesWorkspaceId,
                tags: formData.tags,
                folder: formData.folder,
                isStar: false,
            });
            if (res.data.doc) {
                toast.success('Duplicated');
                navigate(`/user/notes?action=edit&id=${res.data.doc._id}&workspace=${formData.notesWorkspaceId}`);
            }
        } catch (e) {
            toast.error('Duplicate failed');
        }
    };

    const exportMd = async () => {
        try {
            const md = await htmlToMarkdown({ html: formData.description });
            const content = `# ${formData.title}\n\n${md}`;
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_')}.md`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported .md');
        } catch (e) {
            toast.error('Export failed');
        }
    };

    const exportHtml = () => {
        try {
            const content = `<html><head><meta charset="utf-8"><title>${formData.title}</title></head><body><h1>${formData.title}</h1>${formData.description}</body></html>`;
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_')}.html`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported .html');
        } catch (e) {
            toast.error('Export failed');
        }
    };

    const insertDate = () => {
        const now = DateTime.now().toFormat('yyyy-MM-dd HH:mm');
        setFormData({ ...formData, description: `${formData.description}<p>${now}</p>` });
    };

    const openAiChatWithNote = async () => {
        try {
            const resultThread = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: false,
                    isAutoAiContextSelectEnabled: false,
                    aiModelProvider: 'openrouter',
                    aiModelName: 'openrouter/auto',
                }
            );

            const tempThreadId = resultThread?.data?.thread?._id;

            const markdownContent = await htmlToMarkdown({
                html: formData.description,
            });
            const content = `Note: ${markdownContent}`;
            await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
                threadId: tempThreadId,
                type: "text",
                content: content,
                visibility: 'public',
                tags: [],
                imagePathsArr: []
            });

            navigate(`/user/chat?id=${tempThreadId}`);
        } catch (error) {
            console.error(error);
            toast.error('Error chatting with AI. Please try again.');
        }
    };

    const shortId = notesObj._id.slice(-6);

    return (
        <div className={`flex min-h-0 min-w-0 max-w-full flex-col overflow-x-hidden bg-zinc-950 text-zinc-100 ${isFullscreen ? 'fixed inset-0 z-40 overflow-y-auto' : ''}`}>
            <Helmet><title>{formData.title ? `${formData.title} · Notes` : 'Edit Note · Notes'}</title></Helmet>
            <header className="sticky top-0 z-30 flex flex-col gap-1.5 border-b border-zinc-800 bg-zinc-900/90 px-2 py-1.5 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2 sm:px-4 sm:py-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Link
                        to={`/user/notes?workspace=${formData.notesWorkspaceId}`}
                        className="inline-flex h-9 min-w-0 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700/90 bg-zinc-900 px-3 text-xs font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800"
                        aria-label="Back to notes list"
                    >
                        <LucideArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
                        Notes
                    </Link>

                    <span className="hidden min-w-0 truncate font-mono text-[10px] text-zinc-400/90 sm:inline md:hidden lg:inline">
                        · {shortId}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isDirty ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`} aria-label={isDirty ? 'Unsaved changes' : 'All saved'}>
                        {isDirty ? 'Dirty' : 'Saved'}
                    </span>
                    {lastSavedAt && <span className="hidden text-[10px] text-zinc-500 sm:inline">· Saved {DateTime.fromISO(lastSavedAt).toRelative()}</span>}
                </div>

                <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:w-auto sm:justify-end">
                    <button
                        type="button"
                        onClick={() => setIsFullscreen((v) => !v)}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 text-xs font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800 sm:px-3"
                    >
                        {isFullscreen ? <LucideMinimize2 className="h-3.5 w-3.5" /> : <LucideMaximize2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowVersions(true)}
                        title="Version history"
                        aria-label="Open version history"
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 text-xs font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800 sm:px-3"
                    >
                        <LucideHistory className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">History</span>
                    </button>
                    <button
                        type="button"
                        onClick={openAiChatWithNote}
                        title="AI chat"
                        aria-label="Open AI chat with note"
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-600 px-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-violet-9500 sm:px-3"
                    >
                        <LucideMessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">AI chat</span>
                    </button>
                    <button
                        type="button"
                        onClick={duplicateNote}
                        title="Duplicate note"
                        aria-label="Duplicate note"
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 text-xs font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800 sm:px-3"
                    >
                        <LucideDuplicate className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">Duplicate</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDelete(true)}
                        title="Delete note"
                        aria-label="Delete note"
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-red-800/80 bg-zinc-900 px-2.5 text-xs font-medium text-red-400 shadow-sm transition-colors hover:bg-red-950/40 sm:px-3"
                    >
                        <LucideTrash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                    <button
                        type="button"
                        disabled={requestEdit.loading}
                        onClick={() => editRecord()}
                        title={requestEdit.loading ? 'Saving…' : 'Save (Ctrl+S)'}
                        aria-label={requestEdit.loading ? 'Saving note' : 'Save note'}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-600/20 bg-emerald-600 px-3 text-xs font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-emerald-9500 disabled:opacity-50 sm:px-3.5"
                    >
                        <LucideSave className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="max-[380px]:hidden">{requestEdit.loading ? 'Saving…' : isDirty ? 'Save*' : 'Saved'}</span>
                    </button>
                </div>
            </header>

            <div className="flex min-w-0 flex-1 flex-col">
                <main className="min-w-0 max-w-full flex-1">
                    <div className="border-b border-zinc-800 bg-zinc-900 px-3 py-3 sm:px-8 sm:py-6">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isStar: !formData.isStar })}
                                aria-label={formData.isStar ? 'Unstar note' : 'Star note'}
                                className={
                                    (formData.isStar
                                        ? 'border-amber-800/80 bg-amber-950/40 text-amber-200 '
                                        : 'border-zinc-700/80 bg-zinc-950 text-zinc-500 hover:text-zinc-200 ') +
                                    'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors'
                                }
                            >
                                <LucideStar
                                    className={'h-3.5 w-3.5 ' + (formData.isStar ? 'fill-amber-400 text-amber-600' : '')}
                                    strokeWidth={2}
                                />
                                Starred
                            </button>
                            <label className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300">
                                <input type="checkbox" checked={autosaveEnabled} onChange={(e) => setAutosaveEnabled(e.target.checked)} aria-label="Toggle autosave" />
                                Autosave 2s
                            </label>
                            <button type="button" className="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-800" onClick={insertDate} aria-label="Insert current date">
                                <LucideCalendar className="mr-1 inline h-3 w-3" /> Date
                            </button>
                            <button type="button" className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${markdownRaw ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-900 border-zinc-700 text-zinc-300'}`} onClick={() => setMarkdownRaw(!markdownRaw)} aria-label="Toggle markdown raw view">
                                {markdownRaw ? <LucideCode className="mr-1 inline h-3 w-3" /> : <LucideFileText className="mr-1 inline h-3 w-3" />} {markdownRaw ? 'Raw' : 'Rich'}
                            </button>
                            <button type="button" className="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-800" onClick={exportMd} aria-label="Export as markdown">
                                <LucideDownload className="mr-1 inline h-3 w-3" /> .md
                            </button>
                            <button type="button" className="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-800" onClick={exportHtml} aria-label="Export as HTML">
                                <LucideDownload className="mr-1 inline h-3 w-3" /> .html
                            </button>
                            <SpeechToTextComponent
                                onTranscriptionComplete={(text: string) => {
                                    if (text.trim() !== '') {
                                        setFormData({ ...formData, title: formData.title + ' ' + text });
                                    }
                                }}
                                parentEntityId={notesObj._id}
                            />
                            {formData.title.length >= 1 && formData.title.includes('Empty Note') && (
                                <button
                                    type="button"
                                    className="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-800"
                                    onClick={() => setFormData({ ...formData, title: '' })}
                                    aria-label="Clear title"
                                >
                                    Clear title <LucideX className="ml-0.5 inline h-3 w-3" />
                                </button>
                            )}
                            {formData.title.length >= 1 && (
                                <button
                                    type="button"
                                    className="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-800"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(formData.title);
                                            toast.success('Title copied');
                                        } catch (e) {
                                            toast.error('Copy failed');
                                        }
                                    }}
                                    aria-label="Copy title"
                                >
                                    Copy <LucideCopy className="ml-0.5 inline h-3 w-3" />
                                </button>
                            )}
                        </div>

                        <label className={panelTitle + ' mb-0.5 block sm:mb-1'}>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            className="w-full border-0 border-b border-zinc-700/90 bg-transparent pb-2 text-xl font-semibold tracking-tight text-zinc-50 placeholder:text-zinc-400 transition-colors focus:border-emerald-500/80 focus:outline-none focus:ring-0 sm:text-2xl"
                            placeholder="Untitled note"
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            aria-label="Note title"
                        />

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-2.5 shadow-sm sm:p-3">
                                <NotesWorkspacePicker
                                    selectedId={formData.notesWorkspaceId}
                                    onSelect={(workspaceId: string) =>
                                        setFormData({ ...formData, notesWorkspaceId: workspaceId })}
                                />
                            </div>
                            <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-2.5 shadow-sm sm:p-3">
                                <label className={panelTitle + ' mb-1 block'}>Folder</label>
                                <input
                                    type="text"
                                    value={formData.folder}
                                    onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                                    placeholder="e.g. Work/Projects"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
                                    aria-label="Note folder"
                                />
                                <p className="mt-1 text-[10px] text-zinc-500">Grouping in left hierarchy uses this folder.</p>
                            </div>
                        </div>

                    </div>

                    <div className="bg-zinc-900 px-3 py-3 sm:px-8 sm:py-5">
                        <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                            <label className={panelTitle}>Body</label>
                            <span className="text-[11px] text-zinc-500">{wordStats.words} words · {wordStats.chars} chars · {wordStats.readMin} min</span>
                        </div>
                        {markdownRaw ? (
                            <textarea
                                value={rawMarkdownText}
                                onChange={(e) => {
                                    setRawMarkdownText(e.target.value);
                                    setFormData({ ...formData, description: e.target.value });
                                }}
                                className="min-h-[320px] w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                placeholder="Markdown raw…"
                                aria-label="Markdown raw editor"
                            />
                        ) : (
                            <div
                                className="max-w-full min-w-0 overflow-x-auto rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-sm [&_.ql-container]:max-w-full [&_.ql-snow]:max-w-full [&_.ql-toolbar.ql-snow]:flex [&_.ql-toolbar.ql-snow]:flex-wrap [&_.ql-toolbar.ql-snow]:justify-start [&_.ql-toolbar.ql-snow]:gap-y-1 [&_.ql-toolbar.ql-snow]:py-2"
                            >
                                <QuillEditorCustom1
                                    value={formData.description}
                                    setValue={(value) => setFormData({ ...formData, description: value })}
                                    featureType="notes"
                                    parentEntityId={notesObj._id}
                                    subType="messages"
                                />
                            </div>
                        )}
                        <div className="mt-2 flex gap-1 text-[11px] text-zinc-500">
                            <span>Words: {wordStats.words}</span>
                            <span>· Chars: {wordStats.chars}</span>
                            <span>· Read: {wordStats.readMin} min</span>
                            {autosaveEnabled && isDirty && <span className="text-amber-400">· Autosaving in 2s</span>}
                        </div>
                    </div>

                    <section className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-4 sm:px-8 sm:py-5">
                        <label className={panelTitle + ' mb-1.5 block sm:mb-2'}>Tags</label>
                        <div className="mb-1.5 flex flex-wrap gap-1.5 sm:mb-2">
                            {formData.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700/80 bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-200"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        className="text-zinc-500 hover:text-red-600"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                tags: formData.tags.filter((_, i) => i !== idx),
                                            })}
                                        aria-label={`Remove ${tag}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            <input
                                type="text"
                                value={formData.tagsInput || ''}
                                className="min-w-0 flex-1 rounded-lg border border-zinc-700/90 bg-zinc-900 py-2 px-3 text-sm shadow-sm transition-shadow focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                                placeholder="Add tag, Enter"
                                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                                aria-label="Add tag input"
                                onKeyDown={(e) => {
                                    if (
                                        (e.key === 'Enter' || e.key === ',') &&
                                        formData.tagsInput &&
                                        formData.tagsInput.trim() !== ''
                                    ) {
                                        e.preventDefault();
                                        const newTag = formData.tagsInput.trim();
                                        if (!formData.tags.includes(newTag)) {
                                            setFormData({
                                                ...formData,
                                                tags: [...formData.tags, newTag],
                                                tagsInput: '',
                                            });
                                        } else {
                                            setFormData({ ...formData, tagsInput: '' });
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white shadow-sm transition-colors hover:bg-zinc-800"
                                onClick={() => {
                                    if (formData.tagsInput && formData.tagsInput.trim() !== '') {
                                        const newTag = formData.tagsInput.trim();
                                        if (!formData.tags.includes(newTag)) {
                                            setFormData({
                                                ...formData,
                                                tags: [...formData.tags, newTag],
                                                tagsInput: '',
                                            });
                                        } else {
                                            setFormData({ ...formData, tagsInput: '' });
                                        }
                                    }
                                }}
                                aria-label="Add tag"
                            >
                                <LucidePlus className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </div>
                    </section>

                    <section className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-4 sm:px-8 sm:py-5">
                        <h3 className={panelTitle + ' mb-1.5 sm:mb-2'}>Comments</h3>
                        <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-2.5 text-sm shadow-sm sm:p-3 [&_*]:text-sm">
                            <CommentCommonComponent commentType="note" recordId={notesObj._id} />
                        </div>
                    </section>

                    {(formData.aiTags.length > 0 ||
                        formData.aiSummary.length > 0 ||
                        formData.aiSuggestions.length > 0) && (
                        <section className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-4 sm:px-8 sm:py-5">
                            <h3 className={`${panelTitle} mb-1.5 flex items-center gap-1 text-zinc-400 sm:mb-2`}>
                                <LucideSparkles className="h-3 w-3" />
                                From AI
                            </h3>
                            <div className="space-y-1.5 sm:space-y-2">
                                {formData.aiTags.length > 0 && (
                                    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-2 shadow-sm sm:p-2.5">
                                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">Tags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.aiTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="rounded-md border border-violet-800/60 bg-violet-950/40 px-2 py-0.5 text-[11px] text-violet-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {formData.aiSummary.length > 0 && (
                                    <details className="group rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-sm open:shadow-md" open>
                                        <summary className="cursor-pointer list-none rounded-t-xl px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 marker:content-none sm:px-3 sm:py-2.5 [&::-webkit-details-marker]:hidden">
                                            <span className="flex items-center justify-between">
                                                Summary
                                                <LucideBot className="h-3.5 w-3.5 text-violet-500" />
                                            </span>
                                        </summary>
                                        <div className="border-t border-zinc-800 px-2.5 py-2 text-xs leading-relaxed text-zinc-400 whitespace-pre-line sm:px-3 sm:py-2.5">
                                            {formData.aiSummary}
                                        </div>
                                    </details>
                                )}
                                {formData.aiSuggestions.length > 0 && (
                                    <details className="rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-sm">
                                        <summary className="cursor-pointer list-none rounded-t-xl px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 marker:content-none sm:px-3 sm:py-2.5 [&::-webkit-details-marker]:hidden">
                                            Suggestions
                                        </summary>
                                        <div className="border-t border-zinc-800 px-2.5 py-2 text-xs leading-relaxed text-zinc-400 whitespace-pre-line sm:px-3 sm:py-2.5">
                                            {formData.aiSuggestions}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-4 sm:px-8 sm:py-5">
                        <h3 className={panelTitle + ' mb-1.5 sm:mb-2'}>AI Generated FAQs</h3>
                        <div className="mb-3 space-y-2 sm:mb-4 sm:space-y-3 [&_.rounded-sm]:rounded-xl">
                            <CommonComponentAiFaq sourceId={notesObj._id} />
                        </div>
                        <h3 className={panelTitle + ' mb-1.5 sm:mb-2'}>AI Generated Keywords</h3>
                        <div className="[&_.rounded-sm]:rounded-xl">
                            <CommonComponentAiKeywords
                                sourceId={notesObj._id}
                                metadataSourceType="notes"
                            />
                        </div>
                    </section>

                </main>
            </div>
            <ComponentNotesVersionModal
                noteId={notesObj._id}
                isOpen={showVersions}
                onClose={() => setShowVersions(false)}
                onRestore={(doc) => {
                    setFormData({ ...formData, title: doc.title, description: doc.description, tags: doc.tags, folder: doc.folder || '' });
                    setShowVersions(false);
                    toast.success('Version restored to editor (save to persist)');
                }}
            />
            <ComponentNotesDeleteConfirm isOpen={showDelete} onCancel={() => setShowDelete(false)} onConfirm={() => { setShowDelete(false); deleteRecord(); }} />
        </div>
    );
};

const ComponentNotesEditWrapper = ({
    recordId
}: {
    recordId: string;
}) => {
    const navigate = useNavigate();
    const [list, setList] = useState([] as INotes[]);
    const [loading, setLoading] = useState(false);
    const setWorkspaceRefresh = useSetAtom(jotaiStateNotesWorkspaceRefresh);

    useEffect(() => {
        fetchList();
    }, [recordId]);

    const fetchList = async () => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    recordId: recordId
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            setList(tempArr);
            setWorkspaceRefresh(prev => prev + 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-zinc-950 px-3 sm:px-4">
                <div className="max-w-xs rounded-xl border border-zinc-700/60 bg-zinc-900 p-4 text-center shadow-sm sm:p-6">
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Loading note</p>
                    <div className="loader mt-3" />
                </div>
            </div>
        );
    }

    if (list.length === 0) {
        return (
            <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-zinc-950 px-3 sm:px-4">
                <div className="max-w-md rounded-xl border border-red-800/60 bg-zinc-900 p-4 text-center shadow-sm sm:p-6">
                    <p className="text-sm font-medium text-red-400">This note doesn’t exist or was removed.</p>
                    <button
                        type="button"
                        className="mt-4 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-zinc-800"
                        onClick={() => navigate('/user/notes')}
                        aria-label="Back to notes"
                    >
                        Back to notes
                    </button>
                </div>
            </div>
        );
    }

    return <ComponentNotesEdit notesObj={list[0]} />;
};

export default ComponentNotesEditWrapper;
