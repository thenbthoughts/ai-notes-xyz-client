import { DebounceInput } from 'react-debounce-input';
import { useNavigate } from 'react-router-dom';

import { notesAddAxios, notesQuickDailyNotesAddAxios } from '../utils/notesListAxios.ts';

import { jotaiStateNotesSearch, jotaiStateNotesIsStar, jotaiStateNotesWorkspaceId } from '../stateJotai/notesStateJotai.ts';
import { useAtom } from 'jotai';

import ComponentFolderAndFileList from './ComponentFolderAndFileList.tsx';
import ComponentNotesWorkspace from './ComponentNotesWorkspace.tsx';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { AxiosRequestConfig } from 'axios';
import {
    LucideList,
    LucideMessageCircle,
    LucidePlus,
    LucideRefreshCcw,
    LucideSearch,
    LucideStar,
    LucideX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { notesWorkspaceChatWithAi } from '../utils/notesListAxios.ts';

const btnPrimary =
    'inline-flex items-center gap-0.5 rounded-lg border border-indigo-500/20 bg-indigo-600 px-2 py-1 text-[10px] font-medium uppercase tracking-wide leading-tight text-white shadow-sm transition-colors hover:bg-indigo-500';

const notesWorkspaceChatWithAiLocal = async ({
    notesWorkspaceId,
}: {
    notesWorkspaceId: string;
}) => {
    const toastLoadingId = toast.loading('Starting workspace chat with AI...');
    try {
        // call func
        const result = await notesWorkspaceChatWithAi({ notesWorkspaceId: notesWorkspaceId });
        toast.dismiss(toastLoadingId);
        if (result.error !== '') {
            toast.error(result.error || 'Error workspace chat with AI. Please try again.');
            return;
        }

        // success message
        toast.success(
            'Workspace chat with AI started successfully! Please send a message to start the conversation.',
            {
                duration: 3000,
            }
        );

        // redirect to chat page
        window.location.href = `/user/chat?id=${result.threadId}`;
    } catch (error) {
        console.error('Error workspace chat with AI:', error);
        toast.error('Error workspace chat with AI. Please try again.');
        toast.dismiss(toastLoadingId);
    }
};

const ComponentNotesLeft = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useAtom(jotaiStateNotesSearch);
    const [isStar, setIsStar] = useAtom(jotaiStateNotesIsStar);
    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateNotesWorkspaceId);
    // Fetch chat threads from API

    const notesAddAxiosLocal = async () => {
        try {
            const result = await notesAddAxios({
                notesWorkspaceId: workspaceId,
            });
            if (result.success !== '') {
                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${workspaceId}`)
            }
        } catch (error) {
            console.error(error);
        }
    }

    const notesQuickDailyNotesAddAxiosLocal = async () => {
        const result = await notesQuickDailyNotesAddAxios();
        if (result.success.length > 0) {
            navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`)
        }
    }

    const openRandomNote = async () => {
        try {
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    openRandomNotes: 'true',
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            if (response.data.docs.length === 0) {
                return {
                    success: '',
                    error: 'No notes found. Please add a note first.',
                    recordId: '',
                };
            }

            const doc = response.data.docs[0];

            if (typeof doc._id === 'string') {
                if (doc._id.length === 24) {
                    // redirect to edit page
                    navigate(`/user/notes?action=edit&id=${doc._id}&workspace=${doc.notesWorkspaceId}`)

                    // set workspace id
                    setWorkspaceId(doc.notesWorkspaceId);
                }
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while adding the notes. Please try again.');
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setIsStar('');
    };

    return (
        <div className="space-y-2 px-2 py-2 sm:space-y-3 sm:px-3 sm:py-3">

            <header className="border-b border-zinc-100 pb-2 sm:pb-3">
                <div className="flex items-center gap-2">
                    <span className="h-7 w-0.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                    <div className="min-w-0">
                        <h1 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">Notes</h1>
                        <p className="mt-0.5 font-mono text-[10px] leading-tight text-zinc-400">workspace · filters</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-wrap gap-1">
                <button type="button" className={btnPrimary} onClick={notesAddAxiosLocal}>
                    <LucidePlus size={12} strokeWidth={2} />
                    Add
                </button>
                <button type="button" className={btnPrimary} onClick={openRandomNote}>
                    <LucideRefreshCcw size={12} strokeWidth={2} />
                    Random
                </button>
                <button type="button" className={btnPrimary} onClick={clearFilters}>
                    <LucideList size={12} strokeWidth={2} />
                    Clear
                </button>
                <button type="button" className={btnPrimary} onClick={notesQuickDailyNotesAddAxiosLocal}>
                    <LucidePlus size={12} strokeWidth={2} />
                    Daily
                </button>
                <button
                    type="button"
                    className={btnPrimary}
                    onClick={() => notesWorkspaceChatWithAiLocal({ notesWorkspaceId: workspaceId })}
                >
                    <LucideMessageCircle size={12} strokeWidth={2} />
                    AI chat
                </button>
            </div>

            <ComponentNotesWorkspace />

            <div className="space-y-1">
                <h2 className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">In workspace</h2>
                {workspaceId.length === 24 && (
                    <ComponentFolderAndFileList />
                )}
            </div>

            <section
                className="rounded-xl border border-zinc-200/60 bg-white p-2 shadow-sm sm:p-3"
                aria-label="List filters"
            >
                <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                    <h2 className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                        List filters
                    </h2>
                    {(searchTerm.trim() !== '' || isStar !== '') && (
                        <span className="font-mono text-[9px] text-amber-700" title="Filters change the main note list">
                            active
                        </span>
                    )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <div>
                        <label htmlFor="notes-search" className="sr-only">
                            Search notes
                        </label>
                        <div className="relative flex items-center">
                            <LucideSearch
                                className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-zinc-400"
                                strokeWidth={2}
                                aria-hidden
                            />
                            <DebounceInput
                                id="notes-search"
                                debounceTimeout={500}
                                type="search"
                                placeholder="Search titles & content…"
                                className="w-full rounded-lg border border-zinc-200/90 bg-zinc-50/80 py-2 pl-8 pr-7 text-[11px] text-zinc-900 placeholder:text-zinc-400 transition-shadow focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                                onChange={(e) => setSearchTerm(e.target.value)}
                                value={searchTerm}
                                autoComplete="off"
                            />
                            {searchTerm.length > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-1 flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    <LucideX className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                            Starred
                        </p>
                        <div
                            className="flex w-full rounded-lg border border-zinc-200/80 bg-zinc-100/80 p-0.5"
                            role="group"
                            aria-label="Filter by starred"
                        >
                            {(
                                [
                                    { value: '' as const, label: 'All' },
                                    { value: 'true' as const, label: 'Starred', icon: LucideStar },
                                    { value: 'false' as const, label: 'None' },
                                ] as const
                            ).map((option) => {
                                const { value, label } = option;
                                const Icon = 'icon' in option ? option.icon : undefined;
                                const active = isStar === value;
                                return (
                                    <button
                                        key={value || 'all'}
                                        type="button"
                                        onClick={() => setIsStar(value)}
                                        className={
                                            (active
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                                                : 'border-transparent bg-transparent text-zinc-600 hover:bg-white hover:text-zinc-900') +
                                            ' flex flex-1 items-center justify-center gap-0.5 rounded-md border py-1 text-[10px] font-medium uppercase tracking-wide transition-colors'
                                        }
                                    >
                                        {Icon && (
                                            <Icon
                                                className={
                                                    (active ? 'text-amber-200' : 'text-amber-500') +
                                                    ' h-3 w-3 shrink-0'
                                                }
                                                strokeWidth={2}
                                            />
                                        )}
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <p className="text-[10px] leading-snug text-zinc-400">
                        Applies to the paginated list on the right. Tree above is unchanged.
                    </p>
                </div>
            </section>

        </div>
    );
};

const ComponentNotesLeftRender = () => {
    return (
        <div className="h-full min-h-0 border-r border-zinc-100 bg-zinc-50/90">
            <div className="h-[calc(100vh-72px)] overflow-y-auto overscroll-contain">
                <ComponentNotesLeft />
            </div>
        </div>
    );
};

const ComponentNotesLeftModelRender = () => {
    return (
        <div
            className="fixed left-0 top-[60px] z-[1001] w-[min(100vw-1rem,300px)] max-w-[calc(100vw-1rem)]"
        >
            <div className="border-y border-r border-zinc-100 border-l-0 bg-zinc-50/95 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                <div className="h-[calc(100vh-60px)] overflow-y-auto overscroll-contain">
                    <ComponentNotesLeft />
                </div>
            </div>
        </div>
    );
};

export {
    ComponentNotesLeftRender,
    ComponentNotesLeftModelRender,
};
