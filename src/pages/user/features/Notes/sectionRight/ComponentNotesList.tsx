import { useState, useEffect, useRef, useMemo } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { INotes } from '../../../../../types/pages/tsNotes.ts';
import ComponentNotesItem from './ComponentNotesItem.tsx';
import ReactPaginate from 'react-paginate';
import { LayoutGrid, List, MessageCircle, Plus, ArrowUpDown, Folder as FolderIcon, X } from 'lucide-react';
import { notesAddAxios } from '../utils/notesListAxios.ts';
import { useNavigate } from 'react-router-dom';
import { jotaiStateNotesIsStar, jotaiStateNotesSearch, jotaiStateNotesWorkspaceId, jotaiNotesSort, jotaiNotesFolderFilter, jotaiNotesTagFilter } from '../stateJotai/notesStateJotai.ts';
import { useAtom, useAtomValue } from 'jotai';
import toast from 'react-hot-toast';
import { notesWorkspaceChatWithAi } from '../utils/notesListAxios.ts';
import { DateTime } from 'luxon';

const perPage = 20;

const notesWorkspaceChatWithAiLocal = async ({
    notesWorkspaceId,
}: {
    notesWorkspaceId: string;
}) => {
    const toastLoadingId = toast.loading('Starting workspace chat with AI...');
    try {
        const result = await notesWorkspaceChatWithAi({ notesWorkspaceId: notesWorkspaceId });
        toast.dismiss(toastLoadingId);
        if (result.error !== '') {
            toast.error(result.error || 'Error workspace chat with AI. Please try again.');
            return;
        }
        toast.success(
            'Workspace chat with AI started successfully! Please send a message to start the conversation.',
            {
                duration: 3000,
            }
        );
        window.location.href = `/user/chat?id=${result.threadId}`;
    } catch (error) {
        console.error(error);
        toast.error('Error workspace chat with AI. Please try again.');
        toast.dismiss(toastLoadingId);
    }
};

const ComponentNotesList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as INotes[]);
    const [page, setPage] = useState(1);
    const workspaceId = useAtomValue(jotaiStateNotesWorkspaceId);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const searchTerm = useAtomValue(jotaiStateNotesSearch);
    const isStar = useAtomValue(jotaiStateNotesIsStar);
    const [sortVal, setSortVal] = useAtom(jotaiNotesSort);
    const folderFilter = useAtomValue(jotaiNotesFolderFilter);
    const [tagFilter, setTagFilter] = useAtom(jotaiNotesTagFilter);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [, setFolderFilter] = useAtom(jotaiNotesFolderFilter);

    const breadcrumbParts = useMemo(() => {
        if (!folderFilter) {
            return [];
        }
        return folderFilter.split('/').filter((p) => p.length > 0);
    }, [folderFilter]);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        if (page === 1) {
            fetchList({ axiosCancelTokenSource, replace: true });
        } else {
            fetchList({ axiosCancelTokenSource, replace: false });
        }
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum, page, workspaceId, searchTerm, isStar, sortVal, folderFilter, tagFilter]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setList([]);
        setRefreshRandomNum(Math.random());
    }, [workspaceId, searchTerm, isStar, sortVal, folderFilter, tagFilter]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                if (hasMore && !loading) {
                    if (list.length >= perPage && list.length < totalCount) {
                        setPage((prev) => prev + 1);
                    }
                }
            }
        }, { threshold: 0.1 });
        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [hasMore, loading, list, totalCount]);

    const fetchList = async ({ axiosCancelTokenSource, replace }: { axiosCancelTokenSource: CancelTokenSource; replace: boolean }) => {
        try {
            setLoading(true);
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: page,
                    perPage: perPage,
                    notesWorkspaceId: workspaceId,
                    search: searchTerm,
                    isStar: isStar,
                    sort: sortVal,
                    folder: folderFilter,
                    tags: tagFilter,
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            let tempArr: INotes[] = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            if (replace) {
                setList(tempArr);
            } else {
                setList((prev) => {
                    const map = new Map<string, INotes>();
                    for (let i = 0; i < prev.length; i++) {
                        map.set(prev[i]._id, prev[i]);
                    }
                    for (let i = 0; i < tempArr.length; i++) {
                        map.set(tempArr[i]._id, tempArr[i]);
                    }
                    return Array.from(map.values());
                });
            }

            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count;
            }
            setTotalCount(tempTotalCount);
            if (replace) {
                setHasMore(tempArr.length === perPage && tempArr.length < tempTotalCount);
            } else {
                const newLen = replace ? tempArr.length : list.length + tempArr.length;
                setHasMore(newLen < tempTotalCount);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const notesAddAxiosLocal = async () => {
        try {
            const result = await notesAddAxios({
                notesWorkspaceId: workspaceId,
            });
            if (result.success !== '') {
                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${workspaceId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const allTags = useMemo(() => {
        const s = new Set<string>();
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list[i].tags.length; j++) {
                s.add(list[i].tags[j]);
            }
        }
        return Array.from(s).slice(0, 20);
    }, [list]);

    const renderCount = () => {
        return (
            <div className="mb-1 flex h-8 flex-wrap items-center gap-1 rounded-xl border border-zinc-700/60 bg-zinc-900 px-1.5 text-xs text-zinc-400 shadow-sm sm:mb-1.5 sm:gap-1.5 sm:px-2">
                <span className="font-semibold tabular-nums text-zinc-200">{totalCount}</span>
                <span className="text-zinc-400">notes</span>
                {totalCount === 0 && (
                    <span className="text-amber-400">No results</span>
                )}
                <div className="ml-auto flex items-center gap-0.5">
                    <div className="mr-1 hidden items-center gap-1 sm:flex">
                        <ArrowUpDown className="h-3 w-3 text-zinc-500" />
                        <select
                            value={sortVal}
                            onChange={(e) => setSortVal(e.target.value)}
                            className="rounded-md border border-zinc-700 bg-zinc-950 px-1 py-0.5 text-[11px] text-zinc-300 focus:border-indigo-500 focus:outline-none"
                            aria-label="Sort notes"
                        >
                            <option value="updatedAt">Updated</option>
                            <option value="createdAt">Created</option>
                            <option value="title">Title</option>
                            <option value="order">Order</option>
                        </select>
                    </div>
                    <div className="mr-1 inline-flex items-center rounded-lg border border-zinc-700/80 bg-zinc-950 p-0.5">
                        <button
                            type="button"
                            title="List view"
                            aria-label="List view"
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-zinc-400 hover:bg-zinc-800'
                            }`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-3 w-3" strokeWidth={2} />
                        </button>
                        <button
                            type="button"
                            title="Grid view"
                            aria-label="Grid view"
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-zinc-400 hover:bg-zinc-800'
                            }`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-3 w-3" strokeWidth={2} />
                        </button>
                    </div>
                    <button
                        type="button"
                        title="New note"
                        aria-label="New note"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-950 text-zinc-400 transition-colors hover:bg-zinc-800"
                        onClick={notesAddAxiosLocal}
                    >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        title="Workspace chat with AI"
                        aria-label="Workspace chat with AI"
                        className="inline-flex h-6 items-center gap-0.5 rounded-lg border border-zinc-700/80 bg-zinc-950 px-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                        onClick={() => notesWorkspaceChatWithAiLocal({ notesWorkspaceId: workspaceId })}
                    >
                        <MessageCircle className="h-3 w-3" strokeWidth={2} />
                        AI
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div id='messagesScrollUp' />
            <div className="mb-1 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-400">
                <FolderIcon className="h-3 w-3 text-zinc-500" />
                <button type="button" className={`rounded px-1.5 py-0.5 ${!folderFilter ? 'bg-zinc-800 text-zinc-100' : 'hover:bg-zinc-800'}`} onClick={() => setFolderFilter('')} aria-label="Show all folders breadcrumb">All</button>
                {breadcrumbParts.map((part, idx) => {
                    const path = breadcrumbParts.slice(0, idx + 1).join('/');
                    return (
                        <span key={idx} className="flex items-center gap-1">
                            <span className="text-zinc-600">/</span>
                            <button type="button" className="rounded px-1 py-0.5 text-zinc-300 hover:bg-zinc-800" onClick={() => setFolderFilter(path)} aria-label={`Breadcrumb folder ${path}`}>{part}</button>
                        </span>
                    );
                })}
                {folderFilter && <button type="button" className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300" onClick={() => setFolderFilter('')} aria-label="Clear folder filter"><X className="h-3 w-3" /></button>}
                <span className="ml-auto text-[10px] text-zinc-500">{totalCount} total</span>
            </div>
            {allTags.length > 0 && (
                <div className="mb-1 flex flex-wrap gap-1 rounded-lg border border-zinc-700/60 bg-zinc-900 p-1.5">
                    {allTags.map((tag) => {
                        const active = tagFilter.includes(tag);
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                    if (active) {
                                        setTagFilter(tagFilter.filter((t) => t !== tag));
                                    } else {
                                        setTagFilter([...tagFilter, tag]);
                                    }
                                }}
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                                aria-label={`Filter tag ${tag}`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                    {tagFilter.length > 0 && (
                        <button type="button" className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[11px] text-zinc-400" onClick={() => setTagFilter([])} aria-label="Clear tag filters">Clear tags</button>
                    )}
                </div>
            )}
            {renderCount()}
            {totalCount === 0 && !loading && (
                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">
                    <p className="text-sm font-medium text-zinc-200">No notes found</p>
                    <p className="mt-1 text-xs text-zinc-500">Try adjusting search, folder or create a new note.</p>
                    <button type="button" className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500" onClick={notesAddAxiosLocal} aria-label="Create first note">New note</button>
                </div>
            )}
            <div
                className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3'
                        : 'space-y-0.5'
                }
            >
                {list.map((noteObj) => {
                    const rel = DateTime.fromISO(new Date(noteObj.updatedAtUtc).toISOString()).toRelative() || '';
                    return (
                        <div key={noteObj._id} className={viewMode === 'grid' ? 'h-full' : ''}>
                            <div className="flex items-start gap-1">
                                <div className="min-w-0 flex-1">
                                    <ComponentNotesItem noteObj={noteObj} viewMode={viewMode} />
                                    <div className="px-1 text-[10px] text-zinc-500">{rel} {noteObj.folder ? `· ${noteObj.folder}` : ''}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {loading && (
                <div className="mt-2 space-y-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800/60" />
                    ))}
                </div>
            )}
            <div ref={sentinelRef} className="h-6" aria-hidden />
            {!hasMore && list.length > 0 && (
                <div className="py-2 text-center text-xs text-zinc-500">End of list · {list.length} of {totalCount}</div>
            )}
            {hasMore && list.length > 0 && (
                <div className="flex justify-center py-2">
                    <button type="button" className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800" onClick={() => setPage((p) => p + 1)} aria-label="Load more notes">Load more</button>
                </div>
            )}
            {totalCount >= 1 && (
                <div className="mt-1.5 flex w-full justify-center sm:mt-2">
                    <ReactPaginate
                        breakLabel="…"
                        nextLabel="›"
                        onPageChange={(e) => {
                            setPage(e.selected + 1);
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={2}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="‹"
                        renderOnZeroPageCount={null}
                        forcePage={page - 1}
                        containerClassName="flex flex-wrap items-center justify-center gap-1"
                        pageClassName="overflow-hidden rounded-lg border border-zinc-700/80 text-xs shadow-sm"
                        previousClassName="overflow-hidden rounded-lg border border-zinc-700/80 text-xs shadow-sm"
                        previousLinkClassName="block px-1.5 py-0.5 text-zinc-400"
                        nextClassName="overflow-hidden rounded-lg border border-zinc-700/80 text-xs shadow-sm"
                        nextLinkClassName="block px-1.5 py-0.5 text-zinc-400"
                        breakClassName="rounded-lg border border-transparent px-1 text-xs text-zinc-400"
                        breakLinkClassName="px-1 py-0.5"
                        activeLinkClassName="!bg-indigo-600 !text-white border-indigo-600"
                        pageLinkClassName="text-zinc-300 px-1.5 py-0.5 block min-w-[1.5rem] text-center"
                    />
                </div>
            )}
            <div id='messagesScrollDown' />
        </div>
    );
};

export default ComponentNotesList;
