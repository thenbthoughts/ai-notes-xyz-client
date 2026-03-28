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
import { Link } from 'react-router-dom';

import stateJotaiAuthAtom from '../../../jotai/stateJotaiAuth';

const panel =
    'rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2.5 shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:shadow-lg hover:shadow-sky-200/40';
const panelHeader = 'mb-1.5 flex items-center justify-between gap-1.5';
const panelTitle = 'flex items-center gap-1.5 text-xs font-bold text-sky-900';
const panelIconBtn =
    'rounded-xl border-2 border-sky-200/70 bg-sky-50/80 p-1 text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 disabled:opacity-40';
const mutedText = 'text-[11px] leading-snug font-medium text-sky-700/75';

const iconTone: Record<string, string> = {
    orange: 'text-orange-400',
    blue: 'text-sky-400',
    green: 'text-emerald-400',
    purple: 'text-violet-400',
    indigo: 'text-indigo-400',
    red: 'text-rose-400',
    emerald: 'text-teal-400',
};

const ComponentApiKeySet = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const [isExpanded, setIsExpanded] = useState(false);

    const apiKeyStatus = [
        {
            name: 'Groq API',
            key: 'apiKeyGroqValid',
            valid: authState.apiKeyGroqValid,
            icon: LucideBot,
            description: 'AI language model processing and chat completions',
            color: 'orange',
            required: true,
        },
        {
            name: 'OpenRouter API',
            key: 'apiKeyOpenrouterValid',
            valid: authState.apiKeyOpenrouterValid,
            icon: LucideCloud,
            description: 'Multiple AI models through one API',
            color: 'blue',
            required: true,
        },
        {
            name: 'S3 Storage',
            key: 'apiKeyS3Valid',
            valid: authState.apiKeyS3Valid,
            icon: LucideDatabase,
            description: 'File storage and documents',
            color: 'green',
            required: true,
        },
        {
            name: 'Ollama API',
            key: 'apiKeyOllamaValid',
            valid: authState.apiKeyOllamaValid,
            icon: LucideBot,
            description: 'Local AI inference (optional)',
            color: 'purple',
            required: false,
        },
        {
            name: 'Qdrant Vector DB',
            key: 'apiKeyQdrantValid',
            valid: authState.apiKeyQdrantValid,
            icon: LucideDatabase,
            description: 'Vector search (optional)',
            color: 'indigo',
            required: false,
        },
        {
            name: 'SMTP Email',
            key: 'smtpValid',
            valid: authState.smtpValid,
            icon: LucideMail,
            description: 'Notifications and email',
            color: 'red',
            required: true,
        },
        {
            name: 'Replicate API',
            key: 'apiKeyReplicateValid',
            valid: authState.apiKeyReplicateValid,
            icon: LucideCloud,
            description: 'Image / video models (optional)',
            color: 'purple',
            required: false,
        },
        {
            name: 'RunPod API',
            key: 'apiKeyRunpodValid',
            valid: authState.apiKeyRunpodValid,
            icon: LucideCloud,
            description: 'GPU inference (optional)',
            color: 'indigo',
            required: false,
        },
        {
            name: 'OpenAI API',
            key: 'apiKeyOpenaiValid',
            valid: authState.apiKeyOpenaiValid,
            icon: LucideCloud,
            description: 'OpenAI models (optional)',
            color: 'blue',
            required: false,
        },
        {
            name: 'LocalAI',
            key: 'apiKeyLocalaiValid',
            valid: authState.apiKeyLocalaiValid,
            icon: LucideBot,
            description: 'Local models via LocalAI (optional)',
            color: 'emerald',
            required: false,
        },
    ];

    const completedCount = apiKeyStatus.filter((api) => api.valid).length;
    const totalCount = apiKeyStatus.length;

    return (
        <div className={`${panel} my-0.5 border-l-4 border-l-cyan-400`}>
            <div className={panelHeader}>
                <h2 className={panelTitle}>
                    <Link to="/user/setting/api-key" className="flex items-center gap-1.5 hover:text-sky-800">
                        <LucideKey className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                        API configuration
                    </Link>
                </h2>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={panelIconBtn}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                >
                    {isExpanded ? (
                        <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                        <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                </button>
            </div>

            <div className="mb-2">
                <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-600/80">
                        Configured
                    </span>
                    <span className="text-[10px] font-extrabold text-sky-800">
                        {completedCount} / {totalCount}
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-200/80">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                </div>
            </div>

            {isExpanded && (
                <div>
                    <div className="mb-2 space-y-1">
                        {apiKeyStatus.map((api) => {
                            const ApiIcon = api.icon;
                            const tone = iconTone[api.color] ?? 'text-sky-500';
                            return (
                                <div
                                    key={api.key}
                                    className="rounded-xl border-2 border-sky-100 bg-sky-50/50 p-2"
                                >
                                    <div className="flex items-start gap-1.5">
                                        <ApiIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone}`} strokeWidth={2} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="text-[11px] font-bold text-sky-950">
                                                    {api.name}
                                                </span>
                                                {!api.required && (
                                                    <span className="rounded-md bg-sky-200/60 px-1 py-0 text-[9px] font-bold uppercase tracking-wide text-sky-700">
                                                        Opt
                                                    </span>
                                                )}
                                                {api.valid ? (
                                                    <LucideCheck className="h-3 w-3 text-emerald-600" strokeWidth={2} />
                                                ) : (
                                                    <LucideX className="h-3 w-3 text-rose-500" strokeWidth={2} />
                                                )}
                                            </div>
                                            <p className={`${mutedText} mt-0.5`}>{api.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-sky-200/80 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = '/user/setting/api-key';
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 py-2 text-[11px] font-bold text-white shadow-md shadow-sky-300/40 transition hover:from-sky-600 hover:to-cyan-600"
                        >
                            <LucideSettings className="h-3.5 w-3.5" strokeWidth={2} />
                            Configure API keys
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentApiKeySet;
