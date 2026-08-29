import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Filter, Edit } from 'lucide-react';
import axiosCustom from '../../../../config/axiosCustom';
import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';
import { useAtomValue } from 'jotai';
import {
    matchBreakWordRegex,
    matchModalityFilters,
    initialModalityFilterState,
    hasActiveModalityFilters,
    formatContextLength,
    formatMaxCompletionTokens,
    ModalityFilterState
} from '../../../../utils/modelSearchUtils';
import OllamaModelModal from './OllamaModelModal';

interface OllamaModel {
    _id: string;
    modelLabel: string;
    modelName: string;
    isInputModalityText: 'true' | 'false' | 'pending';
    isInputModalityImage: 'true' | 'false' | 'pending';
    isInputModalityAudio: 'true' | 'false' | 'pending';
    isInputModalityVideo: 'true' | 'false' | 'pending';
    isOutputModalityText: 'true' | 'false' | 'pending';
    isOutputModalityImage: 'true' | 'false' | 'pending';
    isOutputModalityAudio: 'true' | 'false' | 'pending';
    isOutputModalityVideo: 'true' | 'false' | 'pending';
    isOutputModalityEmbedding: 'true' | 'false' | 'pending';
    contextLength?: number;
    maxCompletionTokens?: number;
    raw: any;
}

const OllamaModelList: React.FC = () => {
    const navigate = useNavigate();
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [newModelName, setNewModelName] = useState('');
    const [error, setError] = useState('');
    const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

    // Edit modal state
    const [editingModel, setEditingModel] = useState<OllamaModel | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch models on component mount
    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await axiosCustom.get('/api/dynamic-data/model-ollama/modelOllamaGet');
            setModels(response.data.docs || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch models');
            console.error(err);
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    const addModel = async () => {
        if (!newModelName.trim()) {
            setError('Please enter a model name');
            return;
        }

        try {
            setLoading(true);
            await axiosCustom.post('/api/dynamic-data/model-ollama/modelOllamaAdd', {
                modelName: newModelName.trim()
            });
            setNewModelName('');
            setError('');
            await fetchModels();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add model');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteModel = async (modelName: string) => {
        if (!window.confirm(`Are you sure you want to delete model "${modelName}"?`)) {
            return;
        }

        try {
            setLoading(true);
            await axiosCustom.delete('/api/dynamic-data/model-ollama/modelOllamaDelete', {
                data: { modelName }
            });
            setError('');
            await fetchModels();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete model');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (modelId: string) => {
        const newExpanded = new Set(expandedModels);
        if (newExpanded.has(modelId)) {
            newExpanded.delete(modelId);
        } else {
            newExpanded.add(modelId);
        }
        setExpandedModels(newExpanded);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString();
    };

    const useModel = async (modelName: string) => {
        try {
            setLoading(true);
            const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd', {
                isPersonalContextEnabled: false,
                isAutoAiContextSelectEnabled: false,
                aiModelProvider: 'ollama',
                aiModelName: modelName,
            });

            const threadId = result?.data?.thread?._id;
            if (threadId) {
                const redirectUrl = `/user/chat?id=${threadId}`;
                navigate(redirectUrl);
            } else {
                setError('Failed to create chat thread');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start chat with model');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const refreshModels = async () => {
        try {
            setLoading(true);
            await axiosCustom.post('/api/dynamic-data/model-ollama/modelOllamaPullAll');
            setError('');
            await fetchModels();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to refresh models');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateModality = async (
        _id: string,
        field: keyof OllamaModel,
        value: any
    ) => {
        try {
            setLoading(true);
            await axiosCustom.patch('/api/dynamic-data/model-ollama/modelOllamaUpdate', {
                _id,
                [field]: value,
            });
            setError('');
            await fetchModels();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update model');
            console.error(err);
        } finally {
            setLoading(false);
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

    const openEditModal = (model: OllamaModel) => {
        setEditingModel(model);
        setModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingModel(null);
        setModalOpen(false);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setModalityFilters(initialModalityFilterState);
    };

    // Filtered models using break-word regex search and modality filters
    const filteredModels = useMemo(() => {
        return models.filter((model) => {
            const raw = model.raw || {};
            const matchesSearch = matchBreakWordRegex(
                searchQuery,
                model.modelLabel,
                model.modelName,
                raw.details?.family,
                raw.details?.parameter_size,
                raw.details?.quantization_level,
                model.contextLength,
                model.maxCompletionTokens
            );

            const matchesModality = matchModalityFilters(model, modalityFilters);

            return matchesSearch && matchesModality;
        });
    }, [models, searchQuery, modalityFilters]);

    return (
        <div className="ollama-model-list w-full max-w-4xl">
            {/* title */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                    <span className="text-blue-500">Ollama</span> Model Manager
                </h2>
            </div>

            {error && (
                <div className="text-red-400 mb-2 p-2 bg-red-950 border border-red-800 rounded-md">
                    {error}
                </div>
            )}

            {/* Add new model form */}
            <div className="mb-3 sm:mb-4 rounded-lg border border-blue-800/60 bg-blue-950/40 p-2 sm:p-3">
                <div className="mb-2">
                    <h3 className="mb-1 text-sm font-semibold text-blue-200">💡 How to find model names:</h3>
                    <div className="space-y-0.5 text-xs text-blue-300/90">
                        <p>Visit <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">ollama.com</a> and browse available models.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 items-stretch sm:items-center">
                    <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="Enter model name (e.g., llama3.1:8b)"
                        className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-zinc-100 placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={addModel}
                        disabled={loading}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                        {loading ? 'Downloading...' : 'Add Model'}
                    </button>
                </div>
            </div>

            {/* Refresh & Filter toolbar */}
            <div className="mb-3 rounded-lg border border-zinc-700 bg-zinc-900/80 p-3 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search models (regex word break e.g. 'llama 8b')..."
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

                    <div className="flex items-center gap-2">
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
                            <span>Filters</span>
                            {hasActiveModalityFilters(modalityFilters) && (
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                        </button>

                        <button
                            onClick={refreshModels}
                            disabled={loading}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                            Refresh Models
                        </button>
                    </div>
                </div>

                {/* Modality Filter Chips */}
                {showFilters && (
                    <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs">
                        <div>
                            <span className="text-zinc-400 font-semibold mr-2">Input Modalities:</span>
                            <div className="inline-flex flex-wrap gap-1 mt-1">
                                {[
                                    { key: 'inputText', label: 'Text' },
                                    { key: 'inputImage', label: 'Image / Vision' },
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
                            <span className="text-zinc-400 font-semibold mr-2">Output Modalities:</span>
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

            {/* Models list */}
            <div className="models-list">
                {loading && models.length === 0 ? (
                    <div className="text-center py-4 sm:py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                        <p className="text-zinc-400">Loading models...</p>
                    </div>
                ) : filteredModels.length === 0 ? (
                    <div className="text-center py-6 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">
                        <p className="text-sm sm:text-base">
                            {models.length === 0
                                ? 'No models found. Add a model above to get started.'
                                : 'No models matched your search or filters.'}
                        </p>
                        {models.length > 0 && (
                            <button
                                onClick={resetFilters}
                                className="mt-2 text-xs text-blue-400 hover:underline"
                            >
                                Clear search & filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between text-sm text-zinc-400 mb-1 sm:mb-2">
                            <p>
                                Showing <span className="font-semibold text-zinc-200">{filteredModels.length}</span> of{' '}
                                <span className="font-semibold text-zinc-200">{models.length}</span> model(s):
                            </p>
                        </div>
                        <ul className="space-y-1 sm:space-y-1.5">
                            {filteredModels.map((model) => {
                                const isExpanded = expandedModels.has(model._id);
                                const rawData = model.raw || {};
                                const ctxLen = model.contextLength || 0;
                                const maxTokens = model.maxCompletionTokens || 0;

                                return (
                                    <li
                                        key={model._id}
                                        className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 gap-1 sm:gap-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                    <span className="font-medium text-zinc-100 break-all">{model.modelLabel}</span>
                                                    
                                                    {ctxLen > 0 && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                                                            ctx: {formatContextLength(ctxLen)}
                                                        </span>
                                                    )}

                                                    {maxTokens > 0 && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                                                            out: {formatMaxCompletionTokens(maxTokens)}
                                                        </span>
                                                    )}

                                                    {model.isInputModalityImage === 'true' && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                                                            Vision
                                                        </span>
                                                    )}

                                                    {model.isOutputModalityEmbedding === 'true' && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
                                                            Embedding
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => toggleExpanded(model._id)}
                                                        className="text-zinc-400 hover:text-zinc-300 p-0.5 rounded-md hover:bg-zinc-800 transition-colors"
                                                        title={isExpanded ? 'Collapse details' : 'Expand details'}
                                                    >
                                                        <svg
                                                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {rawData.size && (
                                                    <div className="text-xs text-zinc-400">
                                                        Size: {formatFileSize(rawData.size)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1.5 self-start sm:self-auto items-center">
                                                <button
                                                    onClick={() => openEditModal(model)}
                                                    className="p-1.5 text-zinc-400 hover:text-blue-300 hover:bg-zinc-800 rounded-md transition-colors"
                                                    title="Edit model specs"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => useModel(model.modelName)}
                                                    disabled={loading}
                                                    className="px-2 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Use Model
                                                </button>
                                                <button
                                                    onClick={() => deleteModel(model.modelName)}
                                                    disabled={loading}
                                                    className="px-2 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-zinc-800 bg-zinc-950 px-3 py-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    {rawData.modified_at && (
                                                        <div>
                                                            <span className="font-medium text-zinc-300">Modified:</span>
                                                            <div className="text-zinc-400">{formatDate(rawData.modified_at)}</div>
                                                        </div>
                                                    )}
                                                    {rawData.size && (
                                                        <div>
                                                            <span className="font-medium text-zinc-300">Size:</span>
                                                            <div className="text-zinc-400">{formatFileSize(rawData.size)}</div>
                                                        </div>
                                                    )}
                                                    {rawData.details?.parameter_size && (
                                                        <div>
                                                            <span className="font-medium text-zinc-300">Parameters:</span>
                                                            <div className="text-zinc-400">{rawData.details.parameter_size}</div>
                                                        </div>
                                                    )}
                                                    {rawData.details?.quantization_level && (
                                                        <div>
                                                            <span className="font-medium text-zinc-300">Quantization:</span>
                                                            <div className="text-zinc-400">{rawData.details.quantization_level}</div>
                                                        </div>
                                                    )}

                                                    {/* Context Length */}
                                                    <div>
                                                        <span className="font-medium text-zinc-300">Context Length:</span>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={model.contextLength || 0}
                                                                onChange={(e) => updateModality(model._id, 'contextLength', parseInt(e.target.value) || 0)}
                                                                disabled={loading}
                                                                className="w-28 text-xs border border-zinc-700 rounded px-2 py-1 bg-zinc-800 text-zinc-200 focus:ring-1 focus:ring-blue-500"
                                                            />
                                                            {ctxLen > 0 && (
                                                                <span className="text-xs text-purple-300 font-mono">
                                                                    ({formatContextLength(ctxLen)} tokens)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Max Completion Tokens */}
                                                    <div>
                                                        <span className="font-medium text-zinc-300">Max Completion Tokens:</span>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={model.maxCompletionTokens || 0}
                                                                onChange={(e) => updateModality(model._id, 'maxCompletionTokens', parseInt(e.target.value) || 0)}
                                                                disabled={loading}
                                                                className="w-28 text-xs border border-zinc-700 rounded px-2 py-1 bg-zinc-800 text-zinc-200 focus:ring-1 focus:ring-blue-500"
                                                            />
                                                            {maxTokens > 0 && (
                                                                <span className="text-xs text-indigo-300 font-mono">
                                                                    ({formatMaxCompletionTokens(maxTokens)} tokens)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Input Modalities */}
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <span className="font-medium text-zinc-300">Input Modalities:</span>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                                                            {[
                                                                { key: 'isInputModalityText', label: 'Text' },
                                                                { key: 'isInputModalityImage', label: 'Image' },
                                                                { key: 'isInputModalityAudio', label: 'Audio' },
                                                                { key: 'isInputModalityVideo', label: 'Video' },
                                                            ].map(({ key, label }) => {
                                                                const val = (model as any)[key] || 'false';
                                                                return (
                                                                    <div key={key} className="flex items-center gap-1.5">
                                                                        <span className="text-xs text-zinc-400">{label}:</span>
                                                                        <select
                                                                            value={val}
                                                                            onChange={(e) => updateModality(model._id, key as keyof OllamaModel, e.target.value)}
                                                                            disabled={loading}
                                                                            className="text-xs border border-zinc-700 rounded px-1.5 py-0.5 bg-zinc-800 text-zinc-200"
                                                                        >
                                                                            <option value="true">true</option>
                                                                            <option value="false">false</option>
                                                                            <option value="pending">pending</option>
                                                                        </select>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Output Modalities */}
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <span className="font-medium text-zinc-300">Output Modalities:</span>
                                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
                                                            {[
                                                                { key: 'isOutputModalityText', label: 'Text' },
                                                                { key: 'isOutputModalityImage', label: 'Image' },
                                                                { key: 'isOutputModalityAudio', label: 'Audio' },
                                                                { key: 'isOutputModalityVideo', label: 'Video' },
                                                                { key: 'isOutputModalityEmbedding', label: 'Embedding' },
                                                            ].map(({ key, label }) => {
                                                                const val = (model as any)[key] || 'false';
                                                                return (
                                                                    <div key={key} className="flex items-center gap-1.5">
                                                                        <span className="text-xs text-zinc-400">{label}:</span>
                                                                        <select
                                                                            value={val}
                                                                            onChange={(e) => updateModality(model._id, key as keyof OllamaModel, e.target.value)}
                                                                            disabled={loading}
                                                                            className="text-xs border border-zinc-700 rounded px-1.5 py-0.5 bg-zinc-800 text-zinc-200"
                                                                        >
                                                                            <option value="true">true</option>
                                                                            <option value="false">false</option>
                                                                            <option value="pending">pending</option>
                                                                        </select>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {rawData.details?.family && (
                                                        <div>
                                                            <span className="font-medium text-zinc-300">Family:</span>
                                                            <div className="text-zinc-400">{rawData.details.family}</div>
                                                        </div>
                                                    )}
                                                    {rawData.details?.format && (
                                                        <div>
                                                            <span className="font-medium text-zinc-300">Format:</span>
                                                            <div className="text-zinc-400">{rawData.details.format}</div>
                                                        </div>
                                                    )}
                                                    {rawData.digest && (
                                                        <div className="col-span-1 sm:col-span-2">
                                                            <span className="font-medium text-zinc-300">Digest:</span>
                                                            <div className="text-zinc-400 font-mono text-xs break-all">{rawData.digest}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            <OllamaModelModal
                isOpen={modalOpen}
                onClose={closeEditModal}
                editingModel={editingModel}
                onSuccess={fetchModels}
            />
        </div>
    );
};

const OllamaModelListWrapper = () => {
    const userAuth = useAtomValue(stateJotaiAuthAtom);

    return (
        <div>
            {userAuth.apiKeyOllamaValid ? (
                <OllamaModelList />
            ) : (
                <div className="w-full max-w-4xl">
                    <div className="text-center py-4 sm:py-6 bg-red-950 border border-red-800 rounded-lg p-2">
                        <p className="text-sm sm:text-base">
                            Please set the Ollama API key in the <Link
                                to="/user/setting/api-key"
                                className='text-blue-500 hover:text-blue-700'
                            >API Keys</Link> page.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OllamaModelListWrapper;
