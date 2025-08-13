import { useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { LucideDownload, LucideInfo, LucideZap } from 'lucide-react';
import { IChatLlmThread } from '../../../../../types/pages/schemaChatLlmThread.types';

const ComponentAiGeneratedQuestionList = ({
    threadId,
}: {
    threadId: string;
}) => {

    const [tab, setTab] = useState<'generate' | 'info'>('generate');
    const [threadInfo, setThreadInfo] = useState<IChatLlmThread>({
        _id: '',
        threadTitle: '',
        isPersonalContextEnabled: false,
        isAutoAiContextSelectEnabled: false,
        aiModelName: '',
        aiModelProvider: '',
        aiSummary: '',
        aiTasks: [],
        tagsAi: [],
        username: '',
        createdAtUtc: new Date(),
        createdAtIpAddress: '',
        createdAtUserAgent: '',
        updatedAtUtc: new Date(),
        updatedAtIpAddress: '',
        updatedAtUserAgent: '',
    });

    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchQuestions = async () => {
        setLoading(true);
        const config = {
            method: 'post',
            url: '/api/chat-llm/ai-generated-next-questions/notesNextQuestionGenerateByLast30Conversation',
            data: {
                threadId,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await axiosCustom.request(config);
            if (response.data.success === "Success") {
                setQuestions(response.data.data.docs);
            } else {
                toast.error('Error fetching questions: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Error fetching questions!');
        } finally {
            setLoading(false);
        }
    };

    const fetchThreadInfo = async () => {
        try {
            const response = await axiosCustom.post('/api/chat-llm/threads-crud/threadsGet', {
                threadId,
            });

            if (Array.isArray(response.data.docs) && response.data.docs.length > 0) {
                setThreadInfo(response.data.docs[0]);
            } else {
                toast.error('Error fetching thread info: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error fetching thread info:', error);
            toast.error('Error fetching thread info!');
        }
    }

    const fetchThreadInfoAndDownload = async () => {
        try {
            let threadInfo = {
                _id: '',
                threadTitle: '',
                isPersonalContextEnabled: false,
                isAutoAiContextSelectEnabled: false,
                aiModelName: '',
                aiModelProvider: '',
                aiSummary: '',
                aiTasks: [],
                tagsAi: [],
                username: '',
                createdAtUtc: new Date(),
                createdAtIpAddress: '',
                createdAtUserAgent: '',
                updatedAtUtc: new Date(),
                updatedAtIpAddress: '',
                updatedAtUserAgent: '',
            } as IChatLlmThread;

            const response = await axiosCustom.post('/api/chat-llm/threads-crud/threadsGet', {
                threadId,
            });

            if (Array.isArray(response.data.docs) && response.data.docs.length > 0) {
                threadInfo = response.data.docs[0];
            } else {
                toast.error('Error fetching thread info: ' + response.data.error);
                return;
            }

            let threadStr = '';

            threadStr += `Thread Title: ${threadInfo.threadTitle}\n`;
            threadStr += `Is Personal Context Enabled: ${threadInfo.isPersonalContextEnabled}\n`;
            threadStr += `Is Auto AI Context Select Enabled: ${threadInfo.isAutoAiContextSelectEnabled}\n`;
            threadStr += `AI Model Name: ${threadInfo.aiModelName}\n`;
            threadStr += `AI Model Provider: ${threadInfo.aiModelProvider}\n`;
            threadStr += `AI Summary: ${threadInfo.aiSummary}\n`;
            threadStr += `AI Tasks: ${threadInfo.aiTasks.join(', ')}\n`;
            threadStr += `Tags AI: ${threadInfo.tagsAi.join(', ')}\n`;

            // get all chat
            const responseChatLlm = await axiosCustom.post('/api/chat-llm/crud/notesGet', {
                threadId,
            });

            threadStr += `\n\n`;
            threadStr += `-----`;
            threadStr += `\n\n`;

            if (Array.isArray(responseChatLlm.data.docs) && responseChatLlm.data.docs.length > 0) {
                let chatList = responseChatLlm.data.docs;
                for (let chat of chatList) {
                    threadStr += `Chat ID: ${chat._id}\n`;
                    if (chat.content.includes('AI:')) {
                        threadStr += `AI: ${chat.content.replace('AI: #', '').replace(/\n\n/g, '\n')}`;
                    } else {
                        threadStr += `User: ${chat.content}`;
                    }
                    threadStr += `\n\n`;
                    threadStr += `-----`;
                    threadStr += `\n\n`;
                }
            }

            const blob = new Blob([threadStr], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat thread - ${threadInfo.threadTitle} - ${threadInfo._id} - ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}.txt`;
            a.click();
        } catch (error) {
            console.error('Error fetching thread info:', error);
            toast.error('Error fetching thread info!');
        }
    }

    const renderTabGenerate = () => {
        return (
            <div>
                {questions.length >= 1 && (
                    <div className='text-center'>
                        <p className="text-lg font-semibold mb-2">{questions.length} Questions Available</p>
                    </div>
                )}
                {loading ? (
                    <p className="text-gray-500 text-center font-semibold">Loading questions...</p>
                ) : (
                    <ul className="overflow-auto max-h-[30vh]">
                        {questions.map((question, index) => (
                            <li key={index} className="mb-1 p-2 text-sm bg-gray-200">
                                {question}
                                <button
                                    onClick={() => navigator.clipboard.writeText(question)}
                                    className="ml-2 text-blue-500 hover:underline"
                                >
                                    Copy
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    }

    const renderTabInfo = () => {
        return (
            <div>
                <div className="space-y-2">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded p-2 border border-blue-200">
                        <p className="text-gray-700 font-medium text-sm">{threadInfo.threadTitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-green-50 rounded p-2 border border-green-200">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${threadInfo.isPersonalContextEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span className="text-xs text-gray-700">Personal Context</span>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded p-2 border border-orange-200">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${threadInfo.isAutoAiContextSelectEnabled ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                                <span className="text-xs text-gray-700">Auto AI Context</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded p-2 border border-indigo-200 flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-800">{threadInfo.aiModelName}</span>
                            <span className="text-xs text-gray-500 ml-2">({threadInfo.aiModelProvider})</span>
                        </div>
                        <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-sm"></div>
                        </div>
                    </div>

                    {threadInfo.aiSummary && (
                        <div className="bg-gray-50 rounded p-2 border border-gray-200">
                            <p className="text-xs text-gray-600 leading-relaxed">{threadInfo.aiSummary}</p>
                        </div>
                    )}

                    {threadInfo.tagsAi && threadInfo.tagsAi.length > 0 && (
                        <div className="bg-purple-50 rounded p-2 border border-purple-200">
                            <div className="flex flex-wrap gap-1">
                                {threadInfo.tagsAi.map((tag, index) => (
                                    <span key={index} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className='py-3'>
            <div className='px-2'>
                <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md inline-block w-full whitespace-pre-wrap">
                    <div className='text-center'>
                        <button
                            onClick={() => {
                                fetchQuestions();
                                setTab('generate')
                            }}
                            className="mb-2 mt-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:from-purple-600 hover:to-blue-700 transition duration-200 transform hover:scale-105 inline-flex items-center gap-1.5 text-sm font-medium mr-2"
                        >
                            <LucideZap className="w-4 h-4" />
                            Generate AI Questions
                        </button>
                        <button
                            onClick={() => {
                                fetchThreadInfo();
                                setTab('info');
                            }}
                            className="mb-2 mt-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:from-purple-600 hover:to-blue-700 transition duration-200 transform hover:scale-105 inline-flex items-center gap-1.5 text-sm font-medium mr-2"
                        >
                            <LucideInfo className="w-4 h-4" />
                            Info
                        </button>
                        {/* button download */}
                        <button
                            onClick={() => {
                                setTab('info');
                                fetchThreadInfo();
                                fetchThreadInfoAndDownload();
                            }}
                            className="mb-2 mt-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:from-purple-600 hover:to-blue-700 transition duration-200 transform hover:scale-105 inline-flex items-center gap-1.5 text-sm font-medium mr-2"
                        >
                            <LucideDownload className="w-4 h-4" />
                            Download
                        </button>
                    </div>

                    {tab === 'generate' && renderTabGenerate()}
                    {tab === 'info' && renderTabInfo()}
                </div>
            </div>
        </div>
    );
};

export default ComponentAiGeneratedQuestionList;
