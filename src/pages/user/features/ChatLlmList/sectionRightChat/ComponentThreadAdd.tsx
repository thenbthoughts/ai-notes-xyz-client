import { Link, useNavigate } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { MessageCircle, Settings, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { tsSchemaAiModelListGroq } from "../../../../../types/pages/settings/dataModelGroq";
import { tsSchemaAiModelListOpenrouter } from "../../../../../types/pages/settings/dataModelOpenrouter";
import { jotaiChatThreadRefreshRandomNum } from "../jotai/jotaiChatLlmThreadSetting";
import { useSetAtom } from "jotai";


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

const LastUsedLlmModel = ({
    aiModelName,
    setAiModelName,
    setAiModelProvider,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    setAiModelProvider: React.Dispatch<React.SetStateAction<"openrouter" | "groq" | "ollama">>;
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
        if (model.aiModelProvider === 'openrouter' || model.aiModelProvider === 'groq' || model.aiModelProvider === 'ollama') {
            setAiModelProvider(model.aiModelProvider as "openrouter" | "groq" | "ollama");
        }
        setAiModelName(model.aiModelName);
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
                            {model?.aiModelName?.replace('/', ' / ').replace('/', ' / ') || ''}
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
    });

    const [aiModelProvider, setAiModelProvider] = useState("openrouter" as "openrouter" | "groq" | "ollama");
    const [aiModelName, setAiModelName] = useState("openrouter/auto");

    const [selectRandomModel, setSelectRandomModel] = useState(0);

    const [isAddThreadLoading, setIsAddThreadLoading] = useState(false);

    const addNewThread = async () => {
        setIsAddThreadLoading(true);
        try {
            const result = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: formData.isPersonalContextEnabled,
                    isAutoAiContextSelectEnabled: formData.isAutoAiContextSelectEnabled,

                    // selected model
                    aiModelProvider: aiModelProvider,
                    aiModelName: aiModelName,
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
            style={{
                height: 'calc(-60px + 100vh)',
                overflowY: 'auto',
            }}
        >
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center mr-3">
                        <MessageCircle
                            className="w-5 h-5 text-gray-600"
                            style={{
                                position: 'relative',
                                top: '-0.5px',
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
                <div className="bg-gray-50 rounded-sm p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Current Model</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* field -> modelProvider */}
                    <div className="mb-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Provider</h3>
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                            {[
                                { label: 'OpenRouter', value: 'openrouter' },
                                { label: 'GROQ', value: 'groq' },
                                { label: 'Ollama', value: 'ollama' }
                            ].map((provider) => (
                                <button
                                    key={provider.value}
                                    onClick={() => {
                                        setAiModelProvider(provider.value as "openrouter" | "groq" | "ollama");
                                        setAiModelName('');
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `flex-1 px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${aiModelProvider === provider.value
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                        }
                                        font-semibold`
                                    }
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
                                Manage your Ollama models in the
                                <Link
                                    to="/user/setting/ollama-models"
                                    className="text-blue-500 hover:text-blue-700"
                                >Ollama Settings</Link>.
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
                                    className="rounded-sm mr-2"
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
                                    className="rounded-sm mr-2"
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
                        disabled={isAddThreadLoading}
                        className="w-full p-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-500 rounded-xl shadow-lg hover:shadow-blue-500/30 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                    >
                        <div className="inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-center justify-center space-x-2 z-10">
                            <div className="w-6 h-6 bg-white/20 rounded-sm flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                                <MessageCircle className="w-4 h-4 text-white drop-shadow-sm" />
                            </div>
                            <span className="text-base font-semibold tracking-wide">Start New Chat</span>
                            <div className="w-2 h-2 bg-blue-300 rounded-sm animate-pulse"></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ComponentThreadAdd;