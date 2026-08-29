import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, X, Filter, ExternalLink, Zap, Edit, Wifi } from 'lucide-react';
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
import { tsSchemaAiModelListGroq } from '../../../../types/pages/settings/dataModelGroq';
import GroqModelModal from './GroqModelModal';

const GroqModelList: React.FC = () => {
    const navigate = useNavigate();
    const [models, setModels] = useState<tsSchemaAiModelListGroq[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

    // Edit modal state
    const [editingModel, setEditingModel] = useState<tsSchemaAiModelListGroq | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [modalityFilters, setModalityFilters] = useState<ModalityFilterState>(initialModalityFilterState);
    const [showFilters, setShowFilters] = useState(false);
    const [healthLatency, setHealthLatency] = useState<number | null>(null);
    const [healthPinging, setHealthPinging] = useState(false);

    // Fetch models on component mount
    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await axiosCustom.get('/api/dynamic-data/model-groq/modelGroqGet');
            const docs = (response.data.docs || []) as tsSchemaAiModelListGroq[];
            docs.sort((a, b) => a.id.localeCompare(b.id));
            setModels(docs);
            setError('');
        } catch (err) {
            setError('Failed to fetch GROQ models');
            console.error(err);
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshModels = async () => {
        try {
            setLoading(true);
            await axiosCustom.post('/api/dynamic-data/model-groq/modelGroqPullAll');
            setError('');
            await fetchModels();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to refresh GROQ models');
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

    const formatDate = (timestamp: number): string => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    };

    const useModel = async (modelId: string) => {
        try {
            setLoading(true);
            const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd', {
                isPersonalContextEnabled: false,
                isAutoAiContextSelectEnabled: false,
                aiModelProvider: 'groq',
                aiModelName: modelId,
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

    const openEditModal = (model: tsSchemaAiModelListGroq) => {
        setEditingModel(model);
        setModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingModel(null);
        setModalOpen(false);
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

    const filteredModels = useMemo(() => {
        return models.filter((model) => {
            const matchesSearch = matchBreakWordRegex(
                searchQuery,
                model.id,
                model.owned_by,
                model.object,
                model.context_window,
                model.contextLength,
                model.maxCompletionTokens
            );

            const matchesModality = matchModalityFilters(model, modalityFilters);

            return matchesSearch && matchesModality;
        });
    }, [models, searchQuery, modalityFilters]);

    const handleHealthPing = async () => {
        setHealthPinging(true);
        const start = Date.now();
        try {
            const res = await axiosCustom.get('/api/user/api-keys/providerHealthPing');
            const ms = res.data.latencyMs ?? (Date.now() - start);
            setHealthLatency(ms);
            toast.success(`Ping ${ms}ms`);
        } catch {
            try {
                const res2 = await axiosCustom.get('/api/dashboard/crud/test-connection');
                const ms2 = res2.data.latencyMs ?? (Date.now() - start);
                setHealthLatency(ms2);
                toast.success(`Ping ${ms2}ms`);
            } catch {
                toast.error('Health ping failed');
            }
        } finally {
            setHealthPinging(false);
        }
    };

    return (
        <div className="groq-model-list w-full max-w-4xl">
            <Helmet><title>GROQ Models - Settings</title></Helmet>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
                    <span className="text-orange-500">GROQ</span> Model Manager
                    <Zap className="w-5 h-5 text-orange-400 fill-orange-500" />
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">{filteredModels.length}/{models.length}</span>
                </h2>
                <button type="button" onClick={() => { void handleHealthPing(); }} disabled={healthPinging} className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50" aria-label="Provider health ping"><Wifi className="h-3 w-3" />{healthPinging ? "Pinging..." : healthLatency !== null ? `${healthLatency}ms` : "Health ping"}</button>
            </div>

            {error && (
                <div className="text-red-400 mb-2 p-2 bg-red-950 border border-red-800 rounded-md">
                    {error}
                </div>
            )}

            {/* How-to & Link banner */}
            <div className="mb-3 sm:mb-4 rounded-lg border border-orange-800/60 bg-orange-950/40 p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-semibold text-orange-200">⚡ Ultra-Fast LPU Inference</h3>
                        <p className="text-xs text-orange-300/90 mt-0.5">
                            Browse high-throughput models powered by GROQ LPU hardware.
                        </p>
                    </div>
                    <a
                        href="https://console.groq.com/docs/models"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-100 underline whitespace-nowrap"
                    >
                        <span>console.groq.com/docs/models</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* Search and filter toolbar */}
            <div className="mb-3 rounded-lg border border-zinc-700 bg-zinc-900/80 p-3 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search GROQ models (regex word break e.g. 'llama 70b', 'whisper')..."
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 pl-9 pr-8 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                                    ? 'bg-orange-950 border-orange-600 text-orange-200'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                            }`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>Filters</span>
                            {hasActiveModalityFilters(modalityFilters) && (
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            )}
                        </button>

                        <button
                            onClick={refreshModels}
                            disabled={loading}
                            className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
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
                                    { key: 'inputImage', label: 'Vision / Image' },
                                    { key: 'inputAudio', label: 'Audio / Whisper' },
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
                                    { key: 'outputAudio', label: 'Audio' },
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-1"></div>
                        <p className="text-zinc-400">Loading GROQ models...</p>
                    </div>
                ) : filteredModels.length === 0 ? (
                    <div className="text-center py-6 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">
                        <p className="text-sm sm:text-base">
                            {models.length === 0
                                ? 'No models found. Click "Refresh Models" above to fetch from GROQ.'
                                : 'No models matched your search or filters.'}
                        </p>
                        {models.length > 0 && (
                            <button
                                onClick={resetFilters}
                                className="mt-2 text-xs text-orange-400 hover:underline"
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
                                const isExpanded = expandedModels.has(model.id);
                                const rawData = (model as any).raw || {};
                                const ctxLen = model.contextLength || model.context_window || 0;
                                const maxTokens = model.maxCompletionTokens || 0;

                                return (
                                    <li
                                        key={model.id}
                                        className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 gap-1 sm:gap-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                    <span className="font-medium text-zinc-100 break-all">{model.id}</span>
                                                    {model.owned_by && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                                            {model.owned_by}
                                                        </span>
                                                    )}

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

                                                    {model.isInputModalityAudio === 'true' && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
                                                            Audio / Whisper
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => toggleExpanded(model.id)}
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

                                                <div className="text-xs text-zinc-400 flex items-center gap-3">
                                                    <span>Active: {model.active !== false ? 'Yes' : 'No'}</span>
                                                    {model.created ? (
                                                        <span>Created: {formatDate(model.created)}</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 self-start sm:self-auto ml-0 sm:ml-3">
                                                <button
                                                    onClick={() => openEditModal(model)}
                                                    className="p-1.5 text-zinc-400 hover:text-orange-300 hover:bg-zinc-800 rounded-md transition-colors"
                                                    title="Edit model specs"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => useModel(model.id)}
                                                    disabled={loading}
                                                    className="px-2.5 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                                >
                                                    Use Model
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-zinc-800 bg-zinc-950 px-3 py-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="font-medium text-zinc-300">Owned by:</span>
                                                        <div className="text-zinc-400 text-xs mt-0.5">{model.owned_by || 'GROQ'}</div>
                                                    </div>

                                                    <div>
                                                        <span className="font-medium text-zinc-300">Object Type:</span>
                                                        <div className="text-zinc-400 text-xs mt-0.5 font-mono">{model.object || 'model'}</div>
                                                    </div>

                                                    <div>
                                                        <span className="font-medium text-zinc-300">Context Window:</span>
                                                        <div className="text-zinc-400 text-xs mt-0.5 font-mono">
                                                            {ctxLen > 0 ? `${ctxLen.toLocaleString()} tokens (${formatContextLength(ctxLen)})` : 'Not specified'}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="font-medium text-zinc-300">Max Output Tokens:</span>
                                                        <div className="text-zinc-400 text-xs mt-0.5 font-mono">
                                                            {maxTokens > 0 ? `${maxTokens.toLocaleString()} tokens (${formatMaxCompletionTokens(maxTokens)})` : 'Not specified'}
                                                        </div>
                                                    </div>

                                                    {/* Input Modalities */}
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <span className="font-medium text-zinc-300">Input Modalities:</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {[
                                                                { key: 'isInputModalityText', label: 'Text' },
                                                                { key: 'isInputModalityImage', label: 'Image / Vision' },
                                                                { key: 'isInputModalityAudio', label: 'Audio / Whisper' },
                                                                { key: 'isInputModalityVideo', label: 'Video' },
                                                            ].map(({ key, label }) => {
                                                                const supported = (model as any)[key] === 'true';
                                                                return (
                                                                    <span
                                                                        key={key}
                                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                            supported
                                                                                ? 'bg-green-950 text-green-300 border border-green-800'
                                                                                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                                                        }`}
                                                                    >
                                                                        {label}: {supported ? 'Yes' : 'No'}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Output Modalities */}
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <span className="font-medium text-zinc-300">Output Modalities:</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {[
                                                                { key: 'isOutputModalityText', label: 'Text' },
                                                                { key: 'isOutputModalityImage', label: 'Image' },
                                                                { key: 'isOutputModalityAudio', label: 'Audio' },
                                                                { key: 'isOutputModalityVideo', label: 'Video' },
                                                                { key: 'isOutputModalityEmbedding', label: 'Embedding' },
                                                            ].map(({ key, label }) => {
                                                                const supported = (model as any)[key] === 'true';
                                                                return (
                                                                    <span
                                                                        key={key}
                                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                            supported
                                                                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                                                                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                                                        }`}
                                                                    >
                                                                        {label}: {supported ? 'Yes' : 'No'}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {rawData.public_apps && typeof rawData.public_apps === 'object' && Object.keys(rawData.public_apps).length > 0 && (
                                                        <div className="col-span-1 sm:col-span-2">
                                                            <span className="font-medium text-zinc-300">Public Apps:</span>
                                                            <div className="text-zinc-400 font-mono text-xs mt-0.5">
                                                                {JSON.stringify(rawData.public_apps)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="col-span-1 sm:col-span-2">
                                                        <span className="font-medium text-zinc-300">Model ID:</span>
                                                        <div className="text-zinc-400 font-mono text-xs break-all mt-0.5">{model.id}</div>
                                                    </div>
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

            <GroqModelModal
                isOpen={modalOpen}
                onClose={closeEditModal}
                editingModel={editingModel}
                onSuccess={fetchModels}
            />
        </div>
    );
};

const GroqModelListWrapper = () => {
    const userAuth = useAtomValue(stateJotaiAuthAtom);

    return (
        <div>
            {userAuth.apiKeyGroqValid ? (
                <GroqModelList />
            ) : (
                <div className="w-full max-w-4xl">
                    <div className="text-center py-4 sm:py-6 bg-red-950 border border-red-800 rounded-lg p-3">
                        <p className="text-sm sm:text-base text-zinc-200">
                            Please set your GROQ API key in the <Link
                                to="/user/setting/api-key"
                                className='text-blue-400 hover:text-blue-300 underline font-semibold'
                            >API Keys</Link> page to manage GROQ models.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroqModelListWrapper;
