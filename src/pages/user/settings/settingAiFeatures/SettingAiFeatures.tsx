import { useState, useEffect } from "react";
import axiosCustom from "../../../../config/axiosCustom";
import { AiModelProvider } from "../../../../types/pages/settings/aiFeaturesSettings.types";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import Select from "react-select";
import { reactSelectDarkStyles } from "../../features/ChatLlmList/component/selectModel/reactSelectPortalProps";
import { tsSchemaAiModelListGroq } from "../../../../types/pages/settings/dataModelGroq";
import { tsSchemaAiModelListOpenrouter } from "../../../../types/pages/settings/dataModelOpenrouter";
import { useAtomValue } from "jotai";
import stateJotaiAuth from "../../../../jotai/stateJotaiAuth";
import { formatContextLength, formatMaxCompletionTokens, matchBreakWordRegex } from "../../../../utils/modelSearchUtils";

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

                    let tempModelArr = response.data.docs as tsSchemaAiModelListOpenrouter[];

                    tempModelArr = tempModelArr.map((model) => ({
                        ...model,
                        name: model.name || model.id,
                        description: model.description || '',
                        contextLength: model.contextLength || 0,
                        maxCompletionTokens: model.maxCompletionTokens || 0,
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

    const options = modelArr.map((model) => {
        const ctxFormatted = formatContextLength(model.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: model.id,
            label: `${model.name}${tokensBadge} (${model.id})`,
            contextLength: model.contextLength,
            maxCompletionTokens: model.maxCompletionTokens,
            description: model.description,
        };
    });

    return (
        <div className="mb-2">
            <Select
                styles={reactSelectDarkStyles}
                value={aiModelName ? options.find(opt => opt.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                onChange={(selectedOption: any) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={options}
                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
                filterOption={(candidate, input) => {
                    if (!input || !input.trim()) return true;
                    return matchBreakWordRegex(
                        input,
                        candidate.data.label,
                        candidate.data.value,
                        candidate.data.description,
                        candidate.data.contextLength,
                        candidate.data.maxCompletionTokens
                    );
                }}
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
            setModelArr(response.data.docs || []);

            // if aiModelName is empty, select a random model
            if (aiModelName === '') {
                if (response.data.docs && response.data.docs.length > 0) {
                    setAiModelName(response.data.docs[0].id);
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

    const options = modelArr.map((model) => {
        const ctxLen = model.contextLength || model.context_window || 0;
        const ctxFormatted = formatContextLength(ctxLen);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: model.id,
            label: `${model.owned_by} - ${model.id}${tokensBadge}`,
            contextLength: ctxLen,
            maxCompletionTokens: model.maxCompletionTokens,
            owned_by: model.owned_by,
        };
    });

    return (
        <div className="mb-2">
            <Select
                styles={reactSelectDarkStyles}
                value={aiModelName ? options.find(opt => opt.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                onChange={(selectedOption: any) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={options}
                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
                filterOption={(candidate, input) => {
                    if (!input || !input.trim()) return true;
                    return matchBreakWordRegex(
                        input,
                        candidate.data.label,
                        candidate.data.value,
                        candidate.data.owned_by,
                        candidate.data.contextLength,
                        candidate.data.maxCompletionTokens
                    );
                }}
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
        Array<{ _id: string; modelName: string; modelLabel: string; contextLength?: number; maxCompletionTokens?: number }>
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

    const options = ollamaModels.map((model) => {
        const ctxFormatted = formatContextLength(model.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: model.modelName,
            label: `${model.modelLabel || model.modelName}${tokensBadge}`,
            contextLength: model.contextLength,
            maxCompletionTokens: model.maxCompletionTokens,
        };
    });

    return (
        <div className="mb-2">
            {loading ? (
                <div className="text-zinc-400 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : ollamaModels.length === 0 ? (
                <div className="text-sm text-zinc-400">No Ollama models found. Go to Ollama settings to add models.</div>
            ) : (
                <Select
                    styles={reactSelectDarkStyles}
                    value={aiModelName ? options.find(opt => opt.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                    onChange={(selectedOption: any) => {
                        if (selectedOption) {
                            setAiModelName(selectedOption.value);
                        }
                    }}
                    options={options}
                    placeholder="Select an Ollama model..."
                    isLoading={loading}
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            candidate.data.contextLength,
                            candidate.data.maxCompletionTokens
                        );
                    }}
                />
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
        Array<{ _id: string; modelName: string; modelLabel: string; modelType?: string; contextLength?: number; maxCompletionTokens?: number }>
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
        if (localaiModels.length > 0 && !aiModelName) {
            setAiModelName(localaiModels[0].modelName);
        }
    }, [localaiModels, aiModelName, setAiModelName]);

    const options = localaiModels.map((model) => {
        const ctxFormatted = formatContextLength(model.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        const typeBadge = model.modelType ? ` (${model.modelType})` : '';
        return {
            value: model.modelName,
            label: `${model.modelLabel || model.modelName}${typeBadge}${tokensBadge}`,
            contextLength: model.contextLength,
            maxCompletionTokens: model.maxCompletionTokens,
        };
    });

    return (
        <div className="mb-2">
            {loading ? (
                <div className="text-zinc-400 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : localaiModels.length === 0 ? (
                <div className="text-sm text-zinc-400">No LocalAI models found. Go to LocalAI settings to add models.</div>
            ) : (
                <Select
                    styles={reactSelectDarkStyles}
                    value={aiModelName ? options.find(opt => opt.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                    onChange={(selectedOption: any) => {
                        if (selectedOption) {
                            setAiModelName(selectedOption.value);
                        }
                    }}
                    options={options}
                    placeholder="Select a LocalAI model..."
                    isLoading={loading}
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            candidate.data.contextLength,
                            candidate.data.maxCompletionTokens
                        );
                    }}
                />
            )}
        </div>
    );
};

const SelectAiModelOpenaiCompatible = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    interface IOpenaiCompatibleModel {
        _id: string;
        providerName?: string;
        baseUrl: string;
        modelName?: string;
        contextLength?: number;
        maxCompletionTokens?: number;
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
                if (!aiModelName && response.data.docs && response.data.docs.length > 0) {
                    const firstConfig = response.data.docs[0];
                    setAiModelName(firstConfig._id);
                }
            } catch (error) {
                console.error('Error fetching OpenAI compatible models:', error);
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchConfigs();
    }, []);

    const options = configs.map((config) => {
        const displayName = config.providerName || config.baseUrl;
        const modelPart = config.modelName ? ` - ${config.modelName}` : '';
        const ctxFormatted = formatContextLength(config.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(config.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: config._id,
            label: `${displayName}${modelPart}${tokensBadge}`,
            contextLength: config.contextLength,
            maxCompletionTokens: config.maxCompletionTokens,
            providerName: config.providerName,
            baseUrl: config.baseUrl,
            modelName: config.modelName,
        };
    });

    return (
        <div className="mb-2">
            {isLoadingModel ? (
                <div className="text-sm text-zinc-400">Loading configurations...</div>
            ) : configs.length === 0 ? (
                <div className="text-sm text-zinc-400 mb-2">
                    No configurations found.
                    <Link to="/user/setting/openai-compatible-model" className="text-blue-600 hover:underline ml-1">
                        Create one here
                    </Link>
                </div>
            ) : (
                <Select
                    styles={reactSelectDarkStyles}
                    value={aiModelName ? options.find(c => c.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                    onChange={(selectedOption: any) => {
                        if (selectedOption) {
                            setAiModelName(selectedOption.value);
                        }
                    }}
                    options={options}
                    placeholder="Select a configuration..."
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            candidate.data.providerName,
                            candidate.data.baseUrl,
                            candidate.data.modelName,
                            candidate.data.contextLength,
                            candidate.data.maxCompletionTokens
                        );
                    }}
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
                case 'localai':
                    return authState.apiKeyLocalaiValid;
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
                authState.apiKeyLocalaiValid && 'localai',
                openaiCompatibleConfigs.length > 0 && 'openai-compatible'
            ].filter(Boolean);

            if (validProviders.length > 0) {
                setCurrentModelProvider(validProviders[0] as AiModelProvider);
                setCurrentModelName('');
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
            const modelProvider = response.data.featureAiActionsModelProvider ?? 'groq';
            const modelName = response.data.featureAiActionsModelName ?? '';
            setCurrentModelProvider(modelProvider);

            // For openai-compatible provider, modelName contains the config ID
            // For other providers, modelName contains the model name
            setCurrentModelName(modelName);

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
            <div className="bg-zinc-900 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-zinc-100 py-2">AI Features Settings</h2>

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
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                        />
                        <label htmlFor="featureAiActionsEnabled" className="text-zinc-300 font-bold text-lg">
                            Enable AI Features
                        </label>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                        Turn on AI-powered features across the application. When disabled, all AI actions will be unavailable.
                    </p>
                </div>

                {/* Current Model Section - Only show when AI features are enabled */}
                {featureAiActionsEnabled && (
                    <div className="bg-zinc-950 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-zinc-300">Current Model</h3>
                    </div>

                    {/* field -> modelProvider */}
                    <div className="mb-3">
                        <h3 className="text-sm font-medium text-zinc-300 mb-2">Provider</h3>
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
                                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
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
                                    className="px-3 py-2 text-sm rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 transition-colors text-center font-semibold"
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
                                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
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
                                    className="px-3 py-2 text-sm rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 transition-colors text-center font-semibold"
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
                                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
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
                                    className="px-3 py-2 text-sm rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 transition-colors text-center font-semibold"
                                >
                                    Setup Ollama
                                </Link>
                            )}

                            {/* LocalAI */}
                            {authState.apiKeyLocalaiValid ? (
                                <button
                                    onClick={() => {
                                        setCurrentModelProvider('localai');
                                        setCurrentModelName('');
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${currentModelProvider === 'localai'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                                        }
                                        font-semibold`
                                    }
                                    aria-pressed={currentModelProvider === 'localai'}
                                >
                                    LocalAI
                                </button>
                            ) : (
                                <Link
                                    to="/user/setting/localai-models"
                                    className="px-3 py-2 text-sm rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 transition-colors text-center font-semibold"
                                >
                                    Setup LocalAI
                                </Link>
                            )}

                            {/* OpenAI Compatible */}
                            {openaiCompatibleConfigs.length > 0 ? (
                                <button
                                    onClick={() => {
                                        setCurrentModelProvider('openai-compatible');
                                        setCurrentModelName('');
                                        setSelectRandomModel(Math.floor(Math.random() * 1000000));
                                    }}
                                    className={
                                        `px-3 py-2 text-sm rounded-sm border transition-colors
                                        ${currentModelProvider === 'openai-compatible'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
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
                                    className="px-3 py-2 text-sm rounded-sm border border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 transition-colors text-center font-semibold"
                                >
                                    Setup OpenAI Compatible
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* field -> select model */}
                    {currentModelProvider && (
                        <div className="mb-3">
                            <h3 className="text-sm font-medium text-zinc-300 mb-2">
                                {currentModelProvider.toUpperCase()} Model
                            </h3>

                            {currentModelProvider === 'openrouter' && (
                                <div>
                                    <SelectAiModelOpenrouter
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
                                        selectRandomModel={selectRandomModel}
                                        key={'select-model-openrouter'}
                                    />
                                    <div className="text-sm text-zinc-400 mt-2">
                                        Browse all OpenRouter models in the{' '}
                                        <Link
                                            to="/user/setting/openrouter-models"
                                            className="text-blue-500 hover:text-blue-700"
                                        >OpenRouter Settings</Link>.
                                    </div>
                                </div>
                            )}

                            {currentModelProvider === 'groq' && (
                                <div>
                                    <SelectAiModelGroq
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
                                        selectRandomModel={selectRandomModel}
                                        key={'select-model-groq'}
                                    />
                                    <div className="text-sm text-zinc-400 mt-2">
                                        Browse all GROQ models in the{' '}
                                        <Link
                                            to="/user/setting/groq-models"
                                            className="text-blue-500 hover:text-blue-700"
                                        >GROQ Settings</Link>.
                                    </div>
                                </div>
                            )}

                            {currentModelProvider === 'ollama' && (
                                <div>
                                    <SelectAiModelOllama
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
                                        key={'select-model-ollama'}
                                    />

                                    <div className="text-sm text-zinc-400 mt-2">
                                        Manage your Ollama models in the{' '}
                                        <Link
                                            to="/user/setting/ollama-models"
                                            className="text-blue-500 hover:text-blue-700"
                                        >Ollama Settings</Link>.
                                    </div>
                                </div>
                            )}

                            {currentModelProvider === 'localai' && (
                                <div>
                                    <SelectAiModelLocalai
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
                                        key={'select-model-localai'}
                                    />

                                    <div className="text-sm text-zinc-400 mt-2">
                                        Manage your LocalAI models in the{' '}
                                        <Link
                                            to="/user/setting/localai-models"
                                            className="text-blue-500 hover:text-blue-700"
                                        >LocalAI Settings</Link>.
                                    </div>
                                </div>
                            )}

                            {currentModelProvider === 'openai-compatible' && (
                                <div>
                                    <SelectAiModelOpenaiCompatible
                                        aiModelName={currentModelName}
                                        setAiModelName={setCurrentModelName}
                                        key={'select-model-openai-compatible'}
                                    />

                                    <div className="text-sm text-zinc-400 mt-2">
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
                        <Link to="/user/setting" className="text-sm text-zinc-400 hover:text-zinc-300 inline-flex items-center">
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
                    <div className="bg-zinc-950 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-zinc-200 mb-4">Feature-Specific AI Actions</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        Enable or disable AI assistance for specific features. These settings only take effect when AI Features are enabled above.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsChatThread"
                                checked={featureAiActionsChatThread}
                                onChange={(e) => setFeatureAiActionsChatThread(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsChatThread" className="text-zinc-300 font-medium">
                                Chat Thread AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsChatMessage"
                                checked={featureAiActionsChatMessage}
                                onChange={(e) => setFeatureAiActionsChatMessage(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsChatMessage" className="text-zinc-300 font-medium">
                                Chat Message AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsNotes"
                                checked={featureAiActionsNotes}
                                onChange={(e) => setFeatureAiActionsNotes(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsNotes" className="text-zinc-300 font-medium">
                                Notes AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsTask"
                                checked={featureAiActionsTask}
                                onChange={(e) => setFeatureAiActionsTask(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsTask" className="text-zinc-300 font-medium">
                                Task AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsLifeEvents"
                                checked={featureAiActionsLifeEvents}
                                onChange={(e) => setFeatureAiActionsLifeEvents(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsLifeEvents" className="text-zinc-300 font-medium">
                                Life Events AI
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featureAiActionsInfoVault"
                                checked={featureAiActionsInfoVault}
                                onChange={(e) => setFeatureAiActionsInfoVault(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
                                disabled={!featureAiActionsEnabled}
                            />
                            <label htmlFor="featureAiActionsInfoVault" className="text-zinc-300 font-medium">
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
        <div className="w-full max-w-3xl">
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