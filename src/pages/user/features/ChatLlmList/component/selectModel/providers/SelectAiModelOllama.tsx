import { useState, useEffect, useMemo } from "react";
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

interface OllamaModelDoc {
    _id: string;
    modelName: string;
    modelLabel: string;
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
    raw?: any;
}

interface OptionType {
    value: string;
    label: string;
    contextLength?: number;
    maxCompletionTokens?: number;
    modelLabel?: string;
}

const SelectAiModelOllama = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [ollamaModels, setOllamaModels] = useState<OllamaModelDoc[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchOllamaModels = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-ollama/modelOllamaGet");
                setOllamaModels(res.data.docs || []);
            } catch {
                setError("Failed to fetch models");
            } finally {
                setLoading(false);
            }
        };
        fetchOllamaModels();
    }, []);

    useEffect(() => {
        if (ollamaModels.length > 0 && !aiModelName) {
            setAiModelName(ollamaModels[0].modelName);
        }
    }, [ollamaModels, aiModelName, setAiModelName]);

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
            return ollamaModels;
        }
        return ollamaModels.filter((model) => matchModalityFilters(model, modalityFilters));
    }, [ollamaModels, modalityFilters]);

    const options: OptionType[] = useMemo(() => {
        return filteredModels.map((model) => {
            const ctxLen = model.contextLength || 0;
            const ctxFormatted = formatContextLength(ctxLen);
            const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
            const tokensBadge = (ctxFormatted || maxTokensFormatted)
                ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
                : '';
            const visionBadge = model.isInputModalityImage === 'true' ? ' 👁️' : '';
            const audioBadge = model.isInputModalityAudio === 'true' ? ' 🎙️' : '';
            const videoBadge = model.isInputModalityVideo === 'true' ? ' 📹' : '';
            const embedBadge = model.isOutputModalityEmbedding === 'true' ? ' 🧬' : '';

            const displayName = model.modelLabel || model.modelName;

            return {
                value: model.modelName,
                label: `${displayName}${tokensBadge}${visionBadge}${audioBadge}${videoBadge}${embedBadge}`,
                contextLength: ctxLen,
                maxCompletionTokens: model.maxCompletionTokens,
                modelLabel: displayName,
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
                    <h3 className="text-xs font-medium text-zinc-300">Ollama Model</h3>
                    {ollamaModels.length > 0 && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                            ({filteredModels.length}/{ollamaModels.length})
                        </span>
                    )}
                </div>
                {ollamaModels.length > 0 && (
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

            {loading ? (
                <div className="text-zinc-400 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-400 text-sm">{error}</div>
            ) : ollamaModels.length === 0 ? (
                <div className="text-sm text-zinc-400">No Ollama models found. Go to Ollama settings to add models.</div>
            ) : (
                <Select<OptionType>
                    value={selectedOption}
                    onChange={(option: OptionType | null) => {
                        if (option) {
                            setAiModelName(option.value);
                        }
                    }}
                    options={options}
                    placeholder="Search Ollama models (e.g. 'llama 8b', 'gemma', 'qwen')..."
                    isLoading={loading}
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            candidate.data.modelLabel,
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

export default SelectAiModelOllama;
