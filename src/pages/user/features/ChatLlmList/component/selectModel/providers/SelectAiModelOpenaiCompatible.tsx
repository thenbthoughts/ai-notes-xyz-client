import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

import axiosCustom from "../../../../../../../config/axiosCustom";
import { reactSelectPortalProps } from "../reactSelectPortalProps";
import {
    formatContextLength,
    formatMaxCompletionTokens,
    matchBreakWordRegex,
    matchModalityFilters,
    initialModalityFilterState,
    hasActiveModalityFilters,
    ModalityFilterState
} from "../../../../../../../utils/modelSearchUtils";

interface IOpenaiCompatibleModel {
    _id: string;
    providerName?: string;
    baseUrl: string;
    modelName?: string;
    contextLength?: number;
    maxCompletionTokens?: number;
    isInputModalityText?: string;
    isInputModalityImage?: string;
    isInputModalityAudio?: string;
    isInputModalityVideo?: string;
    isOutputModalityText?: string;
    isOutputModalityImage?: string;
    isOutputModalityAudio?: string;
    isOutputModalityVideo?: string;
    isOutputModalityEmbedding?: string;
}

interface OptionType {
    value: string;
    label: string;
    contextLength?: number;
    maxCompletionTokens?: number;
    providerName?: string;
    baseUrl?: string;
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
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);

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

    const toggleModalityFilter = (key: keyof ModalityFilterState) => {
        setModalityFilters((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleContextFilter = (minCtx: number) => {
        setModalityFilters((prev) => ({
            ...prev,
            minContextLength: prev.minContextLength === minCtx ? 0 : minCtx,
        }));
    };

    const filteredConfigs = useMemo(() => {
        if (!hasActiveModalityFilters(modalityFilters)) {
            return configs;
        }
        return configs.filter((c) => matchModalityFilters(c, modalityFilters));
    }, [configs, modalityFilters]);

    const options: OptionType[] = useMemo(() => {
        return filteredConfigs.map((config) => {
            const displayName = config.providerName || config.baseUrl;
            const modelPart = config.modelName ? ` - ${config.modelName}` : '';
            const ctxFormatted = formatContextLength(config.contextLength);
            const maxTokensFormatted = formatMaxCompletionTokens(config.maxCompletionTokens);
            const tokensBadge = (ctxFormatted || maxTokensFormatted)
                ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
                : '';
            const visionBadge = config.isInputModalityImage === 'true' ? ' 👁️' : '';
            const audioBadge = config.isInputModalityAudio === 'true' ? ' 🎙️' : '';
            const videoBadge = config.isInputModalityVideo === 'true' ? ' 📹' : '';
            const embedBadge = config.isOutputModalityEmbedding === 'true' ? ' 🧬' : '';

            const label = `${displayName}${modelPart}${tokensBadge}${visionBadge}${audioBadge}${videoBadge}${embedBadge}`;
            return {
                value: config._id,
                label,
                contextLength: config.contextLength,
                maxCompletionTokens: config.maxCompletionTokens,
                providerName: config.providerName,
                baseUrl: config.baseUrl,
                modelName: config.modelName,
            };
        });
    }, [filteredConfigs]);

    const selectedOption = useMemo(() => {
        if (!aiModelOpenAiCompatibleConfigId) return undefined;
        const config = configs.find((c) => c._id === aiModelOpenAiCompatibleConfigId);
        if (!config) return undefined;
        const displayName = config.providerName || config.baseUrl;
        const modelPart = aiModelName ? ` - ${aiModelName}` : (config.modelName ? ` - ${config.modelName}` : '');
        const ctxFormatted = formatContextLength(config.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(config.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        const visionBadge = config.isInputModalityImage === 'true' ? ' 👁️' : '';
        const audioBadge = config.isInputModalityAudio === 'true' ? ' 🎙️' : '';
        const videoBadge = config.isInputModalityVideo === 'true' ? ' 📹' : '';
        const embedBadge = config.isOutputModalityEmbedding === 'true' ? ' 🧬' : '';
        return {
            value: aiModelOpenAiCompatibleConfigId,
            label: `${displayName}${modelPart}${tokensBadge}${visionBadge}${audioBadge}${videoBadge}${embedBadge}`,
        };
    }, [aiModelOpenAiCompatibleConfigId, aiModelName, configs]);

    return (
        <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-medium text-zinc-300">OpenAI Compatible Model</h3>
                    {configs.length > 0 && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                            ({filteredConfigs.length}/{configs.length})
                        </span>
                    )}
                </div>
                {configs.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`text-[11px] px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                            hasActiveModalityFilters(modalityFilters) || showFilters
                                ? 'bg-blue-950/80 border-blue-600 text-blue-200'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <span>Filters</span>
                        {hasActiveModalityFilters(modalityFilters) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        )}
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="mb-2 p-2 rounded-md bg-zinc-950/90 border border-zinc-800 space-y-1.5 text-[11px]">
                    <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-zinc-500 text-[10px] uppercase font-semibold mr-1">Modalities:</span>
                        {[
                            { key: 'inputImage', label: 'Vision 👁️' },
                            { key: 'inputAudio', label: 'Audio In 🎙️' },
                            { key: 'inputVideo', label: 'Video 📹' },
                        ].map((item) => {
                            const active = modalityFilters[item.key as keyof ModalityFilterState];
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => toggleModalityFilter(item.key as keyof ModalityFilterState)}
                                    className={`px-2 py-0.5 rounded-full border transition-colors ${
                                        active
                                            ? 'bg-blue-950 border-blue-500 text-blue-200'
                                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-zinc-500 text-[10px] uppercase font-semibold mr-1">Context:</span>
                        {[
                            { ctx: 8192, label: '≥ 8k' },
                            { ctx: 32000, label: '≥ 32k' },
                            { ctx: 128000, label: '≥ 128k' },
                        ].map((item) => {
                            const active = modalityFilters.minContextLength === item.ctx;
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => toggleContextFilter(item.ctx)}
                                    className={`px-2 py-0.5 rounded-full border transition-colors ${
                                        active
                                            ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}

                        {hasActiveModalityFilters(modalityFilters) && (
                            <button
                                type="button"
                                onClick={() => setModalityFilters(initialModalityFilterState)}
                                className="ml-auto px-2 py-0.5 text-xs text-red-400 hover:underline"
                            >
                                Reset filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isLoadingModel ? (
                <div className="text-sm text-zinc-400">Loading configurations...</div>
            ) : configs.length === 0 ? (
                <div className="text-sm text-zinc-400 mb-2">
                    No configurations found.
                    <Link to="/user/setting/openai-compatible-model" className="text-blue-500 hover:underline ml-1">
                        Create one here
                    </Link>
                </div>
            ) : (
                <Select<OptionType>
                    value={selectedOption}
                    onChange={(option: OptionType | null) => {
                        if (option) {
                            const config = configs.find((c) => c._id === option.value);
                            setAiModelOpenAiCompatibleConfigId(option.value);
                            setAiModelName(config?.modelName || '');
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
                    {...reactSelectPortalProps}
                />
            )}
        </div>
    );
};

export default SelectAiModelOpenaiCompatible;
