import { LucidePlus, LucideSend } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../config/axiosCustom';
import { chipAction } from './homepagePanelStyles';

type LastUsedModelState = {
    loaded: 'true' | 'false' | 'pending';
    aiModelProvider: 'openrouter' | 'groq' | 'ollama' | 'openai-compatible';
    aiModelName: string;
    aiModelOpenAiCompatibleConfigId: string | null;
};

const defaultLastUsedModelState: LastUsedModelState = {
    loaded: 'pending',
    aiModelProvider: 'openrouter',
    aiModelName: 'openrouter/auto',
    aiModelOpenAiCompatibleConfigId: null,
};

let chatRouteChunkPrefetchPromise: Promise<unknown> | null = null;

const prefetchChatRouteChunk = () => {
    if (!chatRouteChunkPrefetchPromise) {
        chatRouteChunkPrefetchPromise = import('../features/ChatLlmList/ChatLlmListWrapper.tsx');
    }
    return chatRouteChunkPrefetchPromise;
};

const ComponentQuickActionAiChat = () => {
    const [isAddThreadLoading, setIsAddThreadLoading] = useState(false);
    const [promptText, setPromptText] = useState('');
    const [isLastUsedModelLoadedObj, setIsLastUsedModelLoadedObj] =
        useState<LastUsedModelState>(defaultLastUsedModelState);

    const navigate = useNavigate();

    const fetchLastUsedModel = useCallback(async () => {
        setIsLastUsedModelLoadedObj((prev) => {
            return { ...prev, loaded: 'pending' };
        });
        try {
            const lastUsedResponse = await axiosCustom.get('/api/chat-llm/threads-crud/lastUsedLlmModel');
            if (lastUsedResponse.data.model) {
                setIsLastUsedModelLoadedObj({
                    loaded: 'true',
                    aiModelProvider: lastUsedResponse.data.model.aiModelProvider,
                    aiModelName: lastUsedResponse.data.model.aiModelName,
                    aiModelOpenAiCompatibleConfigId:
                        lastUsedResponse.data.model.aiModelOpenAiCompatibleConfigId || null,
                });
            } else {
                setIsLastUsedModelLoadedObj({
                    ...defaultLastUsedModelState,
                    loaded: 'true',
                });
            }
        } catch (error) {
            console.error('Error fetching last used model:', error);
            setIsLastUsedModelLoadedObj({
                ...defaultLastUsedModelState,
                loaded: 'false',
            });
        }
    }, []);

    useEffect(() => {
        void fetchLastUsedModel();
        void prefetchChatRouteChunk();
    }, [fetchLastUsedModel]);

    const addNewThread = async () => {
        if (isAddThreadLoading) {
            return;
        }
        setIsAddThreadLoading(true);
        try {
            let modelState = isLastUsedModelLoadedObj;

            if (modelState.loaded === 'pending') {
                try {
                    const lastUsedResponse = await axiosCustom.get('/api/chat-llm/threads-crud/lastUsedLlmModel');
                    if (lastUsedResponse.data.model) {
                        modelState = {
                            loaded: 'true',
                            aiModelProvider: lastUsedResponse.data.model.aiModelProvider,
                            aiModelName: lastUsedResponse.data.model.aiModelName,
                            aiModelOpenAiCompatibleConfigId:
                                lastUsedResponse.data.model.aiModelOpenAiCompatibleConfigId || null,
                        };
                    } else {
                        modelState = {
                            ...defaultLastUsedModelState,
                            loaded: 'true',
                        };
                    }
                    setIsLastUsedModelLoadedObj(modelState);
                } catch (error) {
                    console.error('Error fetching last used model:', error);
                    modelState = {
                        ...defaultLastUsedModelState,
                        loaded: 'false',
                    };
                    setIsLastUsedModelLoadedObj(modelState);
                }
            }

            const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd', {
                isPersonalContextEnabled: false,
                isAutoAiContextSelectEnabled: false,
                aiModelProvider: modelState.aiModelProvider,
                aiModelName: modelState.aiModelName,
                aiModelOpenAiCompatibleConfigId: modelState.aiModelOpenAiCompatibleConfigId,
            });

            const tempThreadId = result?.data?.thread?._id;
            const trimmedPrompt = promptText.trim();
            const titleHint = trimmedPrompt.length > 40 ? `${trimmedPrompt.slice(0, 40)}…` : trimmedPrompt;
            if (tempThreadId && typeof tempThreadId === 'string') {
                navigate(`/user/chat?id=${tempThreadId}`);
            }

            if (titleHint) {
                toast.success(`New thread added: ${titleHint}`);
            } else {
                toast.success('New thread added successfully!');
            }
            setPromptText('');
        } catch (error) {
            toast.error('Error adding new thread: ' + String(error));
        } finally {
            setIsAddThreadLoading(false);
        }
    };

    const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void addNewThread();
        }
    };

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex gap-1">
                <textarea
                    value={promptText}
                    onChange={(event) => {
                        setPromptText(event.target.value);
                    }}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Ask AI… (Enter to send, Shift+Enter for newline)"
                    rows={1}
                    className="min-h-[32px] flex-1 resize-none rounded-xl border-2 border-sky-700/70 bg-zinc-900 px-2 py-1 text-xs font-medium text-sky-100 placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="AI chat prompt"
                />
                <button
                    type="button"
                    onClick={() => {
                        void addNewThread();
                    }}
                    onMouseEnter={prefetchChatRouteChunk}
                    onFocus={prefetchChatRouteChunk}
                    disabled={isAddThreadLoading}
                    className={`${chipAction} shrink-0`}
                    aria-label="Start AI chat"
                >
                    {isAddThreadLoading ? (
                        <LucideSend className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                    ) : (
                        <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    AI chat
                </button>
            </div>
        </div>
    );
};

export default ComponentQuickActionAiChat;
