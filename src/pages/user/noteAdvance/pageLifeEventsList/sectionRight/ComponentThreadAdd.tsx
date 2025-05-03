import { useNavigate } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";

const ComponentThreadAdd = () => {
    const navigate = useNavigate();

    const addNewThread = async () => {
        try {
            const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd');

            const tempThreadId = result?.data?.thread?._id;
            if (tempThreadId) {
                if (typeof tempThreadId === 'string') {
                    const redirectUrl = `/user/chat?id=${tempThreadId}`;
                    navigate(redirectUrl);
                }
            }

            toast.success('New thread added successfully!');
        } catch (error) {
            alert('Error adding new thread: ' + error);
        }
    };

    {/* New Chat Button */ }
    return (
        <div className="mb-4 px-2 rounded-md text-center py-5">
            <button
                className="relative w-full p-4 sm:p-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-xl shadow-lg overflow-hidden group hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 transition-colors duration-300"
                onClick={() => {
                    addNewThread();
                }}
                aria-label="Add new LLM chat thread"
            >
                <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 group-hover:bg-opacity-30 transition">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-center sm:text-left text-white">
                        <h3 className="text-lg font-semibold leading-tight">+ Add</h3>
                        <p className="mt-1 text-sm opacity-80">
                            Start a fresh conversation with your chatbot.
                        </p>
                    </div>
                </div>
            </button>
        </div>
    )
}

export default ComponentThreadAdd;