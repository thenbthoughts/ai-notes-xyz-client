import { Fragment, useState, useEffect } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import Select from "react-select";
import { LucideExpand, LucidePlus } from "lucide-react";

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
}

const SelectTtsModel: React.FC<SelectTtsModelProps> = ({
    ttsModelProvider,
    setTtsModelProvider,
    ttsModelName,
    setTtsModelName,
}) => {
    const [localaiModels, setLocalaiModels] = useState<Array<{ modelName: string; modelLabel: string; modelType?: string }>>([]);
    const [isLoadingLocalai, setIsLoadingLocalai] = useState(false);
    const [expanded, setExpanded] = useState(true);

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

    return (
        <Fragment>
            <div className="mb-2 lg:mb-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        TTS (Text-to-Speech) - 
                        {(ttsModelProvider && ttsModelName) ? (
                            <span className="text-gray-500">
                                {ttsModelProvider} - {ttsModelName}
                            </span>
                        ) : (
                            <span className="text-gray-500">
                                Default (auto)
                            </span>
                        )}
                    </label>
                    <button
                        type="button"
                        onClick={() => setExpanded((prev) => !prev)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        aria-expanded={expanded}
                        title={expanded ? "Collapse" : "Expand"}
                    >
                        {expanded ? <LucideExpand className="w-4 h-4" /> : <LucidePlus className="w-4 h-4" />}
                    </button>
                </div>
                {expanded && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        {TTS_PROVIDER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setTtsModelProvider(opt.value);
                                }}
                                className={
                                    `flex-1 px-3 py-2 text-sm rounded-sm border transition-colors
                                    ${ttsModelProvider === opt.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
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
                    <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">TTS Model</h3>
                    {isLoadingLocalai ? (
                        <div className="text-sm text-gray-500">Loading models...</div>
                    ) : localaiModels.length === 0 ? (
                        <div className="text-sm text-gray-500">No TTS models found. Add models in LocalAI Settings.</div>
                    ) : (
                        <Select<{ value: string; label: string }>
                            value={ttsModelName ? { value: ttsModelName, label: localaiModels.find(m => m.modelName === ttsModelName)?.modelLabel || ttsModelName } : undefined}
                            onChange={(opt) => opt && setTtsModelName(opt.value)}
                            options={localaiModels.map(m => ({ value: m.modelName, label: m.modelLabel || m.modelName }))}
                            placeholder="Select TTS model..."
                            isSearchable={true}
                        />
                    )}
                </div>
            )}

            {expanded && (ttsModelProvider === 'openai' || ttsModelProvider === 'groq') && (
                <p className="text-xs text-gray-500 mb-2">
                    Using {TTS_DEFAULT_MODELS[ttsModelProvider]}.
                </p>
            )}
        </Fragment>
    );
};

export default SelectTtsModel;
