import { useState, useEffect, useMemo } from "react";
import { useSetAtom } from "jotai";
import { LucidePlus, LucideEdit, LucideTrash, LucideCopy, Search, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import OpenaiCompatibleModelModal from "./OpenaiCompatibleModelModal";
import {
    matchBreakWordRegex,
    matchModalityFilters,
    initialModalityFilterState,
    hasActiveModalityFilters,
    formatContextLength,
    formatMaxCompletionTokens,
    ModalityFilterState
} from '../../../../utils/modelSearchUtils';

interface IOpenaiCompatibleModel {
    _id: string;
    providerName?: string;
    baseUrl: string;
    apiKey?: string; // Optional - not returned from server
    modelName?: string;
    customHeaders?: string;
    contextLength?: number;
    maxCompletionTokens?: number;
    createdAt?: Date;
    isInputModalityText?: string;
    isInputModalityImage?: string;
    isInputModalityAudio?: string;
    isInputModalityVideo?: string;
    isOutputModalityText?: string;
    isOutputModalityImage?: string;
    isOutputModalityAudio?: string;
    isOutputModalityVideo?: string;
    isOutputModalityEmbedding?: string;
}

const OpenaiCompatibleModel = () => {
    const [configs, setConfigs] = useState<IOpenaiCompatibleModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingConfig, setEditingConfig] = useState<IOpenaiCompatibleModel | null>(null);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);

    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await axiosCustom.post<{ docs: IOpenaiCompatibleModel[] }>(
                `/api/user/openai-compatible-model/crud/openaiCompatibleModelGet`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setConfigs(response.data.docs || []);
        } catch (error: any) {
            console.error("Error fetching configs:", error);
            if (error?.response?.status !== 404) {
                toast.error('Failed to load configurations');
            }
        } finally {
            setLoading(false);
        }
    };

    const openModal = (config?: IOpenaiCompatibleModel) => {
        setEditingConfig(config || null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingConfig(null);
    };

    const handleCopy = async (config: IOpenaiCompatibleModel) => {
        try {
            await axiosCustom.post(
                `/api/user/openai-compatible-model/crud/openaiCompatibleModelCopy`,
                { _id: config._id },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            toast.success('Configuration copied successfully!');
            fetchConfigs();
            
            const randomNum = Math.floor(Math.random() * 1_000_000);
            setAuthStateReload(randomNum);
        } catch (error: any) {
            console.error("Error copying config:", error);
            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                errorStr = error?.response?.data?.error;
            }
            toast.error(`Failed to copy configuration. ${errorStr}`);
        }
    };

    const handleDelete = async (config: IOpenaiCompatibleModel) => {
        const configName = config.providerName || config.baseUrl || 'this configuration';
        if (!window.confirm(`Delete "${configName}"?`)) return;

        try {
            await axiosCustom.post(
                `/api/user/openai-compatible-model/crud/openaiCompatibleModelDelete`,
                { _id: config._id },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            toast.success('Configuration deleted successfully!');
            fetchConfigs();
            
            const randomNum = Math.floor(Math.random() * 1_000_000);
            setAuthStateReload(randomNum);
        } catch (error: any) {
            console.error("Error deleting config:", error);
            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                errorStr = error?.response?.data?.error;
            }
            toast.error(`Failed to delete configuration. ${errorStr}`);
        }
    };

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

    const toggleOutputTokensFilter = (minOut: number) => {
        setModalityFilters((prev) => ({
            ...prev,
            minOutputTokens: prev.minOutputTokens === minOut ? 0 : minOut,
        }));
    };

    const resetFilters = () => {
        setSearchQuery('');
        setModalityFilters(initialModalityFilterState);
    };

    const filteredConfigs = useMemo(() => {
        return configs.filter((config) => {
            const matchesSearch = matchBreakWordRegex(
                searchQuery,
                config.providerName,
                config.baseUrl,
                config.modelName,
                config.contextLength,
                config.maxCompletionTokens
            );

            const matchesModality = matchModalityFilters(config, modalityFilters);

            return matchesSearch && matchesModality;
        });
    }, [configs, searchQuery, modalityFilters]);

    if (loading) {
        return (
            <div className="w-full max-w-3xl">
                <div className="animate-pulse">
                    <div className="h-8 bg-zinc-700 rounded-sm w-1/3 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-zinc-800 rounded-sm"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100 py-2">OpenAI Compatible Model Settings</h2>
                        <p className="text-zinc-400 text-sm">Manage your OpenAI-compatible model provider configurations</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <LucidePlus size={18} />
                        <span>Add Configuration</span>
                    </button>
                </div>

                <div className="mb-4 bg-blue-950/60 border border-blue-800 text-blue-300 p-2.5 rounded text-sm">
                    <label className="font-bold mr-2">
                        Info:
                    </label>
                    <a
                        href="https://opencode.ai/docs/providers/#openrouter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-400 hover:text-blue-300"
                    >
                        View OpenAI Compatible Providers Documentation
                    </a>
                </div>

                {/* Search & filter toolbar */}
                {configs.length > 0 && (
                    <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-900/80 p-3 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search configurations (regex word break e.g. 'openrouter llama')..."
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 pl-9 pr-8 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                                    hasActiveModalityFilters(modalityFilters) || showFilters
                                        ? 'bg-blue-950 border-blue-600 text-blue-200'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                                }`}
                            >
                                <Filter className="h-3.5 w-3.5" />
                                <span>Modalities</span>
                                {hasActiveModalityFilters(modalityFilters) && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                )}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs">
                                <div>
                                    <span className="text-zinc-400 font-semibold mr-2">Input:</span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
                                        {[
                                            { key: 'inputText', label: 'Text' },
                                            { key: 'inputImage', label: 'Image' },
                                            { key: 'inputAudio', label: 'Audio' },
                                            { key: 'inputVideo', label: 'Video' },
                                        ].map((item) => {
                                            const active = modalityFilters[item.key as keyof ModalityFilterState];
                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => toggleModalityFilter(item.key as keyof ModalityFilterState)}
                                                    className={`px-2 py-0.5 rounded-full border transition-colors ${
                                                        active
                                                            ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-zinc-400 font-semibold mr-2">Output:</span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
                                        {[
                                            { key: 'outputText', label: 'Text' },
                                            { key: 'outputImage', label: 'Image' },
                                            { key: 'outputAudio', label: 'Audio' },
                                            { key: 'outputVideo', label: 'Video' },
                                            { key: 'outputEmbedding', label: 'Embedding' },
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
                                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-zinc-400 font-semibold mr-2">Context Window:</span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
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
                                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-zinc-400 font-semibold mr-2">Max Output Tokens:</span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
                                        {[
                                            { tokens: 4096, label: '≥ 4k' },
                                            { tokens: 8192, label: '≥ 8k' },
                                            { tokens: 16384, label: '≥ 16k' },
                                        ].map((item) => {
                                            const active = modalityFilters.minOutputTokens === item.tokens;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={() => toggleOutputTokensFilter(item.tokens)}
                                                    className={`px-2 py-0.5 rounded-full border transition-colors ${
                                                        active
                                                            ? 'bg-purple-950 border-purple-500 text-purple-200'
                                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                                        }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {(hasActiveModalityFilters(modalityFilters) || searchQuery) && (
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="text-xs text-red-400 hover:text-red-300 underline"
                                        >
                                            Reset all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {configs.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900 rounded-sm shadow-sm border border-zinc-800">
                    <div className="w-16 h-16 bg-blue-950/60 border border-blue-800 rounded-sm flex items-center justify-center mx-auto mb-4">
                        <LucidePlus className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">No configurations yet</h3>
                    <p className="text-sm text-zinc-400 mb-6">Create your first OpenAI-compatible model configuration to get started!</p>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
                    >
                        Create Now
                    </button>
                </div>
            ) : filteredConfigs.length === 0 ? (
                <div className="text-center py-8 bg-zinc-900 rounded-sm border border-zinc-800 text-zinc-400">
                    <p className="text-sm">No configurations matched your search or filters.</p>
                    <button
                        onClick={resetFilters}
                        className="mt-2 text-xs text-blue-400 hover:underline"
                    >
                        Clear search & filters
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                        Showing <span className="font-semibold text-zinc-200">{filteredConfigs.length}</span> of{' '}
                        <span className="font-semibold text-zinc-200">{configs.length}</span> configuration(s):
                    </p>
                    {filteredConfigs.map((config) => {
                        const ctxLen = config.contextLength || 0;
                        const maxTokens = config.maxCompletionTokens || 0;

                        return (
                            <div key={config._id} className="bg-zinc-900 rounded-sm shadow-md p-4 border border-zinc-700 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {config.providerName && (
                                                <h3 className="text-lg font-bold text-zinc-100">{config.providerName}</h3>
                                            )}
                                            {ctxLen > 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800">
                                                    ctx: {formatContextLength(ctxLen)}
                                                </span>
                                            )}
                                            {maxTokens > 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                                                    out: {formatMaxCompletionTokens(maxTokens)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-semibold text-zinc-300">Base URL:</span>
                                                <span className="ml-2 text-zinc-400 font-mono">{config.baseUrl}</span>
                                            </div>
                                            {config.modelName && (
                                                <div>
                                                    <span className="font-semibold text-zinc-300">Model Name:</span>
                                                    <span className="ml-2 text-zinc-400 font-mono">{config.modelName}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-semibold text-zinc-300">API Key:</span>
                                                <span className="ml-2 text-zinc-400 font-mono">••••••••••••••••</span>
                                            </div>
                                            {config.customHeaders && (
                                                <div>
                                                    <span className="font-semibold text-zinc-300">Custom Headers:</span>
                                                    <pre className="ml-2 text-zinc-400 text-xs mt-1 bg-zinc-950 p-2 rounded overflow-x-auto">
                                                        {config.customHeaders}
                                                    </pre>
                                                </div>
                                            )}
                                            {/* Display Modalities */}
                                            <div className="mt-3 pt-3 border-t border-zinc-700">
                                                <div className="flex flex-wrap gap-4">
                                                    <div>
                                                        <span className="font-semibold text-zinc-300 text-xs">Input:</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {config.isInputModalityText === 'true' && (
                                                                <span className="px-2 py-0.5 bg-green-950 text-green-300 border border-green-800 rounded text-xs">Text</span>
                                                            )}
                                                            {config.isInputModalityImage === 'true' && (
                                                                <span className="px-2 py-0.5 bg-green-950 text-green-300 border border-green-800 rounded text-xs">Image</span>
                                                            )}
                                                            {config.isInputModalityAudio === 'true' && (
                                                                <span className="px-2 py-0.5 bg-green-950 text-green-300 border border-green-800 rounded text-xs">Audio</span>
                                                            )}
                                                            {config.isInputModalityVideo === 'true' && (
                                                                <span className="px-2 py-0.5 bg-green-950 text-green-300 border border-green-800 rounded text-xs">Video</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-zinc-300 text-xs">Output:</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {config.isOutputModalityText === 'true' && (
                                                                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-xs">Text</span>
                                                            )}
                                                            {config.isOutputModalityImage === 'true' && (
                                                                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-xs">Image</span>
                                                            )}
                                                            {config.isOutputModalityAudio === 'true' && (
                                                                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-xs">Audio</span>
                                                            )}
                                                            {config.isOutputModalityVideo === 'true' && (
                                                                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-xs">Video</span>
                                                            )}
                                                            {config.isOutputModalityEmbedding === 'true' && (
                                                                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-xs">Embedding</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 sm:flex-col">
                                        <button
                                            onClick={() => openModal(config)}
                                            className="p-2 text-blue-400 hover:bg-zinc-800 rounded-sm transition-colors"
                                            title="Edit"
                                        >
                                            <LucideEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleCopy(config)}
                                            className="p-2 text-green-400 hover:bg-zinc-800 rounded-sm transition-colors"
                                            title="Copy"
                                        >
                                            <LucideCopy size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(config)}
                                            className="p-2 text-red-400 hover:bg-zinc-800 rounded-sm transition-colors"
                                            title="Delete"
                                        >
                                            <LucideTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <OpenaiCompatibleModelModal
                isOpen={modalOpen}
                onClose={closeModal}
                editingConfig={editingConfig}
                onSuccess={fetchConfigs}
            />
        </div>
    );
};

export default OpenaiCompatibleModel;
