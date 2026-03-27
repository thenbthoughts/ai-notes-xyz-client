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
    'rounded-lg border border-zinc-200/90 bg-white p-2.5 shadow-sm transition hover:shadow';
const panelHeader = 'mb-1.5 flex items-center justify-between gap-1.5';
const panelTitle = 'flex items-center gap-1.5 text-xs font-semibold text-zinc-800';
const panelIconBtn =
    'rounded-md border border-zinc-200 bg-white p-1 text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40';
const mutedText = 'text-[11px] leading-snug text-zinc-500';

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
        <div className={`${panel} my-0.5 border-l-[3px] border-l-cyan-500`}>
            <div className={panelHeader}>
                <h2 className={panelTitle}>
                    <Link to="/user/setting/api-key" className="flex items-center gap-1.5 hover:text-teal-700">
                        <LucideKey className="h-3.5 w-3.5 text-teal-600" strokeWidth={2} />
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
                    <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Configured
                    </span>
                    <span className="text-[10px] font-bold text-teal-700">
                        {completedCount} / {totalCount}
                    </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                </div>
            </div>

            {isExpanded && (
                <div>
                    <div className="mb-2 space-y-1">
                        {apiKeyStatus.map((api) => {
                            const ApiIcon = api.icon;
                            const tone = iconTone[api.color] ?? 'text-zinc-500';
                            return (
                                <div
                                    key={api.key}
                                    className="rounded-md border border-zinc-200 bg-zinc-50/80 p-2"
                                >
                                    <div className="flex items-start gap-1.5">
                                        <ApiIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone}`} strokeWidth={2} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="text-[11px] font-semibold text-zinc-900">
                                                    {api.name}
                                                </span>
                                                {!api.required && (
                                                    <span className="rounded bg-zinc-200/80 px-1 py-0 text-[9px] font-medium uppercase tracking-wide text-zinc-600">
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
                    <div className="border-t border-zinc-200 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = '/user/setting/api-key';
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-teal-600 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-teal-700"
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
