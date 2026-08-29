import { Fragment, useState, useEffect } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import Select from "react-select";
import { LucideExpand, LucidePlus } from "lucide-react";
import { reactSelectPortalProps } from "./reactSelectPortalProps";

export type TtsModelProvider = "openai" | "groq" | "localai" | "";

const TTS_PROVIDER_OPTIONS: { label: string; value: TtsModelProvider }[] = [
    { label: 'Default (auto)', value: '' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'GROQ', value: 'groq' },
    { label: 'LocalAI', value: 'localai' },
];

const TTS_DEFAULT_MODELS: Record<string, string> = {
    openai: 'tts-1',
    groq: 'canopylabs/orpheus-v1-english',
    localai: '',
};

interface SelectTtsModelProps {
    ttsModelProvider: string;
    setTtsModelProvider: React.Dispatch<React.SetStateAction<string>>;
    ttsModelName: string;
    setTtsModelName: React.Dispatch<React.SetStateAction<string>>;
    /** When true, always show controls (used inside SelectModel tabs). */
    panelMode?: boolean;
}

const SelectTtsModel: React.FC<SelectTtsModelProps> = ({
    ttsModelProvider,
    setTtsModelProvider,
    ttsModelName,
    setTtsModelName,
    panelMode = false,
}) => {
    const [localaiModels, setLocalaiModels] = useState<Array<{ modelName: string; modelLabel: string; modelType?: string }>>([]);
    const [isLoadingLocalai, setIsLoadingLocalai] = useState(false);
    const [collapsedExpanded, setCollapsedExpanded] = useState(true);
    const expanded = panelMode || collapsedExpanded;

    useEffect(() => {
        if (ttsModelProvider !== 'localai') return;

        const fetchLocalaiModels = async () => {
            setIsLoadingLocalai(true);
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-localai/modelLocalaiGet");
                const docs = res.data.docs || [];
                const ttsModels = docs.filter((m: { modelType?: string }) =>
                    m.modelType === 'tts' || m.modelType === ''
                );
                setLocalaiModels(ttsModels);

                if (ttsModels.length > 0) {
                    setTtsModelName((prev) => {
                        const valid = ttsModels.some((m: { modelName: string }) => m.modelName === prev);
                        return valid ? prev : ttsModels[0].modelName;
                    });
                }
            } catch (err) {
                console.error('Failed to fetch LocalAI TTS models:', err);
            } finally {
                setIsLoadingLocalai(false);
            }
        };
        fetchLocalaiModels();
    }, [ttsModelProvider, setTtsModelName]);

    useEffect(() => {
        if (ttsModelProvider === 'openai' || ttsModelProvider === 'groq') {
            setTtsModelName(TTS_DEFAULT_MODELS[ttsModelProvider] || '');
        } else if (ttsModelProvider === '') {
            setTtsModelName('');
        }
    }, [ttsModelProvider, setTtsModelName]);

    const currentLabel = (ttsModelProvider && ttsModelName)
        ? `${ttsModelProvider} — ${ttsModelName}`
        : 'Default (auto)';

    return (
        <Fragment>
            <div className="mb-2 lg:mb-3">
                {panelMode ? (
                    <p className="mb-2 text-xs text-zinc-500">
                        Current: <span className="font-medium text-zinc-300">{currentLabel}</span>
                    </p>
                ) : (
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">
                            TTS (Text-to-Speech) -
                            <span className="text-zinc-400"> {currentLabel}</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setCollapsedExpanded((prev) => !prev)}
                            className="text-sm text-zinc-400 hover:text-zinc-300 flex items-center gap-1"
                            aria-expanded={expanded}
                            title={expanded ? "Collapse" : "Expand"}
                        >
                            {expanded ? <LucideExpand className="w-4 h-4" /> : <LucidePlus className="w-4 h-4" />}
                        </button>
                    </div>
                )}
                {expanded && (
                    <div className={`flex flex-col sm:flex-row gap-2 ${panelMode ? '' : 'mt-2'}`}>
                        {TTS_PROVIDER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    setTtsModelProvider(opt.value);
                                }}
                                className={
                                    `flex-1 px-3 py-2 text-sm rounded-sm border transition-colors
                                    ${ttsModelProvider === opt.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                                    }
                                    font-semibold`
                                }
                                aria-pressed={ttsModelProvider === opt.value}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {expanded && ttsModelProvider === 'localai' && (
                <div className="mb-1 lg:mb-2">
                    <h3 className="text-sm font-medium text-zinc-300 mb-1 lg:mb-2">TTS Model</h3>
                    {isLoadingLocalai ? (
                        <div className="text-sm text-zinc-400">Loading models...</div>
                    ) : localaiModels.length === 0 ? (
                        <div className="text-sm text-zinc-400">No TTS models found. Add models in LocalAI Settings.</div>
                    ) : (
                        <Select<{ value: string; label: string }>
                            value={ttsModelName ? { value: ttsModelName, label: localaiModels.find(m => m.modelName === ttsModelName)?.modelLabel || ttsModelName } : undefined}
                            onChange={(opt) => opt && setTtsModelName(opt.value)}
                            options={localaiModels.map(m => ({ value: m.modelName, label: m.modelLabel || m.modelName }))}
                            placeholder="Select TTS model..."
                            isSearchable={true}
                            {...reactSelectPortalProps}
                        />
                    )}
                </div>
            )}

            {expanded && (ttsModelProvider === 'openai' || ttsModelProvider === 'groq') && (
                <p className="text-xs text-zinc-400 mb-2">
                    Using {TTS_DEFAULT_MODELS[ttsModelProvider]}.
                </p>
            )}
        </Fragment>
    );
};

export default SelectTtsModel;
