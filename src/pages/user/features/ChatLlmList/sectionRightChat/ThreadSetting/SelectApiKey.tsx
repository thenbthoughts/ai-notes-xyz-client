import { useState, useEffect, Fragment } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import Select from "react-select";

import { tsSchemaAiModelListGroq } from "../../../../../../types/pages/settings/dataModelGroq";
import { tsSchemaAiModelListOpenrouter } from "../../../../../../types/pages/settings/dataModelOpenrouter";

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
                        label: model.id
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
                console.error('Error fetching model data:', error);
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

const SelectAiModelLocalai = ({
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
                const response = await axiosCustom.get('/api/dynamic-data/model-localai/modelLocalaiGet');

                if (response.data.docs && response.data.docs.length > 0) {
                    setModelArr(response.data.docs);
                }
            } catch (error) {
                console.error('Error fetching model data:', error);
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
    const [configArr, setConfigArr] = useState([] as any[]);
    const [modelArr, setModelArr] = useState([] as any[]);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchConfigData = async () => {
            try {
                setIsLoadingConfig(true);
                const response = await axiosCustom.get('/api/dynamic-data/model-openai-compatible/modelOpenaiCompatibleGet');

                if (response.data.docs && response.data.docs.length > 0) {
                    setConfigArr(response.data.docs);
                }
            } catch (error) {
                console.error('Error fetching config data:', error);
            } finally {
                setIsLoadingConfig(false);
            }
        };
        fetchConfigData();
    }, []);

    useEffect(() => {
        const fetchModelData = async () => {
            if (!aiModelOpenAiCompatibleConfigId) return;

            try {
                setIsLoadingModel(true);
                const response = await axiosCustom.get(`/api/dynamic-data/model-openai-compatible/modelOpenaiCompatibleGetModels?configId=${aiModelOpenAiCompatibleConfigId}`);

                if (response.data.models && response.data.models.length > 0) {
                    setModelArr(response.data.models);
                }
            } catch (error) {
                console.error('Error fetching model data:', error);
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchModelData();
    }, [aiModelOpenAiCompatibleConfigId]);

    return (
        <Fragment>
            <div className="mb-1 lg:mb-2">
                <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">Config</h3>
                <Select<{ value: string; label: string }>
                    value={aiModelOpenAiCompatibleConfigId ? { value: aiModelOpenAiCompatibleConfigId, label: configArr.find(config => config.id === aiModelOpenAiCompatibleConfigId)?.name || "" } : undefined}
                    onChange={(selectedOption: { value: string; label: string } | null) => {
                        if (selectedOption) {
                            setAiModelOpenAiCompatibleConfigId(selectedOption.value);
                        } else {
                            setAiModelOpenAiCompatibleConfigId(null);
                        }
                    }}
                    options={
                        configArr.map((config: any) => ({
                            value: config.id,
                            label: config.name
                        }))
                    }

                    placeholder="Select a config..."
                    isLoading={isLoadingConfig}
                    isSearchable={true}
                    isClearable={true}
                />
            </div>

            {aiModelOpenAiCompatibleConfigId && (
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
                                label: model.id
                            }))
                        }

                        placeholder="Select a model..."
                        isLoading={isLoadingModel}
                        isSearchable={true}
                    />
                </div>
            )}
        </Fragment>
    )
}

interface SelectApiKeyProps {
    aiModelProvider: "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible";
    setAiModelProvider: React.Dispatch<React.SetStateAction<"openrouter" | "groq" | "ollama" | "localai" | "openai-compatible">>;
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    aiModelOpenAiCompatibleConfigId: string | null;
    setAiModelOpenAiCompatibleConfigId: React.Dispatch<React.SetStateAction<string | null>>;
}

const SelectApiKey: React.FC<SelectApiKeyProps> = ({
    aiModelProvider,
    setAiModelProvider,
    aiModelName,
    setAiModelName,
    aiModelOpenAiCompatibleConfigId,
    setAiModelOpenAiCompatibleConfigId,
}) => {
    return (
        <Fragment>
            {/* field -> aiModelProvider */}
            <div className="mb-2 lg:mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">AI Model Provider</label>
                <div className="flex flex-col sm:flex-row gap-2">
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

            {/* field -> select model -> localai */}
            {aiModelProvider === 'localai' && (
                <SelectAiModelLocalai
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
        </Fragment>
    );
};

export default SelectApiKey;