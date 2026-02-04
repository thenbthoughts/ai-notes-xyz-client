import { useState, useEffect } from "react";
import axiosCustom from "../../../../config/axiosCustom";
import SettingHeader from "../SettingHeader";
import { AiModelProvider } from "../../../../types/pages/settings/aiFeaturesSettings.types";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import Select from "react-select";
import { tsSchemaAiModelListGroq } from "../../../../types/pages/settings/dataModelGroq";
import { tsSchemaAiModelListOpenrouter } from "../../../../types/pages/settings/dataModelOpenrouter";
import { useAtomValue } from "jotai";
import stateJotaiAuth from "../../../../jotai/stateJotaiAuth";

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

const SettingAiFeatures = () => {
    const authState = useAtomValue(stateJotaiAuth);

    // AI Features state
    const [featureAiActionsEnabled, setFeatureAiActionsEnabled] = useState<boolean>(false);
    const [featureAiActionsChatThread, setFeatureAiActionsChatThread] = useState<boolean>(false);
    const [featureAiActionsChatMessage, setFeatureAiActionsChatMessage] = useState<boolean>(false);
    const [featureAiActionsNotes, setFeatureAiActionsNotes] = useState<boolean>(false);
    const [featureAiActionsTask, setFeatureAiActionsTask] = useState<boolean>(false);
    const [featureAiActionsLifeEvents, setFeatureAiActionsLifeEvents] = useState<boolean>(false);
    const [featureAiActionsInfoVault, setFeatureAiActionsInfoVault] = useState<boolean>(false);

    // UI state
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Current model display state
    const [currentModelProvider, setCurrentModelProvider] = useState<AiModelProvider>('groq');
    const [currentModelName, setCurrentModelName] = useState<string>('');
    const [currentModelOpenAiCompatibleConfigId, setCurrentModelOpenAiCompatibleConfigId] = useState<string | null>(null);
    const [selectRandomModel, setSelectRandomModel] = useState<number>(0);

    // Check if OpenAI Compatible has any configurations
    const [openaiCompatibleConfigs, setOpenaiCompatibleConfigs] = useState<any[]>([]);

    useEffect(() => {
        fetchUser();
        fetchOpenaiCompatibleConfigs();
    }, []);

    const fetchOpenaiCompatibleConfigs = async () => {
        try {
            const response = await axiosCustom.post<{ docs: any[] }>(
                `/api/user/openai-compatible-model/crud/openaiCompatibleModelGet`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setOpenaiCompatibleConfigs(response.data.docs || []);
        } catch (error) {
            console.error('Error fetching OpenAI compatible configs:', error);
        }
    };

    // Auto-switch to valid provider if current one becomes invalid
    useEffect(() => {
        const isCurrentProviderValid = () => {
            switch (currentModelProvider) {
                case 'openrouter':
                    return authState.apiKeyOpenrouterValid;
                case 'groq':
                    return authState.apiKeyGroqValid;
                case 'ollama':
                    return authState.apiKeyOllamaValid;
                case 'openai-compatible':
                    return openaiCompatibleConfigs.length > 0;
                default:
                    return false;
            }
        };

        if (!isCurrentProviderValid()) {
            // Find first valid provider
            const validProviders = [
                authState.apiKeyOpenrouterValid && 'openrouter',
                authState.apiKeyGroqValid && 'groq',
                authState.apiKeyOllamaValid && 'ollama',
                openaiCompatibleConfigs.length > 0 && 'openai-compatible'
            ].filter(Boolean);

            if (validProviders.length > 0) {
                setCurrentModelProvider(validProviders[0] as AiModelProvider);
                setCurrentModelName('');
                setCurrentModelOpenAiCompatibleConfigId(null);
            }
        }
    }, [authState, openaiCompatibleConfigs, currentModelProvider]);

    const fetchUser = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/crud/getUser`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            // Set AI features from response, with defaults if not present
            setFeatureAiActionsEnabled(response.data.featureAiActionsEnabled ?? false);
            setCurrentModelProvider(response.data.featureAiActionsModelProvider ?? 'groq');
            setCurrentModelName(response.data.featureAiActionsModelName ?? '');
            setFeatureAiActionsChatThread(response.data.featureAiActionsChatThread ?? false);
            setFeatureAiActionsChatMessage(response.data.featureAiActionsChatMessage ?? false);
            setFeatureAiActionsNotes(response.data.featureAiActionsNotes ?? false);
            setFeatureAiActionsTask(response.data.featureAiActionsTask ?? false);
            setFeatureAiActionsLifeEvents(response.data.featureAiActionsLifeEvents ?? false);
            setFeatureAiActionsInfoVault(response.data.featureAiActionsInfoVault ?? false);
        } catch (error) {
            console.error("Error fetching user:", error);
            setError("Error fetching user. Please try again.");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        const updateData = {
            featureAiActionsEnabled,
            featureAiActionsModelProvider: currentModelProvider || '',
            featureAiActionsModelName: currentModelName || '',
            featureAiActionsChatThread,
            featureAiActionsChatMessage,
            featureAiActionsNotes,
            featureAiActionsTask,
            featureAiActionsLifeEvents,
            featureAiActionsInfoVault,
        };

        try {
            const response = await axiosCustom.post(
                `/api/user/crud/updateUser`,
                updateData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setSuccessMessage("AI Features settings updated successfully!");
            console.log("AI Features updated:", response.data);
        } catch (error) {
            console.error("Error updating AI Features:", error);
            setError("Error updating AI Features. Please try again.");
        }
    };


    const renderAiFeaturesSettings = () => {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 py-2">AI Features Settings</h2>

                {/* Main AI Features Toggle */}
                <div className="mb-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="featureAiActionsEnabled"
                            checked={featureAiActionsEnabled}
                            onChange={(e) => {
                                const isEnabled = e.target.checked;
                                setFeatureAiActionsEnabled(isEnabled);
                                // When enabling AI Features, also enable all feature-specific AI actions by default
                                if (isEnabled) {
                                    setFeatureAiActionsChatThread(true);
                                    setFeatureAiActionsChatMessage(true);
                                    setFeatureAiActionsNotes(true);
                                    setFeatureAiActionsTask(true);
                                    setFeatureAiActionsLifeEvents(true);
                                    setFeatureAiActionsInfoVault(true);
                                }
                            }}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featureAiActionsEnabled" className="text-gray-700 font-bold text-lg">
                            Enable AI Features
                        </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Turn on AI-powered features across the application. When disabled, all AI actions will be unavailable.
                    </p>
                </div>

                {/* Current Model Section - Only show when AI features are enabled */}
                {featureAiActionsEnabled && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Current Model</h3>
                    </div>

                    {/* field -> modelProvider */}
                    <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Provider</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {/* OpenRouter */}
                            {authState.apiKeyOpenrouterValid ? (
                                <button
                                    onClick={() => {
                                        setCurrentModelProvider('openrouter');
                                        setCurrentModelName('');
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${currentModelProvider === 'openrouter'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                        }
                                        font-semibold`
                                    }
                                    aria-pressed={currentModelProvider === 'openrouter'}
                                >
                                    OpenRouter
                                </button>
                            ) : (
                                <Link
                                    to="/user/setting/api-key"
                                    className="px-3 py-2 text-sm rounded-sm border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors text-center font-semibold"
                                >
                                    Add OpenRouter API Key
                                </Link>
                            )}

                            {/* GROQ */}
                            {authState.apiKeyGroqValid ? (
                                <button
                                    onClick={() => {
                                        setCurrentModelProvider('groq');
                                        setCurrentModelName('');
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${currentModelProvider === 'groq'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                        }
                                        font-semibold`
                                    }
                                    aria-pressed={currentModelProvider === 'groq'}
                                >
                                    GROQ
                                </button>
                            ) : (
                                <Link
                                    to="/user/setting/api-key"
                                    className="px-3 py-2 text-sm rounded-sm border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors text-center font-semibold"
                                >
                                    Add GROQ API Key
                                </Link>
                            )}

                            {/* Ollama */}
                            {authState.apiKeyOllamaValid ? (
                                <button
                                    onClick={() => {
                                        setCurrentModelProvider('ollama');
                                        setCurrentModelName('');
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${currentModelProvider === 'ollama'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                        }
                                        font-semibold`
                                    }
                                    aria-pressed={currentModelProvider === 'ollama'}
                                >
                                    Ollama
                                </button>
                            ) : (
                                <Link
                                    to="/user/setting/ollama-models"
                                    className="px-3 py-2 text-sm rounded-sm border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors text-center font-semibold"
                                >
                                    Setup Ollama
                                </Link>
                            )}

                            {/* OpenAI Compatible */}
                            {openaiCompatibleConfigs.length > 0 ? (
                                <button
                                    onClick={() => {
                                        setCurrentModelProvider('openai-compatible');
                                        setCurrentModelName('');
                                        setCurrentModelOpenAiCompatibleConfigId(null);
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${currentModelProvider === 'openai-compatible'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                        }
                                        font-semibold`
                                    }
                                    aria-pressed={currentModelProvider === 'openai-compatible'}
                                >
                                    OpenAI Compatible
                                </button>
                            ) : (
                                <Link
                                    to="/user/setting/openai-compatible-model"
                                    className="px-3 py-2 text-sm rounded-sm border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors text-center font-semibold"
                                >
                                    Setup OpenAI Compatible
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* field -> select model */}
                    {currentModelProvider && (
                        <div className="mb-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                {currentModelProvider.toUpperCase()} Model
                            </h3>

                            {currentModelProvider === 'openrouter' && (
                                <SelectAiModelOpenrouter
                                    aiModelName={currentModelName}
                                    setAiModelName={setCurrentModelName}
                                    selectRandomModel={selectRandomModel}
                                    key={'select-model-openrouter'}
                                />
                            )}

                            {currentModelProvider === 'groq' && (
                                <SelectAiModelGroq
                                    aiModelName={currentModelName}
                                    setAiModelName={setCurrentModelName}
                                    selectRandomModel={selectRandomModel}
                                    key={'select-model-groq'}
                                />
                            )}

                            {currentModelProvider === 'ollama' && (
                                <div>
                                    <SelectAiModelOllama
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
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

                            {currentModelProvider === 'openai-compatible' && (
                                <div>
                                    <SelectAiModelOpenaiCompatible
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
                                        aiModelOpenAiCompatibleConfigId={currentModelOpenAiCompatibleConfigId}
                                        setAiModelOpenAiCompatibleConfigId={setCurrentModelOpenAiCompatibleConfigId}
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
                        </div>
                    )}

                    {/* field -> buttons */}
                    <div className="mt-3 flex items-center justify-between">
                        <Link to="/user/setting" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Model page
                        </Link>

                        <button
                            onClick={() => {
                                setSelectRandomModel(selectRandomModel + 1);
                            }}
                            className="text-sm text-blue-500 hover:text-blue-700 inline-flex items-center"
                        >
                            <span className="mr-1">🎲</span>
                            Random LLM
                        </button>
                    </div>
                </div>
                )}


                {/* Feature-Specific Toggles - Only show when AI features are enabled */}
                {featureAiActionsEnabled && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Feature-Specific AI Actions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Enable or disable AI assistance for specific features. These settings only take effect when AI Features are enabled above.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsChatThread"
                                checked={featureAiActionsChatThread}
                                onChange={(e) => setFeatureAiActionsChatThread(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsChatThread" className="text-gray-700 font-medium">
                                Chat Thread AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsChatMessage"
                                checked={featureAiActionsChatMessage}
                                onChange={(e) => setFeatureAiActionsChatMessage(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsChatMessage" className="text-gray-700 font-medium">
                                Chat Message AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsNotes"
                                checked={featureAiActionsNotes}
                                onChange={(e) => setFeatureAiActionsNotes(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsNotes" className="text-gray-700 font-medium">
                                Notes AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsTask"
                                checked={featureAiActionsTask}
                                onChange={(e) => setFeatureAiActionsTask(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsTask" className="text-gray-700 font-medium">
                                Task AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsLifeEvents"
                                checked={featureAiActionsLifeEvents}
                                onChange={(e) => setFeatureAiActionsLifeEvents(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsLifeEvents" className="text-gray-700 font-medium">
                                Life Events AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsInfoVault"
                                checked={featureAiActionsInfoVault}
                                onChange={(e) => setFeatureAiActionsInfoVault(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsInfoVault" className="text-gray-700 font-medium">
                                Info Vault AI
                            </label>
                        </div>
                    </div>
                </div>
                )}

                {/* Show message when AI features are disabled */}
                {!featureAiActionsEnabled && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    AI Features Disabled
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        Enable AI Features above to configure model settings and feature-specific AI actions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="p-4"
            style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}
        >
            <SettingHeader />

            <form onSubmit={handleSubmit}>
                {renderAiFeaturesSettings()}

                {error && <p className="text-red-500 text-sm py-3">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm py-3">{successMessage}</p>}

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline mt-4"
                >
                    Update AI Features Settings
                </button>
            </form>
        </div>
    );
};

export default SettingAiFeatures;