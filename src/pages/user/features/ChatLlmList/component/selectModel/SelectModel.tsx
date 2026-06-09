import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings, ExternalLink } from "lucide-react";

import { PROVIDER_OPTIONS } from "./constants";
import type { SelectModelProps } from "./selectModel.types";
import LastUsedLlmModel from "./LastUsedLlmModel";
import SelectSttModel from "./SelectSttModel";
import SelectTtsModel from "./SelectTtsModel";
import SelectAiModelOpenrouter from "./providers/SelectAiModelOpenrouter";
import SelectAiModelGroq from "./providers/SelectAiModelGroq";
import SelectAiModelOllama from "./providers/SelectAiModelOllama";
import SelectAiModelLocalai from "./providers/SelectAiModelLocalai";
import SelectAiModelOpenaiCompatible from "./providers/SelectAiModelOpenaiCompatible";

const SelectModel: React.FC<SelectModelProps> = ({
    aiModelProvider,
    setAiModelProvider,
    aiModelName,
    setAiModelName,
    aiModelOpenAiCompatibleConfigId,
    setAiModelOpenAiCompatibleConfigId,
    sttModelProvider,
    setSttModelProvider,
    sttModelName,
    setSttModelName,
    ttsModelProvider,
    setTtsModelProvider,
    ttsModelName,
    setTtsModelName,
    selectRandomModel: selectRandomModelProp,
    setSelectRandomModel: setSelectRandomModelProp,
}) => {
    const [internalSelectRandomModel, setInternalSelectRandomModel] = useState(0);
    const selectRandomModel = selectRandomModelProp ?? internalSelectRandomModel;
    const setSelectRandomModel = setSelectRandomModelProp ?? setInternalSelectRandomModel;

    const handleProviderChange = (value: typeof aiModelProvider) => {
        setAiModelProvider(value);
        setAiModelName('');
        setAiModelOpenAiCompatibleConfigId(null);
        setSelectRandomModel(Math.floor(Math.random() * 1_000_000));
    };

    return (
        <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Model
                </h3>
                <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-700"
                    title="Settings"
                >
                    <Settings className="h-4 w-4" />
                </button>
            </div>

            <div className="mb-2">
                <h3 className="mb-1.5 text-xs font-medium text-zinc-700">Provider</h3>
                <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
                    {PROVIDER_OPTIONS.map((provider) => (
                        <button
                            key={provider.value}
                            type="button"
                            onClick={() => handleProviderChange(provider.value)}
                            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-all sm:min-w-[5.5rem] ${
                                aiModelProvider === provider.value
                                    ? 'border-teal-500/30 bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/15'
                                    : 'border-zinc-200/90 bg-zinc-50/80 text-zinc-800 hover:border-zinc-300 hover:bg-white'
                            }`}
                            aria-pressed={aiModelProvider === provider.value}
                        >
                            {provider.label}
                        </button>
                    ))}
                </div>
            </div>

            {aiModelProvider === 'openrouter' && (
                <SelectAiModelOpenrouter
                    aiModelName={aiModelName}
                    setAiModelName={setAiModelName}
                    selectRandomModel={selectRandomModel}
                    key="select-model-openrouter"
                />
            )}

            {aiModelProvider === 'groq' && (
                <SelectAiModelGroq
                    aiModelName={aiModelName}
                    setAiModelName={setAiModelName}
                    selectRandomModel={selectRandomModel}
                    key="select-model-groq"
                />
            )}

            {aiModelProvider === 'ollama' && (
                <div>
                    <SelectAiModelOllama
                        aiModelName={aiModelName}
                        setAiModelName={setAiModelName}
                        key="select-model-ollama"
                    />
                    <div className="text-sm text-gray-500 mt-2">
                        Manage your Ollama models in the{' '}
                        <Link
                            to="/user/setting/ollama-models"
                            className="text-blue-500 hover:text-blue-700"
                        >Ollama Settings</Link>.
                    </div>
                </div>
            )}

            {aiModelProvider === 'localai' && (
                <div>
                    <SelectAiModelLocalai
                        aiModelName={aiModelName}
                        setAiModelName={setAiModelName}
                        key="select-model-localai"
                    />
                    <div className="text-sm text-gray-500 mt-2">
                        Manage your LocalAI models in the{' '}
                        <Link
                            to="/user/setting/localai-models"
                            className="text-blue-500 hover:text-blue-700"
                        >LocalAI Settings</Link>.
                    </div>
                </div>
            )}

            {aiModelProvider === 'openai-compatible' && (
                <div>
                    <SelectAiModelOpenaiCompatible
                        aiModelName={aiModelName}
                        setAiModelName={setAiModelName}
                        aiModelOpenAiCompatibleConfigId={aiModelOpenAiCompatibleConfigId}
                        setAiModelOpenAiCompatibleConfigId={setAiModelOpenAiCompatibleConfigId}
                        key="select-model-openai-compatible"
                    />
                    <div className="text-sm text-gray-500 mt-2">
                        Manage your OpenAI compatible model configurations in the{' '}
                        <Link
                            to="/user/setting/openai-compatible-model"
                            className="text-blue-500 hover:text-blue-700"
                        >OpenAI Compatible Model Settings</Link>.
                    </div>
                </div>
            )}

            <LastUsedLlmModel
                aiModelName={aiModelName}
                setAiModelProvider={setAiModelProvider}
                setAiModelName={setAiModelName}
                key="select-model-last-used-llm"
            />

            <SelectSttModel
                sttModelProvider={sttModelProvider}
                setSttModelProvider={setSttModelProvider}
                sttModelName={sttModelName}
                setSttModelName={setSttModelName}
            />

            <SelectTtsModel
                ttsModelProvider={ttsModelProvider}
                setTtsModelProvider={setTtsModelProvider}
                ttsModelName={ttsModelName}
                setTtsModelName={setTtsModelName}
            />

            <div className="mt-2">
                <Link to="/user/setting" className="text-sm text-gray-500 hover:text-gray-700 inline-block mr-5">
                    <ExternalLink className="w-4 h-4 mr-1 inline-block" />
                    Model page
                </Link>

                <button
                    type="button"
                    onClick={() => {
                        setSelectRandomModel(selectRandomModel + 1);
                    }}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700 inline-block"
                >
                    <span className="mr-1">🎲</span>
                    Random LLM
                </button>
            </div>
        </div>
    );
};

export default SelectModel;
