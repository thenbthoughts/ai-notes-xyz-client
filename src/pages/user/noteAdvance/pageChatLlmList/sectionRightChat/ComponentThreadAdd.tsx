import { Link, useNavigate } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { MessageCircle, Settings, ExternalLink, LucideBot } from "lucide-react";
import { useState } from "react";

const ComponentThreadAdd = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        isPersonalContextEnabled: true,
        isAutoAiContextSelectEnabled: true,
    });

    const addNewThread = async () => {
        try {
            const result = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: formData.isPersonalContextEnabled,
                    isAutoAiContextSelectEnabled: formData.isAutoAiContextSelectEnabled,
                }
            );

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

    return (
        <div
            style={{
                height: 'calc(-60px + 100vh)',
                overflowY: 'auto',
            }}
        >
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <MessageCircle
                            className="w-5 h-5 text-gray-600"
                            style={{
                                position: 'relative',
                                top: '1px',
                                left: '1px',
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-100">ChatUI</h1>
                        <span className="text-sm text-gray-300">AI Assistant</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    Start a new conversation with ChatUI to get help with any task.
                </p>

                {/* Current Model Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Current Model</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center text-gray-800">
                        <div className="w-4 h-4 bg-gray-300 rounded mr-2">
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                                <LucideBot className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <span className="font-medium">openrouter/auto</span>
                    </div>
                    <div className="mt-2">
                        <Link to="/user/setting" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Model page
                        </Link>
                    </div>
                </div>

                {/* Chat Options */}
                <div className="mb-4">
                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                        {/* field -> isPersonalContextEnabled */}
                        <div className="flex-1">
                            <div
                                onClick={() => {
                                    setFormData({ ...formData, isPersonalContextEnabled: !formData.isPersonalContextEnabled });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="rounded-md mr-2"
                                    checked={formData.isPersonalContextEnabled}
                                />
                                <span className="text-sm text-gray-700 cursor-pointer">Personal Context Enable</span>
                            </div>
                        </div>

                        {/* field -> isAutoAiContextSelectEnabled */}
                        <div className="flex-1">
                            <div
                                onClick={() => {
                                    setFormData({ ...formData, isAutoAiContextSelectEnabled: !formData.isAutoAiContextSelectEnabled });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="rounded-md mr-2"
                                    checked={formData.isAutoAiContextSelectEnabled}
                                />
                                <span className="text-sm text-gray-700 cursor-pointer">Auto AI Context Enable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Chat Button */}
                <div className="mb-4">
                    <button
                        onClick={addNewThread}
                        className="w-full p-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-500 rounded-xl shadow-lg hover:shadow-blue-500/30 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                    >
                        <div className="inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-center justify-center space-x-2 z-10">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                                <MessageCircle className="w-4 h-4 text-white drop-shadow-sm" />
                            </div>
                            <span className="text-base font-semibold tracking-wide">Start New Chat</span>
                            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ComponentThreadAdd;