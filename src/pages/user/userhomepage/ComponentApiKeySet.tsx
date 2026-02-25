import { useState } from 'react';
import { useAtomValue } from 'jotai';
import {
    LucideKey,
    LucideCheck,
    LucideX,
    LucideCloud,
    LucideDatabase,
    LucideMail,
    LucideBot,
    LucideChevronDown,
    LucideChevronUp,
    LucideSettings,
} from 'lucide-react';
import { Link } from "react-router-dom";

import stateJotaiAuthAtom from "../../../jotai/stateJotaiAuth";

const ComponentApiKeySet = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const [isExpanded, setIsExpanded] = useState(false);

    const apiKeyStatus = [
        {
            name: "Groq API",
            key: "apiKeyGroqValid",
            valid: authState.apiKeyGroqValid,
            icon: LucideBot,
            description: "Required for AI language model processing and chat completions",
            color: "orange",
            required: true
        },
        {
            name: "OpenRouter API",
            key: "apiKeyOpenrouterValid",
            valid: authState.apiKeyOpenrouterValid,
            icon: LucideCloud,
            description: "Required for accessing multiple AI models through unified API",
            color: "blue",
            required: true
        },
        {
            name: "S3 Storage",
            key: "apiKeyS3Valid",
            valid: authState.apiKeyS3Valid,
            icon: LucideDatabase,
            description: "Required for file storage and document management",
            color: "green",
            required: true
        },
        {
            name: "Ollama API",
            key: "apiKeyOllamaValid",
            valid: authState.apiKeyOllamaValid,
            icon: LucideBot,
            description: "Optional for local AI model inference and processing",
            color: "purple",
            required: false
        },
        {
            name: "Qdrant Vector DB",
            key: "apiKeyQdrantValid",
            valid: authState.apiKeyQdrantValid,
            icon: LucideDatabase,
            description: "Optional for vector search and semantic similarity operations",
            color: "indigo",
            required: false
        },
        {
            name: "SMTP Email",
            key: "smtpValid",
            valid: authState.smtpValid,
            icon: LucideMail,
            description: "Required for sending notifications and email communications",
            color: "red",
            required: true
        },
        {
            name: "Replicate API",
            key: "apiKeyReplicateValid",
            valid: authState.apiKeyReplicateValid,
            icon: LucideCloud,
            description: "Optional for AI image and video generation with Replicate models",
            color: "purple",
            required: false
        },
        {
            name: "RunPod API",
            key: "apiKeyRunpodValid",
            valid: authState.apiKeyRunpodValid,
            icon: LucideCloud,
            description: "Optional for GPU-accelerated AI inference and model hosting",
            color: "indigo",
            required: false
        },
        {
            name: "OpenAI API",
            key: "apiKeyOpenaiValid",
            valid: authState.apiKeyOpenaiValid,
            icon: LucideCloud,
            description: "Optional for accessing OpenAI models directly",
            color: "blue",
            required: false
        },
        {
            name: "LocalAI",
            key: "apiKeyLocalaiValid",
            valid: authState.apiKeyLocalaiValid,
            icon: LucideBot,
            description: "Optional for running AI models locally with LocalAI",
            color: "emerald",
            required: false
        }
    ];

    const completedCount = apiKeyStatus.filter(api => api.valid).length;
    const totalCount = apiKeyStatus.length;

    return (
        <div className='my-2'>
            <div className="text-left p-2 border border-blue-400 rounded-sm shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-2 hover:bg-blue-200 transition duration-300">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-bold text-blue-800">
                        <Link to="/user/setting/api-key">
                            <LucideKey size={16} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                            API Configuration
                        </Link>
                    </h2>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 border border-blue-400 rounded-sm bg-blue-100 hover:bg-blue-200 transition duration-200"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? (
                            <LucideChevronUp size={12} className="text-blue-600" />
                        ) : (
                            <LucideChevronDown size={12} className="text-blue-600" />
                        )}
                    </button>
                </div>

                <div className="mb-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-700">Required APIs</span>
                        <span className="text-xs font-bold text-blue-800">{completedCount} / {totalCount}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-sm h-1">
                        <div
                            className="bg-blue-600 h-1 rounded-sm transition-all duration-300"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {isExpanded && (
                    <div>
                        <div className="space-y-1 mb-1">
                            {apiKeyStatus.map((api) => {
                                const ApiIcon = api.icon;
                                return (
                                    <div key={api.key} className="flex flex-col gap-1 p-1 bg-white bg-opacity-50 rounded-sm border border-blue-200">
                                        <div className="flex items-center gap-1">
                                            <ApiIcon size={12} className={`text-${api.color}-600 flex-shrink-0`} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-semibold text-blue-800">{api.name}</span>
                                                    {!api.required && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">Opt</span>
                                                    )}
                                                    {api.valid ? (
                                                        <LucideCheck size={10} className="text-green-600 flex-shrink-0" />
                                                    ) : (
                                                        <LucideX size={10} className="text-red-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 ml-4">
                                            {api.description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 pt-2 border-t border-blue-200">
                            <button
                                onClick={() => window.location.href = '/user/setting/api-key'}
                                className="w-full bg-blue-500 text-white text-xs font-medium py-1.5 px-2 rounded-sm hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-1"
                            >
                                <LucideSettings size={12} />
                                Configure API Keys
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComponentApiKeySet;