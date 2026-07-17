import { LucidePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../config/axiosCustom';

const chipAction =
    'inline-flex items-center gap-1 rounded-xl border-2 border-sky-200/70 bg-white/95 px-2 py-1 text-[11px] font-semibold text-sky-800 shadow-sm transition hover:-translate-y-px hover:border-cyan-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 disabled:opacity-50';

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
    const [isLastUsedModelLoadedObj, setIsLastUsedModelLoadedObj] =
        useState<LastUsedModelState>(defaultLastUsedModelState);

    const navigate = useNavigate();

    const fetchLastUsedModel = useCallback(async () => {
        setIsLastUsedModelLoadedObj((prev) => ({ ...prev, loaded: 'pending' }));
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
            if (tempThreadId && typeof tempThreadId === 'string') {
                navigate(`/user/chat?id=${tempThreadId}`);
            }

            toast.success('New thread added successfully!');
        } catch (error) {
            alert('Error adding new thread: ' + error);
        } finally {
            setIsAddThreadLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={() => addNewThread()}
            onMouseEnter={prefetchChatRouteChunk}
            onFocus={prefetchChatRouteChunk}
            disabled={isAddThreadLoading}
            className={chipAction}
        >
            <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
            AI chat
        </button>
    );
};

export default ComponentQuickActionAiChat;
