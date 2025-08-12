import { LucideTrash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';

import axiosCustom from '../../../../../config/axiosCustom.ts';

/**
 * ComponentChatHistory displays the chat history section.
 * It fetches chat threads from the API and displays them.
 */
const ComponentChatHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [activeChatId, setActiveChatId] = useState('');

    // pagination
    const perPage = 20;
    const [totalCount, setTotalCount] = useState(0 as number);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([] as {
        _id: string;
        threadTitle: string;
        createdAtUtc: string;
    }[]);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch chat threads from API
    const fetchChatThreads = async () => {
        try {
            setLoading(true);
            const response = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsGet', {
                page: page,
                perPage: perPage,
                search: searchTerm,
            }
            );
            if (response.data && response.data.docs) {
                // Map API data to expected format
                setItems(response.data.docs);
                setTotalCount(response.data.count);

                // scroll to top
                const chatHistoryTop = document.getElementById('chat-history-top');
                if (chatHistoryTop) {
                    chatHistoryTop.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error('Failed to fetch chat threads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatThreads();
    }, [
        page,
        refreshRandomNum,
    ]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(
            Math.floor(
                Math.random() * 1_000_000
            )
        );
    }, [searchTerm]);

    const deleteThread = async (argThreadId: string) => {
        try {
            if (!window.confirm('Are you sure you want to delete this thread?')) {
                return;
            }

            await axiosCustom.post('/api/chat-llm/threads-crud/threadsDeleteById', {
                threadId: argThreadId
            });
            toast.success('Thread deleted successfully');
            await fetchChatThreads();

            navigate('/user/chat');
        } catch (error) {
            alert('Error adding new thread: ' + error);
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

    return (
        <div className="py-10 px-2 text-black">

            <div id="chat-history-top" />

            {/* Chat Options Title */}
            <h2 className="text-lg font-bold mb-4 text-black flex justify-between items-center">
                Chat History
                <span className="text-sm text-gray-500">
                    {totalCount} thread{totalCount !== 1 ? 's' : ''}
                </span>
            </h2>

            {/* New Chat Button */}
            <div className="mb-4">
                <Link
                    to="/user/chat"
                    className="w-full p-1 text-white bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-md shadow-sm hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 transition-colors duration-300 block text-center py-2"
                >
                    + Add Chat
                </Link>
            </div>

            {/* Search Input */}
            <div className="mb-4">
                <DebounceInput
                    debounceTimeout={500}
                    type="text"
                    placeholder="Search chat history..."
                    className="border rounded-lg p-2 w-full"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
            </div>

            {/* History Items List */}
            <div className="space-y-3">
                {loading && (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                )}
                {items.map((item) => (
                    <div key={item._id}>
                        <Link
                            to={`/user/chat?id=${item._id}`}
                            className={
                                `block p-3 rounded-lg border cursor-pointer transition-colors duration-150 ease-in-out 
                                ${item._id === activeChatId
                                    ? 'bg-blue-100 border-blue-600'
                                    : 'bg-gray-100 border-gray-300 hover:border-gray-600'
                                }`}
                        >
                            {/* Chat Title */}
                            <span className="block text-base font-semibold text-black mb-1">
                                {item.threadTitle}
                            </span>
                            {/* Timestamp */}
                            <span className="block text-xs text-gray-600">
                                {item.createdAtUtc}
                            </span>
                        </Link>
                        <div>
                            {/* Delete Icon */}
                            <button
                                className="text-red-500 hover:text-red-700 mt-2 mr-1"
                                onClick={() => deleteThread(item._id)}
                            >
                                <LucideTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* pagination */}
            {totalCount >= 1 && (
                <ReactPaginate
                    breakLabel="..."
                    nextLabel="next >"
                    forcePage={page - 1}
                    onPageChange={(e) => {
                        console.log('e.selected', e.selected);
                        setPage(e.selected + 1);
                    }}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={2}
                    pageCount={Math.ceil(totalCount / perPage)}
                    previousLabel="< previous"
                    renderOnZeroPageCount={null}
                    containerClassName="flex flex-wrap justify-center items-center gap-1 sm:space-x-1"
                    pageClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                    previousClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                    previousLinkClassName="text-gray-700 px-2 sm:px-3"
                    nextClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                    nextLinkClassName="text-gray-700 px-2 sm:px-3"
                    breakClassName="border border-gray-300 rounded-md text-base sm:text-lg m-0.5"
                    breakLinkClassName="text-gray-700 px-2 sm:px-3"
                    activeLinkClassName="bg-blue-500 text-white"
                    pageLinkClassName="text-gray-700 px-2 sm:px-3"
                />
            )}
        </div>
    );
};

const ComponentChatHistoryRender = () => {
    return (
        // Main container with light background, padding, rounded corners and max width for presentation
        <div
            style={{
                paddingTop: '10px',
                paddingBottom: '10px',
            }}
        >
            <div
                className="bg-white rounded-lg shadow-md"
                style={{
                    paddingTop: '10px',
                    paddingBottom: '10px',
                }}
            >
                <div
                    style={{
                        height: 'calc(100vh - 100px)',
                        overflowY: 'auto',
                    }}
                    className="pt-3 pb-5"
                >
                    <ComponentChatHistory />
                </div>
            </div>
        </div>
    );
};

const ComponentChatHistoryModelRender = () => {
    return (
        // Main container with light background, padding, rounded corners and max width for presentation
        <div
            style={{
                position: 'fixed',
                left: 0,
                top: '60px',
                width: '300px',
                maxWidth: 'calc(100% - 60px)',
                zIndex: 1001,
            }}
        >
            <div>
                <div
                    className="bg-gray-100 shadow-md"
                >
                    <div
                        style={{
                            height: 'calc(100vh - 60px)',
                            overflowY: 'auto',
                        }}
                        className="pt-3 pb-5"
                    >
                        <ComponentChatHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

export {
    ComponentChatHistoryRender,
    ComponentChatHistoryModelRender,
};
// export default ComponentChatHistoryModelRender;