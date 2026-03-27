import { useState } from 'react';
import axiosCustom from '../../../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { LucideDownload, LucideInfo, LucideZap } from 'lucide-react';
import { IChatLlmThread } from '../../../../../../types/pages/schemaChatLlmThread.types';

// Helper function to format model name for display
const formatModelNameForDisplay = (aiModelName: string): string => {
    // For all providers, just format slashes
    // aiModelName now contains only the model name (no configId prefix)
    return aiModelName.replace('/', ' / ').replace('/', ' / ');
};

const ComponentAiGeneratedQuestionList = ({
    threadId,
}: {
    threadId: string;
}) => {

    const [tab, setTab] = useState<'generate' | 'info'>('generate');
    const defaultThreadInfo: IChatLlmThread = {
        _id: '',
        threadTitle: '',
        isPersonalContextEnabled: false,
        isAutoAiContextSelectEnabled: false,
        aiModelName: '',
        aiModelProvider: '',
        sttModelName: '',
        sttModelProvider: '',
        ttsModelName: '',
        ttsModelProvider: '',
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
    };

    const [threadInfo, setThreadInfo] = useState<IChatLlmThread>(defaultThreadInfo);

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
            let threadInfo: IChatLlmThread = {
                _id: '',
                threadTitle: '',
                isPersonalContextEnabled: false,
                isAutoAiContextSelectEnabled: false,
                aiModelName: '',
                aiModelProvider: '',
                sttModelName: '',
                sttModelProvider: '',
                ttsModelName: '',
                ttsModelProvider: '',
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
            };

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
            threadStr += `AI Model Name: ${formatModelNameForDisplay(threadInfo.aiModelName)}\n`;
            threadStr += `AI Model Provider: ${threadInfo.aiModelProvider === 'openai-compatible' ? 'OpenAI Compatible' : threadInfo.aiModelProvider}\n`;
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
                for (let i = 0; i < chatList.length; i++) {
                    const chat = chatList[i];
                    threadStr += `Message ${i + 1}:\n`;
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
                    <div className="mb-3 text-center">
                        <p className="text-sm font-semibold text-zinc-800">
                            {questions.length} suggested questions
                        </p>
                    </div>
                )}
                {loading ? (
                    <p className="text-center text-sm font-medium text-zinc-500">Loading…</p>
                ) : (
                    <ul className="max-h-[30vh] space-y-2 overflow-auto pr-0.5">
                        {questions.map((question, index) => (
                            <li
                                key={index}
                                className="flex items-start justify-between gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-3 text-sm text-zinc-800"
                            >
                                <span className="min-w-0 flex-1 leading-snug">{question}</span>
                                <button
                                    type="button"
                                    onClick={() => void navigator.clipboard.writeText(question)}
                                    className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-teal-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
                                >
                                    Copy
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const renderTabInfo = () => {
        return (
            <div>
                <div className="space-y-3">
                    <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-teal-50/40 p-3">
                        <p className="text-sm font-semibold text-zinc-900">{threadInfo.threadTitle}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-2.5">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-2 w-2 rounded-full ${threadInfo.isPersonalContextEnabled ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                                />
                                <span className="text-xs font-medium text-zinc-700">Personal context</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-2.5">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-2 w-2 rounded-full ${threadInfo.isAutoAiContextSelectEnabled ? 'bg-amber-500' : 'bg-zinc-300'}`}
                                />
                                <span className="text-xs font-medium text-zinc-700">Auto AI context</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-indigo-200/70 bg-indigo-50/70 p-3">
                        <div className="min-w-0">
                            <span className="block truncate text-sm font-medium text-zinc-900">
                                {formatModelNameForDisplay(threadInfo.aiModelName)}
                            </span>
                            <span className="text-xs text-zinc-500">
                                {threadInfo.aiModelProvider === 'openai-compatible'
                                    ? 'OpenAI Compatible'
                                    : threadInfo.aiModelProvider}
                            </span>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100/90">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        </div>
                    </div>

                    {threadInfo.aiSummary && (
                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3">
                            <p className="text-xs leading-relaxed text-zinc-600">{threadInfo.aiSummary}</p>
                        </div>
                    )}

                    {threadInfo.tagsAi && threadInfo.tagsAi.length > 0 && (
                        <div className="rounded-xl border border-violet-200/70 bg-violet-50/60 p-3">
                            <div className="flex flex-wrap gap-1.5">
                                {threadInfo.tagsAi.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="rounded-md border border-violet-200/80 bg-violet-100/80 px-2 py-0.5 text-xs font-medium text-violet-800"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const pillBtn =
        'inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-zinc-800 sm:text-sm';

    return (
        <div className="py-4">
            <div className="px-1 sm:px-0">
                <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                fetchQuestions();
                                setTab('generate');
                            }}
                            className={`${pillBtn} bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500`}
                        >
                            <LucideZap className="h-4 w-4" strokeWidth={2} />
                            Suggest questions
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                fetchThreadInfo();
                                setTab('info');
                            }}
                            className={pillBtn}
                        >
                            <LucideInfo className="h-4 w-4" strokeWidth={2} />
                            Thread info
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setTab('info');
                                fetchThreadInfo();
                                fetchThreadInfoAndDownload();
                            }}
                            className={pillBtn}
                        >
                            <LucideDownload className="h-4 w-4" strokeWidth={2} />
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
