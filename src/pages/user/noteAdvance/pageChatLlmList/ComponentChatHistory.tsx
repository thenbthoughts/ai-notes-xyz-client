import { LucideTrash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { Link, useLocation } from 'react-router-dom';

// Sample data for chat history items
const historyItems = [
    { id: 1, title: 'Travel Planning', timestamp: 'Yesterday, 14:23' },
    { id: 2, title: 'Career Advice', timestamp: 'Aug 3, 2023' },
    { id: 3, title: 'Recipe Ideas', timestamp: 'Jul 28, 2023' },
    { id: 4, title: 'Software Development', timestamp: 'Jul 27, 2023' },
    { id: 5, title: 'Financial Planning', timestamp: 'Jul 26, 2023' },
    { id: 6, title: 'Home Improvement', timestamp: 'Jul 25, 2023' },
    { id: 7, title: 'Book Recommendations', timestamp: 'Jul 24, 2023' },
    { id: 8, title: 'Fitness Training', timestamp: 'Jul 23, 2023' },
    { id: 9, title: 'Language Learning', timestamp: 'Jul 22, 2023' },
    { id: 10, title: 'Photography Tips', timestamp: 'Jul 21, 2023' },
    { id: 11, title: 'Car Maintenance', timestamp: 'Jul 20, 2023' },
    { id: 12, title: 'Gaming Strategies', timestamp: 'Jul 19, 2023' },
    { id: 13, title: 'Movie Reviews', timestamp: 'Jul 18, 2023' },
    { id: 14, title: 'DIY Projects', timestamp: 'Jul 17, 2023' },
    { id: 15, title: 'Tech Gadgets', timestamp: 'Jul 16, 2023' },
    { id: 16, title: 'Cooking Recipes', timestamp: 'Jul 15, 2023' },
    { id: 17, title: 'Parenting Advice', timestamp: 'Jul 14, 2023' },
    { id: 18, title: 'Pet Care', timestamp: 'Jul 13, 2023' },
    { id: 19, title: 'Gardening Tips', timestamp: 'Jul 12, 2023' },
    { id: 20, title: 'Travel Destinations', timestamp: 'Jul 11, 2023' },
    { id: 21, title: 'Investment Strategies', timestamp: 'Jul 10, 2023' },
    { id: 22, title: 'Real Estate', timestamp: 'Jul 09, 2023' },
    { id: 23, title: 'Interior Design', timestamp: 'Jul 08, 2023' },
    { id: 24, title: 'Fashion Trends', timestamp: 'Jul 07, 2023' },
    { id: 25, title: 'Beauty Tips', timestamp: 'Jul 06, 2023' },
    { id: 26, title: 'Mental Health', timestamp: 'Jul 05, 2023' },
    { id: 27, title: 'Relationship Advice', timestamp: 'Jul 04, 2023' },
    { id: 28, title: 'Career Development', timestamp: 'Jul 03, 2023' },
    { id: 29, title: 'Business Ideas', timestamp: 'Jul 02, 2023' },
    { id: 30, title: 'Marketing Strategies', timestamp: 'Jul 01, 2023' },
    { id: 31, title: 'Social Media', timestamp: 'Jun 30, 2023' },
    { id: 32, title: 'Web Design', timestamp: 'Jun 29, 2023' },
    { id: 33, title: 'Graphic Design', timestamp: 'Jun 28, 2023' },
    { id: 34, title: 'Mobile Apps', timestamp: 'Jun 27, 2023' },
    { id: 35, title: 'Cloud Computing', timestamp: 'Jun 26, 2023' },
    { id: 36, title: 'Data Science', timestamp: 'Jun 25, 2023' },
    { id: 37, title: 'Artificial Intelligence', timestamp: 'Jun 24, 2023' },
    { id: 38, title: 'Machine Learning', timestamp: 'Jun 23, 2023' },
    { id: 39, title: 'Cybersecurity', timestamp: 'Jun 22, 2023' },
    { id: 40, title: 'Blockchain Technology', timestamp: 'Jun 21, 2023' },
    { id: 41, title: 'Virtual Reality', timestamp: 'Jun 20, 2023' },
    { id: 42, title: 'Augmented Reality', timestamp: 'Jun 19, 2023' },
    { id: 43, title: '3D Printing', timestamp: 'Jun 18, 2023' },
    { id: 44, title: 'Robotics', timestamp: 'Jun 17, 2023' },
    { id: 45, title: 'Space Exploration', timestamp: 'Jun 16, 2023' },
    { id: 46, title: 'Renewable Energy', timestamp: 'Jun 15, 2023' },
    { id: 47, title: 'Environmental Conservation', timestamp: 'Jun 14, 2023' },
    { id: 48, title: 'Sustainable Living', timestamp: 'Jun 13, 2023' },
    { id: 49, title: 'Global News', timestamp: 'Jun 12, 2023' },
    { id: 50, title: 'Political Analysis', timestamp: 'Jun 11, 2023' },
];

/**
 * ComponentChatHistory displays the chat history section.
 * It includes tabs for Tools and History (with History selected)
 * and lists the past chat sessions.
 */
const ComponentChatHistory = () => {
    const location = useLocation(); // Import useRouter from 'next/router'
    const [activeChatId, setActiveChatId] = useState(0); // Get active chat ID from query or default to 39

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempActiveChatId = 0;
        const chatId = queryParams.get('id') || '0'; // Default to 39 if no id is found
        if (parseInt(chatId) >= 1) {
            tempActiveChatId = parseInt(chatId);
        }
        setActiveChatId(tempActiveChatId); // Update activeChatId state
        // You can add your fetch logic here to load the chat data
    }, [location.search]);

    return (
        <div
            className="py-4 pl-3 text-black"
        >
            {/* Chat Options Title */}
            <h2 className="text-lg font-bold mb-4 text-black">
                Chat History
            </h2>

            {/* chat new */}
            <div className="mb-4">
                <button
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors duration-150"
                    onClick={() => {
                        alert('New chat initiated!');
                    }}
                >
                    New Chat
                </button>
            </div>

            {/* search */}
            <div className="mb-4">
                <DebounceInput
                    debounceTimeout={750}
                    type="text"
                    placeholder="Search chat history..."
                    className="border rounded-lg p-2 w-full"
                    onChange={() => {
                        // const searchTerm = e.target.value.toLowerCase();
                        // const filteredItems = historyItems.filter(item =>
                        //     item.title.toLowerCase().includes(searchTerm)
                        // );
                        // setFilteredHistoryItems(filteredItems);
                    }}
                />
            </div>

            {/* History Items List */}
            <div className="space-y-3">
                {historyItems.map((item) => (
                    <div>
                        <Link
                            to={`/user/chat?id=${item.id}`}
                            key={item.id}
                            className={`block p-3 rounded-lg border cursor-pointer transition-colors duration-150 ease-in-out ${item.id === activeChatId ? 'bg-blue-100 border-blue-600' : 'bg-gray-100 border-gray-300 hover:border-gray-600'}`}
                        >
                            {/* Chat Title */}
                            <span className="block text-base font-semibold text-black mb-1">
                                {item.title}
                            </span>
                            {/* Timestamp */}
                            <span className="block text-xs text-gray-600">
                                {item.timestamp}
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
    )
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
                className='bg-white rounded-lg shadow-md'
                style={{
                    paddingTop: '10px',
                    paddingBottom: '10px',
                }}
            >
                <div
                    style={{
                        height: 'calc(100vh - 100px)',
                        overflowY: 'auto'
                    }}
                    className='pt-3 pb-5'
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
            <div
            >
                <div
                    className='bg-gray-100 shadow-md'
                    style={{
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    }}
                >
                    <div
                        style={{
                            height: 'calc(100vh)',
                            overflowY: 'auto'
                        }}
                        className='pt-3 pb-5'
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
}
// export default ComponentChatHistoryModelRender;