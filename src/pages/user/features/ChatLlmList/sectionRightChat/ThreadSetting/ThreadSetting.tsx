import { LucideLoader, LucideSave, LucideSettings, LucideX } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import { AxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { tsSchemaAiModelListGroq } from "../../../../../../types/pages/settings/dataModelGroq";
import { tsSchemaAiModelListOpenrouter } from "../../../../../../types/pages/settings/dataModelOpenrouter";
import ThreadSettingContextSearch from "./ThreadSettingContextSearch";
import { Link } from "react-router-dom";

const SelectAiModelOpenrouter = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
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

    return (
        <div className="mb-1 lg:mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">Model</h3>
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
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [modelArr, setModelArr] = useState([] as tsSchemaAiModelListGroq[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoadingModel(true);
            const response = await axiosCustom.get('/api/dynamic-data/model-groq/modelGroqGet');
            setModelArr(response.data.docs);
            setIsLoadingModel(false);
        }
        fetchModelData();
    }, []);

    return (
        <div className="mb-1 lg:mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">Model</h3>
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
    const [modelArr, setModelArr] = useState([] as any[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            try {
                setIsLoadingModel(true);
                const response = await axiosCustom.get('/api/dynamic-data/model-ollama/modelOllamaGet');

                if (response.data.docs && response.data.docs.length > 0) {
                    setModelArr(response.data.docs);
                }
            } catch (error) {
                console.error('Error fetching ollama model data:', error);
                // Keep default model if API fails
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchModelData();
    }, []);

    return (
        <div className="mb-1 lg:mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">Model</h3>
            <Select<{ value: string; label: string }>
                value={aiModelName ? { value: aiModelName, label: modelArr.find(model => model.modelName === aiModelName)?.modelLabel || "" } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={
                    modelArr.map((model: any) => ({
                        value: model.modelName,
                        label: model.modelLabel
                    }))
                }

                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
            />
        </div>
    )
}

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
            } catch (error) {
                console.error('Error fetching OpenAI compatible models:', error);
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchConfigs();
    }, []);

    return (
        <div className="mb-1 lg:mb-2">
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
}

const ThreadSetting = ({
    closeModal,
    threadSetting,
    doesThreadExist,
}: {
    closeModal: () => void;
    threadSetting: any;
    doesThreadExist: boolean;
}) => {

    const [formData, setFormData] = useState({
        threadTitle: threadSetting.threadTitle,
        isAutoAiContextSelectEnabled: threadSetting.isAutoAiContextSelectEnabled,
        isPersonalContextEnabled: threadSetting.isPersonalContextEnabled,
        systemPrompt: threadSetting.systemPrompt,
    });

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const [aiModelProvider, setAiModelProvider] = useState(threadSetting.aiModelProvider || "openrouter" as "openrouter" | "groq" | "ollama" | "openai-compatible");
    const [aiModelName, setAiModelName] = useState(threadSetting.aiModelName || "openrouter/auto");
    const [aiModelOpenAiCompatibleConfigId, setAiModelOpenAiCompatibleConfigId] = useState<string | null>(
        threadSetting.aiModelOpenAiCompatibleConfigId || null
    );
    const [temperature, setTemperature] = useState<number>(threadSetting.chatLlmTemperature || 1);
    const [maxTokens, setMaxTokens] = useState<number>(threadSetting.chatLlmMaxTokens || 4096);
    const [chatMemoryLimit, setChatMemoryLimit] = useState<number>(threadSetting.chatMemoryLimit || 0);

    const editRecord = async () => {
        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const config = {
                method: 'post',
                url: `/api/chat-llm/threads-crud/threadsEditById`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    threadId: threadSetting._id,

                    // selected model
                    aiModelProvider: aiModelProvider,
                    aiModelName: aiModelName,
                    aiModelOpenAiCompatibleConfigId: aiModelOpenAiCompatibleConfigId,

                    // model parameters
                    chatLlmTemperature: temperature,
                    chatLlmMaxTokens: maxTokens,
                    chatMemoryLimit: chatMemoryLimit,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);

            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Chat thread updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the chat thread. Please try again later.')
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the life event. Please try again later.',
            });
        }
    }

    const renderMain = () => {
        return (
            <div className="p-1 lg:p-2">
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                        {/* Thread Setting */}
                        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm flex items-center justify-center">
                                    <LucideSettings className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Chat Settings
                                </h1>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-sm hover:bg-gray-100 transition-colors duration-200 group"
                                aria-label="Close settings"
                            >
                                <LucideX className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                            </button>
                        </div>

                        {/* line */}
                        <div className="h-px bg-gray-200 my-1 lg:my-2"></div>

                        {/* field -> threadTitle */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-gray-700">Title *</label>
                            <input
                                type="text"
                                value={formData.threadTitle}
                                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                onChange={(e) => setFormData({ ...formData, threadTitle: e.target.value })}
                            />
                        </div>

                        {/* field -> systemPrompt */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-gray-700">System Prompt</label>
                            <textarea
                                value={formData.systemPrompt}
                                className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                rows={3}
                            />
                            {formData.systemPrompt.length > 0 && (
                                <button
                                    type="button"
                                    className="mt-1 lg:mt-2 px-2 lg:px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-sm transition-colors duration-200"
                                    onClick={() => setFormData({ ...formData, systemPrompt: '' })}
                                >
                                    Clear System Prompt
                                    <LucideX className="w-4 h-4 ml-2 inline-block" />
                                </button>
                            )}
                        </div>

                        {/* field -> aiModelProvider */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">AI Model Provider</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                {[
                                    { label: 'OpenRouter', value: 'openrouter' },
                                    { label: 'GROQ', value: 'groq' },
                                    { label: 'Ollama', value: 'ollama' },
                                    { label: 'OpenAI Compatible', value: 'openai-compatible' }
                                ].map((provider) => (
                                    <button
                                        key={provider.value}
                                        onClick={() => {
                                            setAiModelProvider(provider.value as "openrouter" | "groq" | "ollama" | "openai-compatible");
                                            if (provider.value !== 'openai-compatible') {
                                                setAiModelOpenAiCompatibleConfigId(null);
                                            }
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
                            />
                        )}

                        {/* field -> select model -> groq */}
                        {aiModelProvider === 'groq' && (
                            <SelectAiModelGroq
                                aiModelName={aiModelName}
                                setAiModelName={setAiModelName}
                            />
                        )}

                        {/* field -> select model -> ollama */}
                        {aiModelProvider === 'ollama' && (
                            <SelectAiModelOllama
                                aiModelName={aiModelName}
                                setAiModelName={setAiModelName}
                            />
                        )}

                        {/* field -> select model -> openai-compatible */}
                        {aiModelProvider === 'openai-compatible' && (
                            <SelectAiModelOpenaiCompatible
                                aiModelName={aiModelName}
                                setAiModelName={setAiModelName}
                                aiModelOpenAiCompatibleConfigId={aiModelOpenAiCompatibleConfigId}
                                setAiModelOpenAiCompatibleConfigId={setAiModelOpenAiCompatibleConfigId}
                            />
                        )}

                        {/* field -> model parameters */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3 mb-2 lg:mb-3">
                            {/* field -> chatMemoryLimit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Memory Limit</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={chatMemoryLimit}
                                    onChange={(e) => setChatMemoryLimit(parseInt(e.target.value) || 0)}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Maximum number of previous messages to include in context (0 = unlimited).</p>
                            </div>

                            {/* field -> chatLlmMaxTokens */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Max Tokens</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Maximum number of tokens in the response.</p>
                            </div>

                            {/* field -> chatLlmTemperature */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Temperature</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 1)}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Controls randomness (0-2). Lower values make output more deterministic.</p>
                            </div>
                        </div>

                        {/* field -> isPersonalContextEnabled */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Personal Context</label>
                            <div
                                onClick={() => {
                                    setFormData({ ...formData, isPersonalContextEnabled: !formData.isPersonalContextEnabled });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded-sm p-1 lg:p-2 mr-2"
                                    checked={formData.isPersonalContextEnabled}
                                />
                                <span className="text-sm text-gray-700 cursor-pointer">Personal Context Enable</span>
                            </div>
                        </div>

                        {/* field -> isAutoAiContextSelectEnabled */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Auto AI Context</label>
                            <div
                                onClick={() => {
                                    setFormData({ ...formData, isAutoAiContextSelectEnabled: !formData.isAutoAiContextSelectEnabled });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded-sm p-1 lg:p-2 mr-2"
                                    checked={formData.isAutoAiContextSelectEnabled}
                                />
                                <span className="text-sm text-gray-700 cursor-pointer">Auto AI Context Enable</span>
                            </div>
                        </div>

                        {/* field -> context search */}
                        {formData.isPersonalContextEnabled && (
                            <ThreadSettingContextSearch
                                threadId={threadSetting._id}
                            />
                        )}

                    </div>
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2 lg:p-3 mt-2 lg:mt-3">
                        <div className="flex justify-between items-center gap-1"
                            style={{
                                width: '100%',
                                maxWidth: '200px',
                                margin: '0 auto',
                            }}
                        >
                            {/* button -> close */}
                            <button
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded-sm transition-colors duration-200 w-full"
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                <LucideX
                                    className="w-4 h-4 inline-block"
                                    style={{
                                        marginTop: '-3px',
                                    }}
                                />
                            </button>
                            {/* button -> save */}
                            <Fragment>
                                {requestEdit.loading && (
                                    <button
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded-sm transition-colors duration-200 w-full"
                                    >
                                        <LucideLoader className="w-4 h-4 inline-block"
                                            style={{
                                                marginTop: '-3px',
                                            }}
                                        />
                                    </button>
                                )}
                                {!requestEdit.loading && (
                                    <button
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded-sm transition-colors duration-200 w-full"
                                        onClick={() => {
                                            editRecord();
                                        }}
                                    >
                                        <LucideSave
                                            className="w-4 h-4 inline-block"
                                            style={{
                                                marginTop: '-3px',
                                            }}
                                        />
                                    </button>
                                )}
                            </Fragment>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-sm p-1 lg:p-2 h-full"
            style={{
                overflowY: 'auto',
            }}
        >
            {doesThreadExist ? (
                <div>
                    {renderMain()}
                </div>
            ) : (
                <div>
                    <p>Chat Thread does not exist</p>
                </div>
            )}
        </div>
    )
}

export default ThreadSetting;