import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { LucidePlus, LucideEdit, LucideTrash } from 'lucide-react';
import toast from 'react-hot-toast';

import { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import SettingHeader from "../SettingHeader";
import OpenaiCompatibleModelModal from "./OpenaiCompatibleModelModal";

interface IOpenaiCompatibleModel {
    _id: string;
    providerName?: string;
    baseUrl: string;
    apiKey: string;
    modelName?: string;
    customHeaders?: string;
    createdAt?: Date;
    isInputModalityText?: string;
    isInputModalityImage?: string;
    isInputModalityAudio?: string;
    isInputModalityVideo?: string;
    isOutputModalityText?: string;
    isOutputModalityImage?: string;
    isOutputModalityAudio?: string;
    isOutputModalityVideo?: string;
}

const OpenaiCompatibleModel = () => {
    const [configs, setConfigs] = useState<IOpenaiCompatibleModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingConfig, setEditingConfig] = useState<IOpenaiCompatibleModel | null>(null);

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
            // Don't show error if endpoint doesn't exist yet
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

    const maskApiKey = (key: string) => {
        if (!key || key.length < 8) return '••••••••';
        return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
    };

    if (loading) {
        return (
            <div
                className="p-4"
                style={{
                    maxWidth: '800px',
                    margin: '0 auto'
                }}
            >
                <SettingHeader />
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded-sm w-1/3 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-sm"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="p-4"
            style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}
        >
            <SettingHeader />

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 py-2">OpenAI Compatible Model Settings</h2>
                        <p className="text-gray-600 text-sm">Manage your OpenAI-compatible model provider configurations</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <LucidePlus size={18} />
                        <span>Add Configuration</span>
                    </button>
                </div>

                <div className="mb-4 bg-blue-100 text-blue-400 p-2 rounded">
                    <label className="font-bold mb-2">
                        Info:
                    </label>
                    <a
                        href="https://opencode.ai/docs/providers/#openrouter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline px-2"
                    >
                        View OpenAI Compatible Providers Documentation
                    </a>
                </div>
            </div>

            {configs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-sm shadow-sm">
                    <div className="w-16 h-16 bg-blue-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                        <LucidePlus className="text-blue-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No configurations yet</h3>
                    <p className="text-sm text-gray-600 mb-6">Create your first OpenAI-compatible model configuration to get started!</p>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
                    >
                        Create Now
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {configs.map((config) => (
                        <div key={config._id} className="bg-white rounded-sm shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="flex-1">
                                    {config.providerName && (
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{config.providerName}</h3>
                                    )}
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">Base URL:</span>
                                            <span className="ml-2 text-gray-600 font-mono">{config.baseUrl}</span>
                                        </div>
                                        {config.modelName && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Model Name:</span>
                                                <span className="ml-2 text-gray-600 font-mono">{config.modelName}</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-semibold text-gray-700">API Key:</span>
                                            <span className="ml-2 text-gray-600 font-mono">{maskApiKey(config.apiKey)}</span>
                                        </div>
                                        {config.customHeaders && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Custom Headers:</span>
                                                <pre className="ml-2 text-gray-600 text-xs mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                                    {config.customHeaders}
                                                </pre>
                                            </div>
                                        )}
                                        {/* Display Modalities */}
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-4">
                                                <div>
                                                    <span className="font-semibold text-gray-700 text-xs">Input:</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {config.isInputModalityText === 'true' && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Text</span>
                                                        )}
                                                        {config.isInputModalityImage === 'true' && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Image</span>
                                                        )}
                                                        {config.isInputModalityAudio === 'true' && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Audio</span>
                                                        )}
                                                        {config.isInputModalityVideo === 'true' && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Video</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-700 text-xs">Output:</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {config.isOutputModalityText === 'true' && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Text</span>
                                                        )}
                                                        {config.isOutputModalityImage === 'true' && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Image</span>
                                                        )}
                                                        {config.isOutputModalityAudio === 'true' && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Audio</span>
                                                        )}
                                                        {config.isOutputModalityVideo === 'true' && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Video</span>
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
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                                        title="Edit"
                                    >
                                        <LucideEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(config)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                        title="Delete"
                                    >
                                        <LucideTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
