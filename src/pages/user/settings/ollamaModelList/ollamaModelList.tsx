import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosCustom from '../../../../config/axiosCustom';
import SettingHeader from '../SettingHeader';
import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';
import { useAtomValue } from 'jotai';

interface OllamaModel {
    _id: string;
    username: string;
    modelLabel: string;
    modelName: string;
    isInputModalityText: 'true' | 'false' | 'pending';
    isInputModalityImage: 'true' | 'false' | 'pending';
    isInputModalityAudio: 'true' | 'false' | 'pending';
    isInputModalityVideo: 'true' | 'false' | 'pending';
    raw: any;
};

const OllamaModelList: React.FC = () => {
    const navigate = useNavigate();
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [newModelName, setNewModelName] = useState('');
    const [error, setError] = useState('');
    const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

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
            setModels([]); // Ensure models is always an array
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
            // Refresh the list
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
            // Refresh the list
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
            // Refresh the list
            await fetchModels();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to refresh models');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ollama-model-list p-2 sm:p-3 lg:p-4 max-w-4xl mx-auto">
            <div>
                <SettingHeader />
            </div>

            {/* title */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    <span className="text-blue-600">Ollama</span> Model Manager
                </h2>
            </div>

            {error && (
                <div className="text-red-600 mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            {/* Add new model form */}
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="mb-2">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">💡 How to find model names:</h3>
                    <div className="text-xs text-blue-700 space-y-0.5">
                        <p>Visit <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">ollama.com</a> and browse available models.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 items-stretch sm:items-center">
                    <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="Enter model name (e.g., llama3.1:8b)"
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={addModel}
                        disabled={loading}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                        {loading ? 'Downloading model (may take some time)...' : 'Add Model'}
                    </button>
                </div>
            </div>

            {/* Refresh all models */}
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <button
                    onClick={refreshModels}
                    disabled={loading}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                    Refresh Models
                </button>
            </div>

            {/* Models list */}
            <div className="models-list">
                {loading && models.length === 0 ? (
                    <div className="text-center py-4 sm:py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                        <p className="text-gray-600">Loading models...</p>
                    </div>
                ) : models.length === 0 ? (
                    <div className="text-center py-4 sm:py-6 text-gray-500">
                        <p className="text-sm sm:text-base">No models found. Add a model above to get started.</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-600 mb-1 sm:mb-2">
                            Found <span className="font-semibold text-gray-800">{models.length}</span> model(s):
                        </p>
                        <ul className="space-y-1 sm:space-y-1.5">
                            {models.map((model) => {
                                const isExpanded = expandedModels.has(model._id);
                                const rawData = model.raw || {};

                                return (
                                    <li
                                        key={model._id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 gap-1 sm:gap-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <span className="font-medium text-gray-900 break-all">{model.modelLabel}</span>
                                                    <button
                                                        onClick={() => toggleExpanded(model._id)}
                                                        className="text-gray-500 hover:text-gray-700 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
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
                                                    <div className="text-xs text-gray-500">
                                                        Size: {formatFileSize(rawData.size)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1 self-start sm:self-auto">
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

                                        {isExpanded && rawData && (
                                            <div className="border-t border-gray-100 bg-gray-50 px-2 sm:px-3 py-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                    {rawData.modified_at && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Modified:</span>
                                                            <div className="text-gray-600">{formatDate(rawData.modified_at)}</div>
                                                        </div>
                                                    )}
                                                    {rawData.size && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Size:</span>
                                                            <div className="text-gray-600">{formatFileSize(rawData.size)}</div>
                                                        </div>
                                                    )}
                                                    {rawData.details?.parameter_size && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Parameters:</span>
                                                            <div className="text-gray-600">{rawData.details.parameter_size}</div>
                                                        </div>
                                                    )}
                                                    {rawData.details?.quantization_level && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Quantization:</span>
                                                            <div className="text-gray-600">{rawData.details.quantization_level}</div>
                                                        </div>
                                                    )}

                                                    {/* Input Modalities */}
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <span className="font-medium text-gray-700">Input Modalities:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                model.isInputModalityText === 'true' ? 'bg-green-100 text-green-800' :
                                                                model.isInputModalityText === 'false' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                Text {model.isInputModalityText === 'pending' ? '(pending)' : ''}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                model.isInputModalityImage === 'true' ? 'bg-green-100 text-green-800' :
                                                                model.isInputModalityImage === 'false' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                Image {model.isInputModalityImage === 'pending' ? '(pending)' : ''}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                model.isInputModalityAudio === 'true' ? 'bg-green-100 text-green-800' :
                                                                model.isInputModalityAudio === 'false' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                Audio {model.isInputModalityAudio === 'pending' ? '(pending)' : ''}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                model.isInputModalityVideo === 'true' ? 'bg-green-100 text-green-800' :
                                                                model.isInputModalityVideo === 'false' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                Video {model.isInputModalityVideo === 'pending' ? '(pending)' : ''}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {rawData.details?.family && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Family:</span>
                                                            <div className="text-gray-600">{rawData.details.family}</div>
                                                        </div>
                                                    )}
                                                    {rawData.details?.format && (
                                                        <div>
                                                            <span className="font-medium text-gray-700">Format:</span>
                                                            <div className="text-gray-600">{rawData.details.format}</div>
                                                        </div>
                                                    )}
                                                    {rawData.digest && (
                                                        <div className="col-span-1 sm:col-span-2">
                                                            <span className="font-medium text-gray-700">Digest:</span>
                                                            <div className="text-gray-600 font-mono text-xs break-all">{rawData.digest}</div>
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
                <div className='container mx-auto p-2'>

                    <SettingHeader />

                    <div className="text-center py-4 sm:py-6 bg-red-50 border border-red-200 rounded-lg p-2">
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