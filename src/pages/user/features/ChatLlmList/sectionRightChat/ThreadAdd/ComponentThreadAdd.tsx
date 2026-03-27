import { Link, useNavigate } from "react-router-dom";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { MessageCircle, Settings, ExternalLink, LucideInfo } from "lucide-react";
import SelectSttModel from "../ThreadSetting/SelectSttModel";
import SelectTtsModel from "../ThreadSetting/SelectTtsModel";
import { useState, useEffect } from "react";
import Select from "react-select";
import { tsSchemaAiModelListGroq } from "../../../../../../types/pages/settings/dataModelGroq";
import { tsSchemaAiModelListOpenrouter } from "../../../../../../types/pages/settings/dataModelOpenrouter";
import { jotaiChatThreadRefreshRandomNum } from "../../jotai/jotaiChatLlmThreadSetting";
import { useSetAtom } from "jotai";
import Tooltip from '@rc-component/tooltip';

const SelectAiModelOpenrouter = ({
    aiModelName,
    setAiModelName,

    selectRandomModel,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;

    selectRandomModel: number;
}) => {
    const [modelArr, setModelArr] = useState([] as tsSchemaAiModelListOpenrouter[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            try {
                setIsLoadingModel(true);
                const response = await axiosCustom.get('/api/dynamic-data/model-openrouter/modelOpenrouterGet');

                if (response.data.docs && response.data.docs.length > 0) {

                    let tempModelArr = response.data.docs as {
                        id: string;
                        name: string;
                        description: string;
                    }[];

                    tempModelArr = tempModelArr.map((model) => ({
                        id: model.id,
                        name: `${model.name} (${model.id})`,
                        description: model.description,
                    })).sort((a, b) => a.name.localeCompare(b.name));

                    // if aiModelName is empty, select a random model
                    if (aiModelName === '') {
                        if (tempModelArr.length > 0) {
                            setAiModelName(tempModelArr[0].id);
                        }
                    }

                    setModelArr(tempModelArr);
                }
            } catch (error) {
                console.error('Error fetching model data:', error);
                // Keep default model if API fails
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchModelData();
    }, []);

    useEffect(() => {
        if (selectRandomModel >= 1) {
            if (modelArr.length > 0) {
                const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
                setAiModelName(randomModel.id);
            }
        }
    }, [selectRandomModel]);

    useEffect(() => {
        if (aiModelName === '') {
            if (modelArr.length > 0) {
                setAiModelName(modelArr[0].id);
            }
        }
    }, [aiModelName]);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">OpenRouter Model</h3>
            <Select<{ value: string; label: string }>
                value={aiModelName ? { value: aiModelName, label: modelArr.find(model => model.id === aiModelName)?.name || "" } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={
                    modelArr.map((model: any) => ({
                        value: model.id,
                        label: `${model.name} (${model.id})`
                    }))
                }

                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
            />
        </div>
    )
}

const SelectAiModelGroq = ({
    aiModelName,
    setAiModelName,

    selectRandomModel,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;

    selectRandomModel: number;
}) => {
    const [modelArr, setModelArr] = useState([] as tsSchemaAiModelListGroq[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoadingModel(true);
            const response = await axiosCustom.get('/api/dynamic-data/model-groq/modelGroqGet');
            setModelArr(response.data.docs);

            // if aiModelName is empty, select a random model
            if (aiModelName === '') {
                if (modelArr.length > 0) {
                    setAiModelName(modelArr[0].id);
                }
            }

            setIsLoadingModel(false);
        }
        fetchModelData();
    }, []);

    useEffect(() => {
        if (selectRandomModel >= 1) {
            if (modelArr.length > 0) {
                const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
                setAiModelName(randomModel.id);
            }
        }
    }, [selectRandomModel]);

    useEffect(() => {
        if (aiModelName === '') {
            if (modelArr.length > 0) {
                setAiModelName(modelArr[0].id);
            }
        }
    }, [aiModelName]);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">GROQ Model</h3>
            <Select<{ value: string; label: string }>
                value={aiModelName ? { value: aiModelName, label: modelArr.find(model => model.id === aiModelName)?.id || "" } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={
                    modelArr.map((model: any) => ({
                        value: model.id,
                        label: `${model.owned_by} - ${model.id}`
                    }))
                }

                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
            />
        </div>
    )
}

const SelectAiModelOllama = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [ollamaModels, setOllamaModels] = useState<
        Array<{ _id: string; modelName: string; modelLabel: string }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchOllamaModels = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-ollama/modelOllamaGet");
                setOllamaModels(res.data.docs || []);
            } catch (err) {
                setError("Failed to fetch models");
            } finally {
                setLoading(false);
            }
        };
        fetchOllamaModels();
    }, []);

    useEffect(() => {
        // Set default to first model if not set
        if (ollamaModels.length > 0 && !aiModelName) {
            setAiModelName(ollamaModels[0].modelName);
        }
    }, [ollamaModels, aiModelName, setAiModelName]);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Ollama Model</h3>
            {loading ? (
                <div className="text-gray-500 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : ollamaModels.length === 0 ? (
                <div className="text-sm text-gray-500">No Ollama models found. Go to Ollama settings to add models.</div>
            ) : (
                <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={aiModelName}
                    onChange={e => setAiModelName(e.target.value)}
                >
                    {ollamaModels.map(model => (
                        <option key={model._id} value={model.modelName}>
                            {model.modelLabel || model.modelName}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

const SelectAiModelLocalai = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [localaiModels, setLocalaiModels] = useState<
        Array<{ _id: string; modelName: string; modelLabel: string }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchLocalaiModels = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-localai/modelLocalaiGet");
                setLocalaiModels(res.data.docs || []);
            } catch (err) {
                setError("Failed to fetch models");
            } finally {
                setLoading(false);
            }
        };
        fetchLocalaiModels();
    }, []);

    useEffect(() => {
        // Set default to first model if not set
        if (localaiModels.length > 0 && !aiModelName) {
            setAiModelName(localaiModels[0].modelName);
        }
    }, [localaiModels, aiModelName, setAiModelName]);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">LocalAI Model</h3>
            {loading ? (
                <div className="text-gray-500 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : localaiModels.length === 0 ? (
                <div className="text-sm text-gray-500">No LocalAI models found. Go to LocalAI settings to add models.</div>
            ) : (
                <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={aiModelName}
                    onChange={e => setAiModelName(e.target.value)}
                >
                    {localaiModels.map(model => (
                        <option key={model._id} value={model.modelName}>
                            {model.modelLabel || model.modelName}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

const SelectAiModelOpenaiCompatible = ({
    aiModelName,
    setAiModelName,
    aiModelOpenAiCompatibleConfigId,
    setAiModelOpenAiCompatibleConfigId,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    aiModelOpenAiCompatibleConfigId: string | null;
    setAiModelOpenAiCompatibleConfigId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    interface IOpenaiCompatibleModel {
        _id: string;
        providerName?: string;
        baseUrl: string;
        modelName?: string;
    }

    const [configs, setConfigs] = useState<IOpenaiCompatibleModel[]>([]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchConfigs = async () => {
            setIsLoadingModel(true);
            try {
                const response = await axiosCustom.post<{ docs: IOpenaiCompatibleModel[] }>(
                    `/api/user/openai-compatible-model/crud/openaiCompatibleModelGet`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true,
                    }
                );
                setConfigs(response.data.docs || []);

                // Auto-select first config if none selected
                if (!aiModelOpenAiCompatibleConfigId && response.data.docs && response.data.docs.length > 0) {
                    const firstConfig = response.data.docs[0];
                    setAiModelOpenAiCompatibleConfigId(firstConfig._id);
                    setAiModelName(firstConfig.modelName || '');
                }
            } catch (error) {
                console.error('Error fetching OpenAI compatible models:', error);
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchConfigs();
    }, []);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">OpenAI Compatible Model</h3>
            {isLoadingModel ? (
                <div className="text-sm text-gray-500">Loading configurations...</div>
            ) : configs.length === 0 ? (
                <div className="text-sm text-gray-500 mb-2">
                    No configurations found.
                    <Link to="/user/setting/openai-compatible-model" className="text-blue-600 hover:underline ml-1">
                        Create one here
                    </Link>
                </div>
            ) : (
                <Select<{ value: string; label: string }>
                    value={aiModelOpenAiCompatibleConfigId ? {
                        value: aiModelOpenAiCompatibleConfigId,
                        label: (() => {
                            const config = configs.find(c => c._id === aiModelOpenAiCompatibleConfigId);
                            if (!config) return '';
                            const displayName = config.providerName || config.baseUrl;
                            return aiModelName ? `${displayName} - ${aiModelName}` : displayName;
                        })()
                    } : undefined}
                    onChange={(selectedOption: { value: string; label: string } | null) => {
                        if (selectedOption) {
                            const config = configs.find(c => c._id === selectedOption.value);
                            setAiModelOpenAiCompatibleConfigId(selectedOption.value);
                            setAiModelName(config?.modelName || '');
                        }
                    }}
                    options={configs.map((config) => {
                        const displayName = config.providerName || config.baseUrl;
                        const label = config.modelName ? `${displayName} - ${config.modelName}` : displayName;
                        return { value: config._id, label };
                    })}
                    placeholder="Select a configuration..."
                    isSearchable={true}
                />
            )}
        </div>
    );
};

const LastUsedLlmModel = ({
    aiModelName,
    setAiModelName,
    setAiModelProvider,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    setAiModelProvider: React.Dispatch<React.SetStateAction<"openrouter" | "groq" | "ollama" | "localai" | "openai-compatible">>;
}) => {
    const [topLlmModels, setTopLlmModels] = useState<Array<{ aiModelProvider: string, aiModelName: string }>>([]);

    const [showMoreModels, setShowMoreModels] = useState(false);

    useEffect(() => {
        const fetchTopLlmModels = async () => {
            try {
                const response = await axiosCustom.get('/api/chat-llm/threads-crud/topLlmConversationModel');
                setTopLlmModels(response.data.modelArr || []);
            } catch (error) {
                console.error('Error fetching top LLM models:', error);
            }
        };

        fetchTopLlmModels();
    }, []);

    const handleModelSelect = (model: { aiModelProvider: string, aiModelName: string }) => {
        if (model.aiModelProvider === 'openrouter' || model.aiModelProvider === 'groq' || model.aiModelProvider === 'ollama' || model.aiModelProvider === 'localai' || model.aiModelProvider === 'openai-compatible') {
            setAiModelProvider(model.aiModelProvider as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");
        }
        setAiModelName(model.aiModelName);
    };

    // Helper function to format model name for display
    const formatModelNameForDisplay = (modelName: string): string => {
        // For all providers, just format slashes
        // modelName now contains only the model name (no configId prefix)
        return modelName.replace('/', ' / ').replace('/', ' / ');
    };

    return (
        <div className="mb-2">
            {topLlmModels.slice(0, showMoreModels ? topLlmModels.length : 4).map((model, index) => (
                <button
                    key={index}
                    onClick={() => handleModelSelect(model)}
                    className={`text-left px-2 py-1 text-sm rounded-sm border hover:bg-gray-50 ${aiModelName === model.aiModelName ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                        }`}
                >
                    <div>
                        <span className="inline-block text-gray-700 text-sm">
                            {formatModelNameForDisplay(model?.aiModelName || '')}
                        </span>
                    </div>
                </button>
            ))}

            {topLlmModels.length > 4 && (
                <button
                    onClick={() => setShowMoreModels(!showMoreModels)}
                    className="text-sm text-gray-500 hover:text-gray-700 inline-block border border-gray-200 px-2 py-1 rounded"
                >
                    <span className="mr-1">🔍</span>
                    {showMoreModels ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}

const ComponentThreadAdd = () => {
    const navigate = useNavigate();
    const setJotaiChatThreadRefreshRandomNum = useSetAtom(jotaiChatThreadRefreshRandomNum);
    const [formData, setFormData] = useState({
        isPersonalContextEnabled: false,
        isAutoAiContextSelectEnabled: false,
        isMemoryEnabled: false,

        // answer type
        answerEngine: 'conciseAnswer' as 'conciseAnswer' | 'answerMachine',
    });

    const [answerMachineMinNumberOfIterations, setAnswerMachineMinNumberOfIterations] = useState<number>(3);
    const [answerMachineMaxNumberOfIterations, setAnswerMachineMaxNumberOfIterations] = useState<number>(7);

    // Input display states (strings) to allow empty inputs
    const [minIterationsInput, setMinIterationsInput] = useState<string>('3');
    const [maxIterationsInput, setMaxIterationsInput] = useState<string>('7');

    const [aiModelProvider, setAiModelProvider] = useState("openrouter" as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");
    const [aiModelName, setAiModelName] = useState("openrouter/auto");
    const [aiModelOpenAiCompatibleConfigId, setAiModelOpenAiCompatibleConfigId] = useState<string | null>(null);

    // STT (Speech-to-Text)
    const [sttModelName, setSttModelName] = useState('');
    const [sttModelProvider, setSttModelProvider] = useState('');

    // TTS (Text-to-Speech)
    const [ttsModelName, setTtsModelName] = useState('');
    const [ttsModelProvider, setTtsModelProvider] = useState('');

    const [selectRandomModel, setSelectRandomModel] = useState(0);

    const [isAddThreadLoading, setIsAddThreadLoading] = useState(false);

    // Fetch and auto-select last used model on component mount
    useEffect(() => {
        const fetchLastUsedModel = async () => {
            try {
                const response = await axiosCustom.get('/api/chat-llm/threads-crud/lastUsedLlmModel');

                if (response.data.model) {
                    const { aiModelProvider, aiModelName, aiModelOpenAiCompatibleConfigId } = response.data.model;

                    // Set the provider first
                    setAiModelProvider(aiModelProvider as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");

                    // Set the model name
                    setAiModelName(aiModelName);

                    // Set the OpenAI compatible config ID if it exists
                    if (aiModelOpenAiCompatibleConfigId) {
                        setAiModelOpenAiCompatibleConfigId(aiModelOpenAiCompatibleConfigId);
                    }
                }
            } catch (error) {
                console.error('Error fetching last used model:', error);
                // Don't show error to user, just continue with default model
            }
        };

        fetchLastUsedModel();
    }, []);

    const addNewThread = async () => {
        if (answerMachineMinNumberOfIterations > answerMachineMaxNumberOfIterations) {
            toast.error('Minimum iterations cannot be greater than maximum iterations');
            return;
        }

        setIsAddThreadLoading(true);
        try {
            const result = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: formData.isPersonalContextEnabled,
                    isAutoAiContextSelectEnabled: formData.isAutoAiContextSelectEnabled,
                    isMemoryEnabled: formData.isMemoryEnabled,

                    // answer engine
                    answerEngine: formData.answerEngine,

                    // answer machine settings
                    answerMachineMinNumberOfIterations: answerMachineMinNumberOfIterations,
                    answerMachineMaxNumberOfIterations: answerMachineMaxNumberOfIterations,

                    // selected model
                    aiModelProvider: aiModelProvider,
                    aiModelName: aiModelName,
                    aiModelOpenAiCompatibleConfigId: aiModelOpenAiCompatibleConfigId,

                    // STT (Speech-to-Text)
                    sttModelName: sttModelName,
                    sttModelProvider: sttModelProvider,

                    // TTS (Text-to-Speech)
                    ttsModelName: ttsModelName,
                    ttsModelProvider: ttsModelProvider,
                }
            );

            const tempThreadId = result?.data?.thread?._id;
            if (tempThreadId) {
                if (typeof tempThreadId === 'string') {
                    setJotaiChatThreadRefreshRandomNum(Math.floor(Math.random() * 1_000_000));

                    const redirectUrl = `/user/chat?id=${tempThreadId}`;
                    navigate(redirectUrl);
                }
            }

            toast.success('New thread added successfully!');
        } catch (error) {
            alert('Error adding new thread: ' + error);
        } finally {
            setIsAddThreadLoading(false);
        }
    };

    return (
        <div
            className="bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(45,212,191,0.07),transparent_55%),linear-gradient(to_bottom,#f8fafc,#f4f4f5)]"
            style={{
                height: 'calc(-60px + 100vh)',
                overflowY: 'auto',
            }}
        >
            <div className="mx-auto max-w-2xl px-3 py-5 sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/20">
                        <MessageCircle className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                            New chat
                        </h1>
                        <span className="text-sm text-zinc-500">Choose a model, then start</span>
                    </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-zinc-600">
                    Configure the assistant once. You can change models anytime in thread settings.
                </p>

                <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Model
                        </h3>
                        <button
                            type="button"
                            className="text-zinc-400 hover:text-zinc-700"
                            title="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-2">
                        <h3 className="mb-1.5 text-xs font-medium text-zinc-700">Provider</h3>
                        <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
                            {[
                                { label: 'OpenRouter', value: 'openrouter' },
                                { label: 'GROQ', value: 'groq' },
                                { label: 'Ollama', value: 'ollama' },
                                { label: 'LocalAI', value: 'localai' },
                                { label: 'OpenAI Compatible', value: 'openai-compatible' }
                            ].map((provider) => (
                                <button
                                    key={provider.value}
                                    onClick={() => {
                                        setAiModelProvider(provider.value as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");
                                        setAiModelName('');
                                        setAiModelOpenAiCompatibleConfigId(null);
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-all sm:min-w-[5.5rem] ${
                                        aiModelProvider === provider.value
                                            ? 'border-teal-500/30 bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/15'
                                            : 'border-zinc-200/90 bg-zinc-50/80 text-zinc-800 hover:border-zinc-300 hover:bg-white'
                                    }`}
                                    aria-pressed={aiModelProvider === provider.value}
                                >
                                    {provider.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* field -> select model -> openrouter */}
                    {aiModelProvider === 'openrouter' && (
                        <SelectAiModelOpenrouter
                            aiModelName={aiModelName}
                            setAiModelName={setAiModelName}
                            selectRandomModel={selectRandomModel}
                            key={'select-model-openrouter'}
                        />
                    )}

                    {/* field -> select model -> groq */}
                    {aiModelProvider === 'groq' && (
                        <SelectAiModelGroq
                            aiModelName={aiModelName}
                            setAiModelName={setAiModelName}
                            selectRandomModel={selectRandomModel}
                            key={'select-model-groq'}
                        />
                    )}

                    {/* field -> select model -> ollama */}
                    {aiModelProvider === 'ollama' && (
                        <div>
                            <SelectAiModelOllama
                                aiModelName={aiModelName}
                                setAiModelName={setAiModelName}
                                key={'select-model-ollama'}
                            />

                            <div className="text-sm text-gray-500 mt-2">
                                Manage your Ollama models in the{' '}
                                <Link
                                    to="/user/setting/ollama-models"
                                    className="text-blue-500 hover:text-blue-700"
                                >Ollama Settings</Link>.
                            </div>
                        </div>
                    )}

                    {/* field -> select model -> localai */}
                    {aiModelProvider === 'localai' && (
                        <div>
                            <SelectAiModelLocalai
                                aiModelName={aiModelName}
                                setAiModelName={setAiModelName}
                                key={'select-model-localai'}
                            />

                            <div className="text-sm text-gray-500 mt-2">
                                Manage your LocalAI models in the{' '}
                                <Link
                                    to="/user/setting/localai-models"
                                    className="text-blue-500 hover:text-blue-700"
                                >LocalAI Settings</Link>.
                            </div>
                        </div>
                    )}

                    {/* field -> select model -> openai-compatible */}
                    {aiModelProvider === 'openai-compatible' && (
                        <div>
                            <SelectAiModelOpenaiCompatible
                                aiModelName={aiModelName}
                                setAiModelName={setAiModelName}
                                aiModelOpenAiCompatibleConfigId={aiModelOpenAiCompatibleConfigId}
                                setAiModelOpenAiCompatibleConfigId={setAiModelOpenAiCompatibleConfigId}
                                key={'select-model-openai-compatible'}
                            />

                            <div className="text-sm text-gray-500 mt-2">
                                Manage your OpenAI compatible model configurations in the{' '}
                                <Link
                                    to="/user/setting/openai-compatible-model"
                                    className="text-blue-500 hover:text-blue-700"
                                >OpenAI Compatible Model Settings</Link>.
                            </div>
                        </div>
                    )}

                    {/* field -> select model -> llm */}
                    <LastUsedLlmModel
                        aiModelName={aiModelName}
                        setAiModelProvider={setAiModelProvider}
                        setAiModelName={setAiModelName}
                        key={'select-model-last-used-llm'}
                    />

                    {/* field -> sttModelProvider */}
                    <SelectSttModel
                        sttModelProvider={sttModelProvider}
                        setSttModelProvider={setSttModelProvider}
                        sttModelName={sttModelName}
                        setSttModelName={setSttModelName}
                    />

                    {/* field -> ttsModelProvider */}
                    <SelectTtsModel
                        ttsModelProvider={ttsModelProvider}
                        setTtsModelProvider={setTtsModelProvider}
                        ttsModelName={ttsModelName}
                        setTtsModelName={setTtsModelName}
                    />

                    {/* field -> buttons */}
                    <div className="mt-2">
                        <Link to="/user/setting" className="text-sm text-gray-500 hover:text-gray-700 inline-block mr-5">
                            <ExternalLink className="w-4 h-4 mr-1 inline-block" />
                            Model page
                        </Link>

                        <button
                            onClick={() => {
                                setSelectRandomModel(selectRandomModel + 1);
                            }}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-700 inline-block"
                        >
                            <span className="mr-1">🎲</span>
                            Random LLM
                        </button>
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                        <div className="flex-1">
                            <div className="text-sm text-gray-700 mb-2">Answer Engine</div>
                            <div className="flex flex-row space-x-6">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-500"
                                        name="answerEngine"
                                        value="conciseAnswer"
                                        checked={formData.answerEngine === "conciseAnswer"}
                                        onChange={() => setFormData({ ...formData, answerEngine: "conciseAnswer" })}
                                    />
                                    <Tooltip
                                        placement="top"
                                        trigger={['hover', 'click']}
                                        overlay={<span
                                            className="text-black bg-white rounded-md p-2 inline-block"
                                        >
                                            Concise answer is a shorter and more direct response.
                                        </span>}
                                    >
                                        <span className="ml-2 text-sm text-gray-700 inline-block">
                                            Concise
                                            <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                                style={{
                                                    position: 'relative',
                                                    top: '-0.5px',
                                                    left: '1px',
                                                }}
                                            />
                                        </span>
                                    </Tooltip>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-500"
                                        name="answerEngine"
                                        value="answerMachine"
                                        checked={formData.answerEngine === "answerMachine"}
                                        onChange={() => setFormData({ ...formData, answerEngine: "answerMachine" })}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                                        <Tooltip
                                            placement="top"
                                            trigger={['hover', 'click']}
                                            overlay={<span
                                                className="text-black bg-white rounded-md p-2 inline-block"
                                            >
                                                Generates a better answer using more information.
                                            </span>}
                                        >
                                            <span className="inline-block">
                                                Answer Machine
                                                <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                                    style={{
                                                        position: 'relative',
                                                        top: '-0.5px',
                                                        left: '1px',
                                                    }}
                                                />
                                            </span>
                                        </Tooltip>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Answer Machine Iterations Setting */}
                    {formData.answerEngine === "answerMachine" && (
                        <div className="mt-3 space-y-3">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 lg:mb-2">
                                    Min Iterations
                                    <Tooltip
                                        placement="top"
                                        trigger={['hover', 'click']}
                                        overlay={<span
                                            className="text-black bg-white rounded-md p-2 inline-block max-w-xs"
                                        >
                                            Minimum number of iterations the Answer Machine will perform. The answer machine will always run at least this many iterations, even if the answer is satisfactory earlier.
                                        </span>}
                                    >
                                        <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                            style={{
                                                position: 'relative',
                                                top: '-0.5px',
                                                left: '1px',
                                            }}
                                        />
                                    </Tooltip>
                                </label>
                                <input
                                    value={minIterationsInput}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        setMinIterationsInput(inputValue);

                                        // Only update the numeric state if input is not empty
                                        if (inputValue !== '') {
                                            const parsedValue = parseInt(inputValue);
                                            if (!isNaN(parsedValue)) {
                                                const newMin = Math.max(1, Math.min(100, parsedValue));
                                                setAnswerMachineMinNumberOfIterations(newMin);
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        // When input loses focus, ensure it has a valid value
                                        if (minIterationsInput === '') {
                                            setMinIterationsInput('1');
                                            setAnswerMachineMinNumberOfIterations(1);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Minimum number of iterations (1-100). Default is 1. Must be ≤ Max Iterations.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 lg:mb-2">
                                    Max Iterations
                                    <Tooltip
                                        placement="top"
                                        trigger={['hover', 'click']}
                                        overlay={<span
                                            className="text-black bg-white rounded-md p-2 inline-block max-w-xs"
                                        >
                                            Maximum number of times the Answer Machine will iterate to improve the answer. Higher values may produce better answers but take longer and use more tokens. Must be ≥ Min Iterations.
                                        </span>}
                                    >
                                        <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                            style={{
                                                position: 'relative',
                                                top: '-0.5px',
                                                left: '1px',
                                            }}
                                        />
                                    </Tooltip>
                                </label>
                                <input
                                    value={maxIterationsInput}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        setMaxIterationsInput(inputValue);

                                        // Only update the numeric state if input is not empty
                                        if (inputValue !== '') {
                                            const parsedValue = parseInt(inputValue);
                                            if (!isNaN(parsedValue)) {
                                                const newMax = Math.max(1, Math.min(100, parsedValue));
                                                setAnswerMachineMaxNumberOfIterations(newMax);
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        // When input loses focus, ensure it has a valid value
                                        if (maxIterationsInput === '') {
                                            setMaxIterationsInput('1');
                                            setAnswerMachineMaxNumberOfIterations(1);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Maximum number of iterations (1-100). Default is 1. Must be ≥ Min Iterations.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                        {/* field -> isPersonalContextEnabled */}
                        <div className="flex-1">
                            <div
                                onClick={() => {
                                    const newIsPersonalContextEnabled = !formData.isPersonalContextEnabled;
                                    setFormData({
                                        ...formData,
                                        isPersonalContextEnabled: newIsPersonalContextEnabled,
                                        // Disable memory when personal context is disabled
                                        isMemoryEnabled: newIsPersonalContextEnabled ? formData.isMemoryEnabled : false
                                    });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="rounded-sm mr-2"
                                    checked={formData.isPersonalContextEnabled}
                                />
                                <span className="text-sm text-gray-700 cursor-pointer">Personal Context Enable</span>
                            </div>
                        </div>

                        {/* field -> isAutoAiContextSelectEnabled */}
                        {formData.isPersonalContextEnabled && (
                            <div className="flex-1">
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, isAutoAiContextSelectEnabled: !formData.isAutoAiContextSelectEnabled });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded-sm mr-2"
                                        checked={formData.isAutoAiContextSelectEnabled}
                                    />
                                    <span className="text-sm text-gray-700 cursor-pointer">Auto AI Context Enable</span>
                                </div>
                            </div>
                        )}

                        {/* field -> isMemoryEnabled */}
                        {formData.isPersonalContextEnabled && (
                            <div className="flex-1">
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, isMemoryEnabled: !formData.isMemoryEnabled });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded-sm mr-2"
                                        checked={formData.isMemoryEnabled}
                                    />
                                    <span className="text-sm text-gray-700 cursor-pointer">Memory Enable</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <button
                        type="button"
                        onClick={addNewThread}
                        disabled={isAddThreadLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all hover:from-teal-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isAddThreadLoading ? (
                            <span className="text-xs">Starting…</span>
                        ) : (
                            <>
                                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                                Start chat
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ComponentThreadAdd;