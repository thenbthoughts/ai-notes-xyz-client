import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

import axiosCustom from "../../../../../../../config/axiosCustom";

interface IOpenaiCompatibleModel {
    _id: string;
    providerName?: string;
    baseUrl: string;
    modelName?: string;
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

export default SelectAiModelOpenaiCompatible;
