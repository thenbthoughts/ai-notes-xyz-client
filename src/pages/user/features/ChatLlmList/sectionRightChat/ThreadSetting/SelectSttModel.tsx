import { Fragment, useState, useEffect } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import Select from "react-select";
import { LucideExpand, LucidePlus } from "lucide-react";

export type SttModelProvider = "groq" | "openai" | "localai" | "";

const STT_PROVIDER_OPTIONS: { label: string; value: SttModelProvider }[] = [
    { label: 'Default (auto)', value: '' },
    { label: 'GROQ', value: 'groq' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'LocalAI', value: 'localai' },
];

const STT_DEFAULT_MODELS: Record<string, string> = {
    groq: 'whisper-large-v3',
    openai: 'whisper-1',
    localai: 'whisper-tiny',
};

interface SelectSttModelProps {
    sttModelProvider: string;
    setSttModelProvider: React.Dispatch<React.SetStateAction<string>>;
    sttModelName: string;
    setSttModelName: React.Dispatch<React.SetStateAction<string>>;
}

const SelectSttModel: React.FC<SelectSttModelProps> = ({
    sttModelProvider,
    setSttModelProvider,
    sttModelName,
    setSttModelName,
}) => {
    const [localaiModels, setLocalaiModels] = useState<Array<{ modelName: string; modelLabel: string; modelType?: string }>>([]);
    const [isLoadingLocalai, setIsLoadingLocalai] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (sttModelProvider !== 'localai') return;

        const fetchLocalaiModels = async () => {
            setIsLoadingLocalai(true);
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-localai/modelLocalaiGet");
                const docs = res.data.docs || [];
                const sttModels = docs.filter((m: { modelType?: string }) =>
                    m.modelType === 'stt' || m.modelType === ''
                );
                setLocalaiModels(sttModels);

                if (sttModels.length > 0) {
                    setSttModelName((prev) => {
                        const valid = sttModels.some((m: { modelName: string }) => m.modelName === prev);
                        return valid ? prev : sttModels[0].modelName;
                    });
                }
            } catch (err) {
                console.error('Failed to fetch LocalAI STT models:', err);
            } finally {
                setIsLoadingLocalai(false);
            }
        };
        fetchLocalaiModels();
    }, [sttModelProvider, setSttModelName]);

    useEffect(() => {
        if (sttModelProvider === 'groq' || sttModelProvider === 'openai') {
            setSttModelName(STT_DEFAULT_MODELS[sttModelProvider] || '');
        } else if (sttModelProvider === '') {
            setSttModelName('');
        }
    }, [sttModelProvider, setSttModelName]);

    return (
        <Fragment>
            <div className="mb-2 lg:mb-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        STT (Speech-to-Text) - 
                        {(sttModelProvider && sttModelName) ? (
                            <span className="text-gray-500">
                                {sttModelProvider} - {sttModelName}
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
                        {STT_PROVIDER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setSttModelProvider(opt.value);
                                }}
                                className={
                                    `flex-1 px-3 py-2 text-sm rounded-sm border transition-colors
                                    ${sttModelProvider === opt.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                                    }
                                    font-semibold`
                                }
                                aria-pressed={sttModelProvider === opt.value}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {expanded && sttModelProvider === 'localai' && (
                <div className="mb-1 lg:mb-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-1 lg:mb-2">STT Model</h3>
                    {isLoadingLocalai ? (
                        <div className="text-sm text-gray-500">Loading models...</div>
                    ) : localaiModels.length === 0 ? (
                        <div className="text-sm text-gray-500">No STT models found. Add models in LocalAI Settings.</div>
                    ) : (
                        <Select<{ value: string; label: string }>
                            value={sttModelName ? { value: sttModelName, label: localaiModels.find(m => m.modelName === sttModelName)?.modelLabel || sttModelName } : undefined}
                            onChange={(opt) => opt && setSttModelName(opt.value)}
                            options={localaiModels.map(m => ({ value: m.modelName, label: m.modelLabel || m.modelName }))}
                            placeholder="Select STT model..."
                            isSearchable={true}
                        />
                    )}
                </div>
            )}

            {expanded && (sttModelProvider === 'groq' || sttModelProvider === 'openai') && (
                <p className="text-xs text-gray-500 mb-2">
                    Using {STT_DEFAULT_MODELS[sttModelProvider]}.
                </p>
            )}
        </Fragment>
    );
};

export default SelectSttModel;
