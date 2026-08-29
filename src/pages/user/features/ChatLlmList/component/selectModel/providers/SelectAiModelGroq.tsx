import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import axiosCustom from "../../../../../../../config/axiosCustom";
import { reactSelectPortalProps } from "../reactSelectPortalProps";
import { tsSchemaAiModelListGroq } from "../../../../../../../types/pages/settings/dataModelGroq";
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
    owned_by?: string;
    isInputModalityImage?: string;
    isInputModalityAudio?: string;
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
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoadingModel(true);
            try {
                const response = await axiosCustom.get('/api/dynamic-data/model-groq/modelGroqGet');
                setModelArr(response.data.docs || []);
            } catch (err) {
                console.error('Failed to fetch Groq models', err);
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
    }, [aiModelName, modelArr]);

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
            const ctxLen = model.contextLength || model.context_window || 0;
            const ctxFormatted = formatContextLength(ctxLen);
            const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
            const tokensBadge = (ctxFormatted || maxTokensFormatted)
                ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
                : '';
            const visionBadge = model.isInputModalityImage === 'true' || model.id.toLowerCase().includes('vision') ? ' 👁️' : '';
            const audioBadge = model.isInputModalityAudio === 'true' || model.id.toLowerCase().includes('whisper') ? ' 🎙️' : '';
            const videoBadge = model.isInputModalityVideo === 'true' ? ' 📹' : '';

            return {
                value: model.id,
                label: `${model.owned_by} - ${model.id}${tokensBadge}${visionBadge}${audioBadge}${videoBadge}`,
                contextLength: ctxLen,
                maxCompletionTokens: model.maxCompletionTokens,
                owned_by: model.owned_by,
                isInputModalityImage: model.isInputModalityImage,
                isInputModalityAudio: model.isInputModalityAudio,
                isInputModalityVideo: model.isInputModalityVideo,
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
                    <h3 className="text-xs font-medium text-zinc-300">GROQ Model</h3>
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
                            ? 'bg-orange-950/80 border-orange-600 text-orange-200'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <span>Filters</span>
                    {hasActiveModalityFilters(modalityFilters) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
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
                                            ? 'bg-orange-950 border-orange-500 text-orange-200'
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

            <Select<OptionType>
                value={selectedOption}
                onChange={(option: OptionType | null) => {
                    if (option) {
                        setAiModelName(option.value);
                    }
                }}
                options={options}
                placeholder="Search GROQ models (e.g. 'llama 70b', 'whisper')..."
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
                {...reactSelectPortalProps}
            />
        </div>
    );
};

export default SelectAiModelGroq;
