import { LucideTrash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { Link, useLocation } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom.ts';

/**
 * ComponentChatHistory displays the chat history section.
 * It fetches chat threads from the API and displays them.
 */
const ComponentChatHistory = () => {
    const location = useLocation();
    const [activeChatId, setActiveChatId] = useState('');

    // 
    const [items, setItems] = useState([] as {
        _id: string;
        threadTitle: string;
        createdAtUtc: string;
    }[]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch chat threads from API
    const fetchChatThreads = async () => {
        try {
            const response = await axiosCustom.post('/api/chat-llm/threads-crud/threadsGet', {});
            if (response.data && response.data.docs) {
                // Map API data to expected format
                setItems(response.data.docs);
            }
        } catch (error) {
            console.error('Failed to fetch chat threads:', error);
        }
    };

    useEffect(() => {
        fetchChatThreads();
    }, [
        searchTerm,
    ]);

    const addNewThread = async () => {
        try {
            await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd');
            await fetchChatThreads();
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
        <div className="py-4 pl-3 text-black">
            {/* Chat Options Title */}
            <h2 className="text-lg font-bold mb-4 text-black">Chat History</h2>

            {/* New Chat Button */}
            <div className="mb-4">
                <button
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors duration-150"
                    onClick={() => {
                        addNewThread();
                    }}
                >
                    New Chat
                </button>
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
                {items.map((item) => (
                    <div key={item._id}>
                        <Link
                            to={`/user/chat?id=${item._id}`}
                            className={`block p-3 rounded-lg border cursor-pointer transition-colors duration-150 ease-in-out ${
                                item._id === activeChatId
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
                                onClick={() => alert('Delete action triggered!')}
                            >
                                <LucideTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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
                maxWidth: 'calc(100% - 50px)',
                zIndex: 1001,
            }}
        >
            <div>
                <div
                    className="bg-gray-100 shadow-md"
                    style={{
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    }}
                >
                    <div
                        style={{
                            height: 'calc(100vh)',
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