import {
    LucidePlus,
    LucideSearch,
    LucideStar,
    LucideTrash,
    LucideBot,
    LucideBookOpen,
    X,
    SlidersHorizontal,
    Check,
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { useAtomValue, useSetAtom } from 'jotai';
import { DateTime } from 'luxon';
import { AxiosRequestConfig } from 'axios';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import {
    jotaiChatHistoryModalOpen,
    jotaiChatThreadRefreshRandomNum,
} from '../jotai/jotaiChatLlmThreadSetting.ts';

type ThreadTabFilter = 'all' | 'favourite' | 'agent' | 'agentOpencode' | 'conciseAnswer';

interface ChatThreadItem {
    _id: string;
    threadTitle: string;
    isFavourite: boolean;
    createdAtUtc: string;
    answerEngine?: 'agent' | 'agentOpencode' | 'conciseAnswer';
    aiModelProvider?: string;
    aiModelName?: string;
    totalTokens?: number;
    totalCostUsd?: number;
    messageCount?: number;
    isPending?: boolean;
}

const ITEM_HEIGHT = 112;
const OVERSCAN = 6;

const ComponentChatHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const chatThreadRefreshRandomNum = useAtomValue(jotaiChatThreadRefreshRandomNum);
    const setChatHistoryModalOpen = useSetAtom(jotaiChatHistoryModalOpen);
    const [activeChatId, setActiveChatId] = useState('');
    const perPage = 20;
    const [totalCount, setTotalCount] = useState(0 as number);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<ChatThreadItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [tabFilter, setTabFilter] = useState<ThreadTabFilter>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeAgentCount, setActiveAgentCount] = useState(0);
    const [editingId, setEditingId] = useState('');
    const [editingDraft, setEditingDraft] = useState('');
    const [savingRename, setSavingRename] = useState(false);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(520);

    useEffect(() => {
        const checkActive = async () => {
            try {
                const res = await axiosCustom.post('/api/chat-llm/polling/agentProgressList');
                if (res.data?.success && typeof res.data.count === 'number') {
                    setActiveAgentCount(res.data.count);
                }
            } catch {
            }
        };
        void checkActive();
        const interval = setInterval(checkActive, 3000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const goToTop = () => {
        const chatHistoryTop = document.getElementById('chat-history-top');
        if (chatHistoryTop) {
            chatHistoryTop.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const fetchChatThreads = async () => {
        try {
            setLoading(true);
            const reqData: Record<string, unknown> = {
                page: page,
                perPage: perPage,
                search: searchTerm,
                sort: sortOrder,
            };
            if (tabFilter === 'favourite') {
                reqData.isFavourite = 'true';
            } else if (tabFilter === 'agent') {
                reqData.answerEngine = 'agent';
            } else if (tabFilter === 'agentOpencode') {
                reqData.answerEngine = 'agentOpencode';
            } else if (tabFilter === 'conciseAnswer') {
                reqData.answerEngine = 'conciseAnswer';
            }
            const response = await axiosCustom.post('/api/chat-llm/threads-crud/threadsGet', reqData);
            if (response.data && response.data.docs) {
                setItems(response.data.docs);
                setTotalCount(response.data.count);
            }
        } catch (error) {
            console.error('Failed to fetch chat threads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchChatThreads();
    }, [page, refreshRandomNum, chatThreadRefreshRandomNum, tabFilter, sortOrder]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, [searchTerm, tabFilter, sortOrder]);

    useEffect(() => {
        const el = listContainerRef.current;
        if (!el) {
            return;
        }
        const onScroll = () => {
            setScrollTop(el.scrollTop);
        };
        const ro = new ResizeObserver(() => {
            setContainerHeight(el.clientHeight);
        });
        el.addEventListener('scroll', onScroll);
        ro.observe(el);
        setContainerHeight(el.clientHeight);
        return () => {
            el.removeEventListener('scroll', onScroll);
            ro.disconnect();
        };
    }, [items.length]);

    const virtualRange = useMemo(() => {
        if (items.length <= perPage) {
            return { start: 0, end: items.length, offset: 0, useVirtual: false };
        }
        const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
        const end = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN);
        return { start, end, offset: start * ITEM_HEIGHT, useVirtual: true };
    }, [items.length, scrollTop, containerHeight]);

    const visibleItems = useMemo(() => {
        if (!virtualRange.useVirtual) {
            return items;
        }
        return items.slice(virtualRange.start, virtualRange.end);
    }, [items, virtualRange]);

    const deleteThread = async (argThreadId: string) => {
        try {
            if (!window.confirm('Are you sure you want to delete this thread?')) {
                return;
            }
            await axiosCustom.post('/api/chat-llm/threads-crud/threadsDeleteById', {
                threadId: argThreadId,
            });
            toast.success('Thread deleted successfully');
            await fetchChatThreads();
            navigate('/user/chat');
        } catch (error) {
            toast.error('Error deleting thread');
            console.error(error);
        }
    };

    const toggleFavourite = async ({
        recordId,
        isFavourite,
    }: {
        recordId: string;
        isFavourite: boolean;
    }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/chat-llm/threads-crud/threadsEditById`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    threadId: recordId,
                    isFavourite: isFavourite,
                },
            } as AxiosRequestConfig;
            await axiosCustom.request(config);
            toast.success('Thread favourited successfully');
            await fetchChatThreads();
        } catch (error) {
            toast.error('Error toggling favourite');
            console.error(error);
        }
    };

    const cancelRename = () => {
        setEditingId('');
        setEditingDraft('');
    };

    const saveRename = async () => {
        if (!editingId) {
            return;
        }
        const trimmed = editingDraft.trim();
        if (!trimmed) {
            toast.error('Title cannot be empty');
            return;
        }
        if (trimmed.length > 200) {
            toast.error('Title too long');
            return;
        }
        try {
            setSavingRename(true);
            await axiosCustom.post('/api/chat-llm/threads-crud/threadsEditById', {
                threadId: editingId,
                threadTitle: trimmed,
            });
            toast.success('Thread renamed');
            setEditingId('');
            setEditingDraft('');
            await fetchChatThreads();
        } catch {
            toast.error('Failed to rename thread');
        } finally {
            setSavingRename(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempActiveChatId = '';
        const chatId = queryParams.get('id') || '';
        if (chatId) {
            tempActiveChatId = chatId;
        }
        setActiveChatId(tempActiveChatId);
    }, [location.search]);

    const hasActiveFilters = tabFilter !== 'all' || sortOrder !== 'newest' || searchTerm !== '';

    const resetFilters = () => {
        setTabFilter('all');
        setSortOrder('newest');
        setSearchTerm('');
    };

    return (
        <div className="px-3 py-4 text-zinc-100">
            <div id="chat-history-top" />
            <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Threads</h2>
                    <p className="mt-0.5 text-[11px] text-zinc-500">Your conversations</p>
                </div>
                <div className="flex items-center gap-1">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                        {totalCount}
                    </span>
                    <button
                        type="button"
                        aria-label="Toggle filters"
                        onClick={() => {
                            setShowAdvancedFilters(!showAdvancedFilters);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                            showAdvancedFilters || hasActiveFilters
                                ? 'border-teal-500/40 bg-teal-950/40 text-teal-300'
                                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Filter options"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="mb-3 flex flex-col gap-2">
                <Link
                    to="/user/chat"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-2 text-xs font-semibold text-white shadow-md shadow-teal-900/10 transition hover:from-teal-500 hover:to-emerald-500"
                    onClick={() => {
                        setChatHistoryModalOpen({ isOpen: false });
                    }}
                    aria-label="New chat"
                >
                    <LucidePlus className="h-4 w-4" strokeWidth={2} />
                    New chat
                </Link>
                <Link
                    to="/user/chat-agent-progress"
                    className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-teal-950/70 px-3 py-2 text-xs font-bold text-teal-300 shadow-sm transition hover:bg-teal-900/90"
                    onClick={() => {
                        setChatHistoryModalOpen({ isOpen: false });
                    }}
                    aria-label="View agent progress"
                >
                    <span className="flex items-center gap-2">
                        <LucideBot className="h-4 w-4 text-teal-600" />
                        Agent Progress
                    </span>
                    {activeAgentCount > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-ping"></span>
                            {activeAgentCount} Active
                        </span>
                    ) : (
                        <span className="text-[10px] font-medium text-teal-600/70">View</span>
                    )}
                </Link>
                <Link
                    to="/user/chat/skills"
                    className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3 py-2 text-xs font-bold text-cyan-300 shadow-sm transition hover:bg-cyan-900/40"
                    onClick={() => {
                        setChatHistoryModalOpen({ isOpen: false });
                    }}
                    aria-label="Manage agent skills"
                >
                    <span className="flex items-center gap-2">
                        <LucideBookOpen className="h-4 w-4 text-cyan-400" />
                        Agent Skills
                    </span>
                    <span className="text-[10px] font-medium text-cyan-400/80">Manage</span>
                </Link>
            </div>
            <div className="mb-2.5 flex flex-wrap rounded-lg border border-zinc-700/80 bg-zinc-950/80 p-0.5 text-[11px]">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'favourite', label: '⭐ Starred' },
                    { id: 'agent', label: '🤖 Agent' },
                    { id: 'agentOpencode', label: '⚡ Opencode' },
                    { id: 'conciseAnswer', label: '💬 Concise' },
                ].map((tab) => {
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            aria-label={`Filter ${tab.label}`}
                            onClick={() => {
                                setTabFilter(tab.id as ThreadTabFilter);
                            }}
                            className={`flex-1 rounded-md px-1.5 py-1 text-center font-medium transition-all ${
                                tabFilter === tab.id
                                    ? 'bg-zinc-850 text-teal-300 shadow-sm ring-1 ring-zinc-700/80'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div className="relative mb-2">
                <LucideSearch
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                    strokeWidth={2}
                />
                <DebounceInput
                    debounceTimeout={400}
                    type="text"
                    placeholder="Search thread titles, summary..."
                    aria-label="Search threads"
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 py-1.5 pl-8 pr-7 text-xs text-zinc-100 shadow-sm placeholder:text-zinc-500 backdrop-blur-sm transition-shadow focus:border-teal-500/40 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    value={searchTerm}
                />
                {searchTerm && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            setSearchTerm('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            {showAdvancedFilters && (
                <div className="mb-3 p-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 space-y-2 text-xs">
                    <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">Sort:</span>
                        <select
                            value={sortOrder}
                            aria-label="Sort threads"
                            onChange={(e) => {
                                setSortOrder(e.target.value as 'newest' | 'oldest' | 'title');
                            }}
                            className="w-full text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200 focus:outline-none focus:border-teal-500"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="title">Title (A-Z)</option>
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <div className="pt-1 flex justify-end">
                            <button
                                type="button"
                                aria-label="Reset all filters"
                                onClick={resetFilters}
                                className="text-[11px] text-red-400 hover:text-red-300 underline"
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div
                ref={listContainerRef}
                className="space-y-2 pr-1"
                aria-label="Thread list"
            >
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-teal-600" />
                    </div>
                )}
                {!loading && items.length === 0 && (
                    <div className="text-center py-8 px-2 text-xs text-zinc-400 bg-zinc-900/40 rounded-xl border border-zinc-800">
                        <p>No threads match your filters.</p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                aria-label="Clear filters"
                                onClick={resetFilters}
                                className="mt-2 text-teal-400 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
                {!loading && virtualRange.useVirtual && (
                    <div style={{ height: `${items.length * ITEM_HEIGHT}px`, position: 'relative' }}>
                        <div style={{ transform: `translateY(${virtualRange.offset}px)` }} className="space-y-2">
                            {visibleItems.map((item) => {
                                return renderThreadCard(item);
                            })}
                        </div>
                    </div>
                )}
                {!loading && !virtualRange.useVirtual && visibleItems.map((item) => {
                    return renderThreadCard(item);
                })}
            </div>
            {totalCount >= 1 && (
                <ReactPaginate
                    breakLabel="…"
                    nextLabel="›"
                    forcePage={page - 1}
                    onPageChange={(e) => {
                        setPage(e.selected + 1);
                        goToTop();
                    }}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={2}
                    pageCount={Math.ceil(totalCount / perPage)}
                    previousLabel="‹"
                    renderOnZeroPageCount={null}
                    containerClassName="mt-4 flex flex-wrap items-center justify-center gap-1"
                    pageClassName=""
                    pageLinkClassName="min-w-[2rem] rounded-lg border border-zinc-700/90 bg-zinc-900 px-2 py-1 text-center text-[11px] font-medium text-zinc-300 shadow-sm transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                    previousClassName=""
                    previousLinkClassName="rounded-lg border border-zinc-700/90 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 shadow-sm hover:bg-zinc-800"
                    nextClassName=""
                    nextLinkClassName="rounded-lg border border-zinc-700/90 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 shadow-sm hover:bg-zinc-800"
                    breakClassName=""
                    breakLinkClassName="px-1 text-[11px] text-zinc-400"
                    activeLinkClassName="border-teal-600 bg-teal-600 text-white shadow-md hover:bg-teal-600"
                />
            )}
        </div>
    );

    function renderThreadCard(item: ChatThreadItem) {
        const isEditing = editingId === item._id;
        const isActive = item._id === activeChatId;
        return (
            <div
                key={item._id}
                className={`overflow-hidden rounded-xl border transition-shadow ${
                    isActive
                        ? 'border-teal-400/50 bg-zinc-900 shadow-md shadow-teal-900/5 ring-1 ring-teal-500/10'
                        : 'border-zinc-700/80 bg-zinc-900/90 shadow-sm hover:border-zinc-600 hover:shadow-md'
                }`}
            >
                <div className="flex items-start gap-1 px-2 pt-2">
                    <div className="min-w-0 flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    value={editingDraft}
                                    aria-label="Edit thread title"
                                    onChange={(e) => {
                                        setEditingDraft(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            void saveRename();
                                        }
                                        if (e.key === 'Escape') {
                                            cancelRename();
                                        }
                                    }}
                                    className="w-full rounded-lg border border-teal-500/40 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    aria-label="Save thread title"
                                    disabled={savingRename}
                                    onClick={() => {
                                        void saveRename();
                                    }}
                                    className="rounded-lg bg-teal-600 p-1.5 text-white hover:bg-teal-500 disabled:opacity-50"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Cancel rename"
                                    onClick={cancelRename}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to={`/user/chat?id=${item._id}`}
                                className={`block rounded-lg px-2 py-1 transition-colors ${isActive ? 'bg-teal-950/40' : 'hover:bg-zinc-800/80'}`}
                                onClick={() => {
                                    setChatHistoryModalOpen({ isOpen: false });
                                }}
                                aria-label={`Open thread ${item.threadTitle}`}
                            >
                                <span className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100 flex items-center gap-1.5">
                                    {item.isPending ? (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-pulse" aria-label="Pending" title="Pending agent run" />
                                    ) : null}
                                    <span className="line-clamp-2">{item.threadTitle}</span>
                                </span>
                                <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px] text-zinc-500">
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {item.answerEngine === 'agent' && (
                                            <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[9px] font-semibold">
                                                Agent
                                            </span>
                                        )}
                                        {item.answerEngine === 'agentOpencode' && (
                                            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-semibold">
                                                Opencode
                                            </span>
                                        )}
                                        {item.aiModelProvider && (
                                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px]">
                                                {item.aiModelProvider}
                                            </span>
                                        )}
                                        {typeof item.totalTokens === 'number' && item.totalTokens > 0 && (
                                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-violet-300 border border-zinc-700 text-[9px] font-medium" title={`Tokens: ${item.totalTokens} Cost: $${(item.totalCostUsd || 0).toFixed(5)}`}>
                                                {item.totalTokens >= 1000 ? `${(item.totalTokens / 1000).toFixed(1)}k` : String(item.totalTokens)} tok
                                            </span>
                                        )}
                                        {typeof item.totalCostUsd === 'number' && item.totalCostUsd > 0 && (
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-medium">
                                                ${item.totalCostUsd.toFixed(4)}
                                            </span>
                                        )}
                                        {typeof item.messageCount === 'number' && (
                                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-500 text-[9px]">
                                                {item.messageCount} msgs
                                            </span>
                                        )}
                                    </div>
                                    <span>
                                        {DateTime.fromJSDate(new Date(item.createdAtUtc)).toRelative()}
                                    </span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/50 px-2 py-1">
                    <div className="text-[10px] text-zinc-500">
                        {new Date(item.createdAtUtc).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-950/40 hover:text-red-600"
                            aria-label={`Delete thread ${item.threadTitle}`}
                            onClick={() => {
                                void deleteThread(item._id);
                            }}
                        >
                            <LucideTrash className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                            type="button"
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-amber-950/40"
                            aria-label={item?.isFavourite ? `Remove favourite ${item.threadTitle}` : `Favourite ${item.threadTitle}`}
                            onClick={() => {
                                void toggleFavourite({
                                    recordId: item?._id,
                                    isFavourite: item?.isFavourite ? false : true,
                                });
                            }}
                        >
                            {item?.isFavourite ? (
                                <LucideStar
                                    className="h-3.5 w-3.5 text-amber-500"
                                    fill="currentColor"
                                    strokeWidth={2}
                                />
                            ) : (
                                <LucideStar className="h-3.5 w-3.5" strokeWidth={2} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

const ComponentChatHistoryRender = () => {
    return (
        <div className="border-r border-zinc-700/80 bg-gradient-to-b from-zinc-950/95 to-zinc-900">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-zinc-900/40 backdrop-blur-[2px]">
                <ComponentChatHistory />
            </div>
        </div>
    );
};

const ComponentChatHistoryModelRender = () => {
    return (
        <div className="fixed left-0 top-[60px] z-[1001] w-[min(320px,calc(100%-48px))] border-r border-zinc-700/80 shadow-2xl shadow-zinc-900/15 ring-1 ring-zinc-700/5 backdrop-blur-md">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-zinc-900/95">
                <ComponentChatHistory />
            </div>
        </div>
    );
};

export { ComponentChatHistoryRender, ComponentChatHistoryModelRender };
