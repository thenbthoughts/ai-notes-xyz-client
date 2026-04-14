import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSetAtom } from 'jotai';
import htmlToMarkdown from '@wcj/html-to-markdown';

import { jotaiStateNotesWorkspaceRefresh } from '../../stateJotai/notesStateJotai.ts';
import { INotes } from '../../../../../../types/pages/tsNotes.ts';
import QuillEditorCustom1 from '../../../../../../components/quillJs/QuillEditorCustom1/QuillEditorCustom1';
import CommentCommonComponent from '../../../../../../components/commentCommonComponent/CommentCommonComponent';
import CommonComponentAiFaq from '../../../../../../components/commonComponent/commonComponentAiFaq/CommonComponentAiFaq';
import CommonComponentAiKeywords from '../../../../../../components/commonComponent/commonComponentAiKeywords/CommonComponentAiKeywords';
import SpeechToTextComponent from '../../../../../../components/componentCommon/SpeechToTextComponent';
import { NotesWorkspacePicker } from '../../sectionLeft/NotesWorkspacePicker.tsx';

const panelTitle =
    'text-[10px] font-medium uppercase tracking-wider text-zinc-400';

const ComponentNotesEdit = ({
    notesObj
}: {
    notesObj: INotes
}) => {
    const setWorkspaceRefresh = useSetAtom(jotaiStateNotesWorkspaceRefresh);
    const navigate = useNavigate();

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    });

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
    });

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
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                return;
            }

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
        <div className="flex min-h-0 min-w-0 max-w-full flex-col overflow-x-hidden bg-zinc-50 text-zinc-900">
            {/* Command bar: stack on narrow viewports so actions don’t overflow */}
            <header className="sticky top-0 z-30 flex flex-col gap-1.5 border-b border-zinc-100 bg-white/90 px-2 py-1.5 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2 sm:px-4 sm:py-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Link
                        to={`/user/notes?workspace=${formData.notesWorkspaceId}`}
                        className="inline-flex h-9 min-w-0 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
                    >
                        <LucideArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
                        Notes
                    </Link>

                    <span className="hidden min-w-0 truncate font-mono text-[10px] text-zinc-400/90 sm:inline md:hidden lg:inline">
                        · {shortId}
                    </span>
                </div>

                <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:w-auto sm:justify-end">
                    <button
                        type="button"
                        onClick={openAiChatWithNote}
                        title="AI chat"
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-600 px-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-violet-500 sm:px-3"
                    >
                        <LucideMessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">AI chat</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteRecord()}
                        title="Delete note"
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-red-200/80 bg-white px-2.5 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 sm:px-3"
                    >
                        <LucideTrash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                    <button
                        type="button"
                        disabled={requestEdit.loading}
                        onClick={() => editRecord()}
                        title={requestEdit.loading ? 'Saving…' : 'Save'}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-600/20 bg-emerald-600 px-3 text-xs font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-50 sm:px-3.5"
                    >
                        <LucideSave className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="max-[380px]:hidden">{requestEdit.loading ? 'Saving…' : 'Save'}</span>
                    </button>
                </div>
            </header>

            {/* Body: editor + sidebar */}
            <div className="flex min-w-0 flex-1 flex-col xl:flex-row xl:items-stretch">
                {/* Main column */}
                <main className="min-w-0 max-w-full flex-1 border-zinc-100 xl:border-r">
                    <div className="border-b border-zinc-100 bg-white px-3 py-3 sm:px-8 sm:py-6">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isStar: !formData.isStar })}
                                className={
                                    (formData.isStar
                                        ? 'border-amber-200/80 bg-amber-50 text-amber-900 '
                                        : 'border-zinc-200/80 bg-zinc-50 text-zinc-500 hover:text-zinc-800 ') +
                                    'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors'
                                }
                            >
                                <LucideStar
                                    className={'h-3.5 w-3.5 ' + (formData.isStar ? 'fill-amber-400 text-amber-600' : '')}
                                    strokeWidth={2}
                                />
                                Starred
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
                                    className="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-50"
                                    onClick={() => setFormData({ ...formData, title: '' })}
                                >
                                    Clear title <LucideX className="ml-0.5 inline h-3 w-3" />
                                </button>
                            )}
                            {formData.title.length >= 1 && (
                                <button
                                    type="button"
                                    className="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-zinc-50"
                                    onClick={() => {
                                        navigator.clipboard.writeText(formData.title);
                                        toast.success('Title copied');
                                    }}
                                >
                                    Copy <LucideCopy className="ml-0.5 inline h-3 w-3" />
                                </button>
                            )}
                        </div>

                        <label className={panelTitle + ' mb-0.5 block sm:mb-1'}>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            className="w-full border-0 border-b border-zinc-200/90 bg-transparent pb-2 text-xl font-semibold tracking-tight text-zinc-950 placeholder:text-zinc-400 transition-colors focus:border-emerald-500/80 focus:outline-none focus:ring-0 sm:text-2xl"
                            placeholder="Untitled note"
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />

                        <div className="mt-3 sm:mt-4">
                            <label className={panelTitle + ' mb-1.5 block sm:mb-2'}>Tags</label>
                            <div className="mb-1.5 flex flex-wrap gap-1.5 sm:mb-2">
                                {formData.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 rounded-md border border-zinc-200/80 bg-zinc-100/80 px-2 py-0.5 text-[11px] font-medium text-zinc-800"
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
                                    className="min-w-0 flex-1 rounded-lg border border-zinc-200/90 bg-white py-2 px-3 text-sm shadow-sm transition-shadow focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                                    placeholder="Add tag, Enter"
                                    onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
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
                        </div>
                    </div>

                    <div className="bg-white px-3 py-3 sm:px-8 sm:py-5">
                        <label className={panelTitle + ' mb-1.5 block sm:mb-2'}>Body</label>
                        <div
                            className="max-w-full min-w-0 overflow-x-auto rounded-xl border border-zinc-200/80 bg-white shadow-sm [&_.ql-container]:max-w-full [&_.ql-snow]:max-w-full [&_.ql-toolbar.ql-snow]:flex [&_.ql-toolbar.ql-snow]:flex-wrap [&_.ql-toolbar.ql-snow]:justify-start [&_.ql-toolbar.ql-snow]:gap-y-1 [&_.ql-toolbar.ql-snow]:py-2"
                        >
                            <QuillEditorCustom1
                                value={formData.description}
                                setValue={(value) => setFormData({ ...formData, description: value })}
                                featureType="notes"
                                parentEntityId={notesObj._id}
                                subType="messages"
                            />
                        </div>
                    </div>

                    <section className="border-t border-zinc-100 bg-zinc-50/80 px-3 py-4 sm:px-8 sm:py-5">
                        <h3 className={panelTitle + ' mb-1.5 sm:mb-2'}>Comments</h3>
                        <div className="rounded-xl border border-zinc-200/60 bg-white p-2.5 text-sm shadow-sm sm:p-3 [&_*]:text-sm">
                            <CommentCommonComponent commentType="note" recordId={notesObj._id} />
                        </div>
                    </section>
                </main>

                {/* Sidebar */}
                <aside className="w-full min-w-0 max-w-full shrink-0 border-zinc-100 bg-zinc-100/40 xl:w-[340px] xl:border-t-0 xl:border-l">
                    <div className="px-3 py-3 sm:px-4 sm:py-5 xl:sticky xl:top-[52px] xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:overscroll-contain">
                        <div className="mb-3 rounded-xl border border-zinc-200/60 bg-white p-2.5 shadow-sm sm:mb-4 sm:p-3">
                            <NotesWorkspacePicker
                                selectedId={formData.notesWorkspaceId}
                                onSelect={(workspaceId: string) =>
                                    setFormData({ ...formData, notesWorkspaceId: workspaceId })}
                            />
                        </div>

                        {(formData.aiTags.length > 0 ||
                            formData.aiSummary.length > 0 ||
                            formData.aiSuggestions.length > 0) && (
                            <div className="mb-3 space-y-1.5 sm:mb-4 sm:space-y-2">
                                <h3 className={`${panelTitle} flex items-center gap-1 text-zinc-600`}>
                                    <LucideSparkles className="h-3 w-3" />
                                    From AI
                                </h3>
                                {formData.aiTags.length > 0 && (
                                    <div className="rounded-xl border border-zinc-200/60 bg-white p-2 shadow-sm sm:p-2.5">
                                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">Tags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.aiTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="rounded-md border border-violet-200/60 bg-violet-50/90 px-2 py-0.5 text-[11px] text-violet-900"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {formData.aiSummary.length > 0 && (
                                    <details className="group rounded-xl border border-zinc-200/60 bg-white shadow-sm open:shadow-md" open>
                                        <summary className="cursor-pointer list-none rounded-t-xl px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 marker:content-none sm:px-3 sm:py-2.5 [&::-webkit-details-marker]:hidden">
                                            <span className="flex items-center justify-between">
                                                Summary
                                                <LucideBot className="h-3.5 w-3.5 text-violet-500" />
                                            </span>
                                        </summary>
                                        <div className="border-t border-zinc-100 px-2.5 py-2 text-xs leading-relaxed text-zinc-600 whitespace-pre-line sm:px-3 sm:py-2.5">
                                            {formData.aiSummary}
                                        </div>
                                    </details>
                                )}
                                {formData.aiSuggestions.length > 0 && (
                                    <details className="rounded-xl border border-zinc-200/60 bg-white shadow-sm">
                                        <summary className="cursor-pointer list-none rounded-t-xl px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 marker:content-none sm:px-3 sm:py-2.5 [&::-webkit-details-marker]:hidden">
                                            Suggestions
                                        </summary>
                                        <div className="border-t border-zinc-100 px-2.5 py-2 text-xs leading-relaxed text-zinc-600 whitespace-pre-line sm:px-3 sm:py-2.5">
                                            {formData.aiSuggestions}
                                        </div>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="mb-3 space-y-2 sm:mb-4 sm:space-y-3 [&_.rounded-sm]:rounded-xl">
                            <CommonComponentAiFaq sourceId={notesObj._id} />
                        </div>
                        <div className="[&_.rounded-sm]:rounded-xl">
                            <CommonComponentAiKeywords
                                sourceId={notesObj._id}
                                metadataSourceType="notes"
                            />
                        </div>
                    </div>
                </aside>
            </div>
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
            <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-zinc-50 px-3 sm:px-4">
                <div className="max-w-xs rounded-xl border border-zinc-200/60 bg-white p-4 text-center shadow-sm sm:p-6">
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Loading note</p>
                    <div className="loader mt-3" />
                </div>
            </div>
        );
    }

    if (list.length === 0) {
        return (
            <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-zinc-50 px-3 sm:px-4">
                <div className="max-w-md rounded-xl border border-red-200/60 bg-white p-4 text-center shadow-sm sm:p-6">
                    <p className="text-sm font-medium text-red-800">This note doesn’t exist or was removed.</p>
                    <button
                        type="button"
                        className="mt-4 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-zinc-800"
                        onClick={() => navigate('/user/notes')}
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
