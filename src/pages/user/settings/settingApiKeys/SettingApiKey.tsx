import { useState } from "react";
import { useAtomValue } from "jotai";
import { CheckCircle, XCircle } from "lucide-react";
import stateJotaiAuthAtom from "../../../../jotai/stateJotaiAuth";
import ComponentApiKeySet from "../../userhomepage/ComponentApiKeySet";

// API Key Components
import GroqApiKey from "./GroqApiKey";
import OpenrouterApiKey from "./OpenrouterApiKey";
import OpencodeApiKey from "./OpencodeApiKey";
import S3ApiKey from "./S3ApiKey";
import OllamaApiKey from "./OllamaApiKey";
import QdrantApiKey from "./QdrantApiKey";
import ReplicateApiKey from "./ReplicateApiKey";
import RunpodApiKey from "./RunpodApiKey";
import OpenaiApiKey from "./OpenaiApiKey";
import LocalaiApiKey from "./LocalaiApiKey";
import SmtpSettings from "./SmtpSettings";
import TelegramSettings from "./TelegramSettings";
import FileStorageType from "./FileStorageType";
import ClientFrontendUrl from "./ClientFrontendUrl";

type SelectionType = 'groq' | 'openrouter' | 'opencode' | 's3' | 'ollama' | 'qdrant' | 'replicate' | 'runpod' | 'openai' | 'localai' | 'smtp' | 'telegram' | 'fileStorage' | 'clientUrl' | null;

const SettingApiKey = () => {
    const [selectedOption, setSelectedOption] = useState<SelectionType>(null);
    const authState = useAtomValue(stateJotaiAuthAtom);

    const selectionOptions = [
        { key: 'clientUrl' as const, label: 'Client URL', type: 'system' },
        { key: 'fileStorage' as const, label: 'File Storage', type: 'system' },
        { key: 'groq' as const, label: 'Groq', type: 'api' },
        { key: 'localai' as const, label: 'LocalAI', type: 'api' },
        { key: 'ollama' as const, label: 'Ollama', type: 'api' },
        { key: 'openai' as const, label: 'OpenAI', type: 'api' },
        { key: 'opencode' as const, label: 'OpenCode', type: 'api' },
        { key: 'openrouter' as const, label: 'OpenRouter', type: 'api' },
        { key: 'qdrant' as const, label: 'Qdrant', type: 'api' },
        { key: 'replicate' as const, label: 'Replicate', type: 'api' },
        { key: 'runpod' as const, label: 'RunPod', type: 'api' },
        { key: 's3' as const, label: 'S3 Storage', type: 'api' },
        { key: 'smtp' as const, label: 'SMTP', type: 'api' },
        { key: 'telegram' as const, label: 'Telegram', type: 'api' },
    ];

    const renderApiKeys = () => {
        return (
            <div
                id="api-keys"
            >
                <h2 className="text-xl font-bold text-gray-900 py-2">Api Keys</h2>

                <div className="my-4">
                    <ComponentApiKeySet />
                </div>

                {/* Selection Buttons */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Option to Configure</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectionOptions.map((option) => {
                            let isValid = true;
                            if (option.type === 'api') {
                                if (option.key === 'groq') {
                                    isValid = authState.apiKeyGroqValid;
                                } else if (option.key === 'openrouter') {
                                    isValid = authState.apiKeyOpenrouterValid;
                                } else if (option.key === 'opencode') {
                                    isValid = authState.apiKeyOpencodeValid;
                                } else if (option.key === 's3') {
                                    isValid = authState.apiKeyS3Valid;
                                } else if (option.key === 'ollama') {
                                    isValid = authState.apiKeyOllamaValid;
                                } else if (option.key === 'qdrant') {
                                    isValid = authState.apiKeyQdrantValid;
                                } else if (option.key === 'replicate') {
                                    isValid = authState.apiKeyReplicateValid;
                                } else if (option.key === 'runpod') {
                                    isValid = authState.apiKeyRunpodValid;
                                } else if (option.key === 'openai') {
                                    isValid = authState.apiKeyOpenaiValid;
                                } else if (option.key === 'localai') {
                                    isValid = authState.apiKeyLocalaiValid;
                                } else if (option.key === 'smtp') {
                                    isValid = authState.smtpValid;
                                } else if (option.key === 'telegram') {
                                    isValid = authState.telegramValid;
                                } else {
                                    isValid = false;
                                }
                            }
                            return (
                                <button
                                    key={option.key}
                                    onClick={() => setSelectedOption(selectedOption === option.key ? null : option.key)}
                                    className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 text-center min-w-0 flex-shrink-0 flex items-center gap-2 ${
                                        selectedOption === option.key
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                    <span className="text-xs font-medium">{option.label}</span>
                                    {option.type === 'api' && (
                                        isValid ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                        )
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Component */}
                <div className="mt-6">
                    {selectedOption === 'groq' && <GroqApiKey />}
                    {selectedOption === 'openrouter' && <OpenrouterApiKey />}
                    {selectedOption === 'opencode' && <OpencodeApiKey />}
                    {(selectedOption === 'fileStorage' || selectedOption === 's3') && <FileStorageType />}
                    {(selectedOption === 'fileStorage' || selectedOption === 's3') && <S3ApiKey />}
                    {selectedOption === 'ollama' && <OllamaApiKey />}
                    {selectedOption === 'qdrant' && <QdrantApiKey />}
                    {selectedOption === 'replicate' && <ReplicateApiKey />}
                    {selectedOption === 'runpod' && <RunpodApiKey />}
                    {selectedOption === 'openai' && <OpenaiApiKey />}
                    {selectedOption === 'localai' && <LocalaiApiKey />}
                    {selectedOption === 'smtp' && <SmtpSettings />}
                    {selectedOption === 'telegram' && <TelegramSettings />}
                    {selectedOption === 'clientUrl' && <ClientFrontendUrl />}
                    {selectedOption === null && (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 my-6">
                            <div className="text-4xl mb-4">🔧</div>
                            <p className="text-gray-600 font-medium">Select an option from above to configure it</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-3xl">
            {renderApiKeys()}
        </div>
    );
};

export default SettingApiKey;