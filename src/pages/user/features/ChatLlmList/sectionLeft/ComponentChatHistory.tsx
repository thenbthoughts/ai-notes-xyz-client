import {
    LucidePlus,
    LucideSearch,
    LucideStar,
    LucideTrash,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

/**
 * ComponentChatHistory displays the chat history section.
 * It fetches chat threads from the API and displays them.
 */
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
    const [items, setItems] = useState(
        [] as {
            _id: string;
            threadTitle: string;
            isFavourite: boolean;
            createdAtUtc: string;
        }[]
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [isFavourite, setIsFavourite] = useState('');

    const goToTop = () => {
        const chatHistoryTop = document.getElementById('chat-history-top');
        chatHistoryTop?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChatThreads = async () => {
        try {
            setLoading(true);
            const response = await axiosCustom.post('/api/chat-llm/threads-crud/threadsGet', {
                page: page,
                perPage: perPage,
                search: searchTerm,
                isFavourite: isFavourite,
            });
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
    }, [page, refreshRandomNum, chatThreadRefreshRandomNum]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, [searchTerm, isFavourite]);

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
            alert('Error adding new thread: ' + error);
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
            alert('Error toggling favourite: ' + error);
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

    const renderFilterIsFavourite = () => (
        <div className="mb-3 flex rounded-xl border border-zinc-200/80 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-zinc-700">
                <input
                    type="checkbox"
                    id="favouriteCheckbox"
                    checked={isFavourite === 'true'}
                    onChange={(e) => setIsFavourite(e.target.checked ? 'true' : '')}
                    className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500/30"
                />
                Starred only
            </label>
        </div>
    );

    return (
        <div className="px-3 py-4 text-zinc-900">
            <div id="chat-history-top" />

            <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Threads</h2>
                    <p className="mt-0.5 text-[11px] text-zinc-500">Your conversations</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                    {totalCount}
                </span>
            </div>

            <div className="mb-3">
                <Link
                    to="/user/chat"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-2 text-xs font-semibold text-white shadow-md shadow-teal-900/10 transition hover:from-teal-500 hover:to-emerald-500"
                    onClick={() => setChatHistoryModalOpen({ isOpen: false })}
                >
                    <LucidePlus className="h-4 w-4" strokeWidth={2} />
                    New chat
                </Link>
            </div>

            <div className="relative mb-3">
                <LucideSearch
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    strokeWidth={2}
                />
                <DebounceInput
                    debounceTimeout={500}
                    type="text"
                    placeholder="Search threads…"
                    className="w-full rounded-xl border border-zinc-200/80 bg-white/80 py-2 pl-9 pr-3 text-xs text-zinc-900 shadow-sm placeholder:text-zinc-400 backdrop-blur-sm transition-shadow focus:border-teal-500/40 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
            </div>

            {renderFilterIsFavourite()}

            <div className="space-y-2">
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600" />
                    </div>
                )}
                {!loading &&
                    items.map((item) => (
                        <div
                            key={item._id}
                            className={`overflow-hidden rounded-xl border transition-shadow ${
                                item._id === activeChatId
                                    ? 'border-teal-400/50 bg-white shadow-md shadow-teal-900/5 ring-1 ring-teal-500/10'
                                    : 'border-zinc-200/80 bg-white/90 shadow-sm hover:border-zinc-300 hover:shadow-md'
                            }`}
                        >
                            <Link
                                to={`/user/chat?id=${item._id}`}
                                className={`block px-3 py-2.5 transition-colors ${
                                    item._id === activeChatId ? 'bg-teal-50/40' : 'hover:bg-zinc-50/80'
                                }`}
                                onClick={() => setChatHistoryModalOpen({ isOpen: false })}
                            >
                                <span className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900">
                                    {item.threadTitle}
                                </span>
                                <span className="mt-1 block text-[11px] leading-tight text-zinc-500">
                                    {new Date(item.createdAtUtc).toLocaleDateString()} ·{' '}
                                    {DateTime.fromJSDate(new Date(item.createdAtUtc)).toRelative()}
                                </span>
                            </Link>
                            <div className="flex items-center gap-0.5 border-t border-zinc-100/80 bg-zinc-50/50 px-1.5 py-1">
                                <button
                                    type="button"
                                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title="Delete thread"
                                    onClick={() => deleteThread(item._id)}
                                >
                                    <LucideTrash className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-amber-50"
                                    title={item?.isFavourite ? 'Remove favourite' : 'Favourite'}
                                    onClick={() =>
                                        toggleFavourite({
                                            recordId: item?._id,
                                            isFavourite: item?.isFavourite ? false : true,
                                        })
                                    }
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
                    ))}
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
                    pageLinkClassName="min-w-[2rem] rounded-lg border border-zinc-200/90 bg-white px-2 py-1 text-center text-[11px] font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                    previousClassName=""
                    previousLinkClassName="rounded-lg border border-zinc-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                    nextClassName=""
                    nextLinkClassName="rounded-lg border border-zinc-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                    breakClassName=""
                    breakLinkClassName="px-1 text-[11px] text-zinc-400"
                    activeLinkClassName="border-teal-600 bg-teal-600 text-white shadow-md hover:bg-teal-600"
                />
            )}
        </div>
    );
};

const ComponentChatHistoryRender = () => {
    return (
        <div className="border-r border-zinc-200/80 bg-gradient-to-b from-zinc-50/95 to-white">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white/40 backdrop-blur-[2px]">
                <ComponentChatHistory />
            </div>
        </div>
    );
};

const ComponentChatHistoryModelRender = () => {
    return (
        <div className="fixed left-0 top-[60px] z-[1001] w-[min(320px,calc(100%-48px))] border-r border-zinc-200/80 shadow-2xl shadow-zinc-900/15 ring-1 ring-black/5 backdrop-blur-md">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white/95">
                <ComponentChatHistory />
            </div>
        </div>
    );
};

export { ComponentChatHistoryRender, ComponentChatHistoryModelRender };
