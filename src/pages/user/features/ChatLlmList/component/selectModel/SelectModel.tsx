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

type ModelTab = 'llm' | 'stt' | 'tts';

const MODEL_TABS: { id: ModelTab; label: string }[] = [
    { id: 'llm', label: 'LLM' },
    { id: 'stt', label: 'STT' },
    { id: 'tts', label: 'TTS' },
];

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
    const [activeTab, setActiveTab] = useState<ModelTab>('llm');
    const [internalSelectRandomModel, setInternalSelectRandomModel] = useState(0);
    const selectRandomModel = selectRandomModelProp ?? internalSelectRandomModel;
    const setSelectRandomModel = setSelectRandomModelProp ?? setInternalSelectRandomModel;

    const handleProviderChange = (value: typeof aiModelProvider) => {
        setAiModelProvider(value);
        setAiModelName('');
        setAiModelOpenAiCompatibleConfigId(null);
        setSelectRandomModel(Math.floor(Math.random() * 1_000_000));
    };

    const renderLlmTab = () => (
        <>
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
        </>
    );

    const renderSttTab = () => (
        <SelectSttModel
            sttModelProvider={sttModelProvider}
            setSttModelProvider={setSttModelProvider}
            sttModelName={sttModelName}
            setSttModelName={setSttModelName}
            panelMode
        />
    );

    const renderTtsTab = () => (
        <SelectTtsModel
            ttsModelProvider={ttsModelProvider}
            setTtsModelProvider={setTtsModelProvider}
            ttsModelName={ttsModelName}
            setTtsModelName={setTtsModelName}
            panelMode
        />
    );

    return (
        <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
            <div className="mb-1.5 flex items-center justify-between">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Model
                </h3>
                <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-700"
                    title="Settings"
                >
                    <Settings className="h-3.5 w-3.5" />
                </button>
            </div>

            <div
                className="mb-2 flex rounded-lg border border-zinc-200/90 bg-zinc-50/80 p-0.5"
                role="tablist"
                aria-label="Model configuration"
            >
                {MODEL_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-teal-800 shadow-sm ring-1 ring-zinc-200/80'
                                : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div role="tabpanel">
                {activeTab === 'llm' && renderLlmTab()}
                {activeTab === 'stt' && renderSttTab()}
                {activeTab === 'tts' && renderTtsTab()}
            </div>
        </div>
    );
};

export default SelectModel;
