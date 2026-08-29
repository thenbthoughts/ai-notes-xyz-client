import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import axiosCustom from "../../../../../../../config/axiosCustom";
import { reactSelectPortalProps } from "../reactSelectPortalProps";
import { tsSchemaAiModelListOpenrouter } from "../../../../../../../types/pages/settings/dataModelOpenrouter";
import {
    formatContextLength,
    formatMaxCompletionTokens,
    matchBreakWordRegex,
    matchModalityFilters,
    initialModalityFilterState,
    hasActiveModalityFilters,
    ModalityFilterState
} from "../../../../../../../utils/modelSearchUtils";

interface OptionType {
    value: string;
    label: string;
    contextLength?: number;
    maxCompletionTokens?: number;
    isInputModalityImage?: string;
    isInputModalityAudio?: string;
    isInputModalityVideo?: string;
    isOutputModalityEmbedding?: string;
    description?: string;
}

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
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);

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
                    })).sort((a, b) => a.name.localeCompare(b.name));

                    if (aiModelName === '') {
                        if (tempModelArr.length > 0) {
                            setAiModelName(tempModelArr[0].id);
                        }
                    }

                    setModelArr(tempModelArr);
                }
            } catch (error) {
                console.error('Error fetching model data:', error);
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

    const filteredModels = useMemo(() => {
        if (!hasActiveModalityFilters(modalityFilters)) {
            return modelArr;
        }
        return modelArr.filter((model) => matchModalityFilters(model, modalityFilters));
    }, [modelArr, modalityFilters]);

    const options: OptionType[] = useMemo(() => {
        return filteredModels.map((model) => {
            const ctxFormatted = formatContextLength(model.contextLength);
            const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
            const tokensBadge = (ctxFormatted || maxTokensFormatted)
                ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
                : '';
            const visionBadge = model.isInputModalityImage === 'true' ? ' 👁️' : '';
            const audioBadge = model.isInputModalityAudio === 'true' ? ' 🎙️' : '';
            const videoBadge = model.isInputModalityVideo === 'true' ? ' 📹' : '';
            const embedBadge = model.isOutputModalityEmbedding === 'true' ? ' 🧬' : '';

            return {
                value: model.id,
                label: `${model.name}${tokensBadge}${visionBadge}${audioBadge}${videoBadge}${embedBadge} (${model.id})`,
                contextLength: model.contextLength,
                maxCompletionTokens: model.maxCompletionTokens,
                isInputModalityImage: model.isInputModalityImage,
                isInputModalityAudio: model.isInputModalityAudio,
                isInputModalityVideo: model.isInputModalityVideo,
                isOutputModalityEmbedding: model.isOutputModalityEmbedding,
                description: model.description,
            };
        });
    }, [filteredModels]);

    const selectedOption = useMemo(() => {
        if (!aiModelName) return undefined;
        return options.find((opt) => opt.value === aiModelName) || {
            value: aiModelName,
            label: aiModelName,
        };
    }, [aiModelName, options]);

    return (
        <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-medium text-zinc-300">OpenRouter Model</h3>
                    {modelArr.length > 0 && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                            ({filteredModels.length}/{modelArr.length})
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`text-[11px] px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                        hasActiveModalityFilters(modalityFilters) || showFilters
                            ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <span>Filters</span>
                    {hasActiveModalityFilters(modalityFilters) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    )}
                </button>
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
                                            ? 'bg-purple-950 border-purple-500 text-purple-200'
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
                            { ctx: 32000, label: '≥ 32k' },
                            { ctx: 128000, label: '≥ 128k' },
                            { ctx: 1000000, label: '≥ 1M' },
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

            <Select<OptionType>
                value={selectedOption}
                onChange={(option: OptionType | null) => {
                    if (option) {
                        setAiModelName(option.value);
                    }
                }}
                options={options}
                placeholder="Search models (e.g. 'claude 3.5', 'gpt-4o', 'gemini')..."
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
                {...reactSelectPortalProps}
            />
        </div>
    );
};

export default SelectAiModelOpenrouter;
