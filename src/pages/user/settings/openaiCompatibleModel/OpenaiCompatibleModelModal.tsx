import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { LucideX } from 'lucide-react';
import { useSetAtom } from "jotai";
import { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';

interface IOpenaiCompatibleModel {
    _id: string;
    providerName?: string;
    baseUrl: string;
    apiKey?: string; // Optional - not returned from server
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

interface OpenaiCompatibleModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingConfig: IOpenaiCompatibleModel | null;
    onSuccess: () => void;
}

const OpenaiCompatibleModelModal = ({ isOpen, onClose, editingConfig, onSuccess }: OpenaiCompatibleModelModalProps) => {
    const [formData, setFormData] = useState({
        providerName: '',
        baseUrl: '',
        apiKey: '',
        modelName: '',
        customHeaders: '',
        isInputModalityText: 'false',
        isInputModalityImage: 'false',
        isInputModalityAudio: 'false',
        isInputModalityVideo: 'false',
        isOutputModalityText: 'false',
        isOutputModalityImage: 'false',
        isOutputModalityAudio: 'false',
        isOutputModalityVideo: 'false',
    });
    const [loading, setLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    useEffect(() => {
        if (editingConfig) {
            setFormData({
                providerName: editingConfig.providerName || '',
                baseUrl: editingConfig.baseUrl || '',
                apiKey: editingConfig.apiKey || '',
                modelName: editingConfig.modelName || '',
                customHeaders: editingConfig.customHeaders || '',

                // modalities
                isInputModalityText: editingConfig.isInputModalityText || 'true',
                isInputModalityImage: editingConfig.isInputModalityImage || 'false',
                isInputModalityAudio: editingConfig.isInputModalityAudio || 'false',
                isInputModalityVideo: editingConfig.isInputModalityVideo || 'false',
                isOutputModalityText: editingConfig.isOutputModalityText || 'true',
                isOutputModalityImage: editingConfig.isOutputModalityImage || 'false',
                isOutputModalityAudio: editingConfig.isOutputModalityAudio || 'false',
                isOutputModalityVideo: editingConfig.isOutputModalityVideo || 'false',
            });
        } else {
            setFormData({
                providerName: '',
                baseUrl: '',
                apiKey: '',
                modelName: '',
                customHeaders: '',
                isInputModalityText: 'true',
                isInputModalityImage: 'false',
                isInputModalityAudio: 'false',
                isInputModalityVideo: 'false',
                isOutputModalityText: 'true',
                isOutputModalityImage: 'false',
                isOutputModalityAudio: 'false',
                isOutputModalityVideo: 'false',
            });
        }
    }, [editingConfig]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate base URL
        if (!formData.baseUrl.trim()) {
            toast.error('Base URL is required');
            return;
        }

        // Validate API Key (only required for new configs, optional for edits)
        if (!editingConfig && !formData.apiKey.trim()) {
            toast.error('API Key is required');
            return;
        }

        // Validate custom headers JSON if provided
        if (formData.customHeaders.trim()) {
            try {
                JSON.parse(formData.customHeaders);
            } catch (e) {
                toast.error('Custom Headers must be valid JSON');
                return;
            }
        }

        // Validate modalities: at least one input and one output must be selected
        const hasInputModality = formData.isInputModalityText === 'true' || 
                                 formData.isInputModalityImage === 'true' || 
                                 formData.isInputModalityAudio === 'true' || 
                                 formData.isInputModalityVideo === 'true';
        const hasOutputModality = formData.isOutputModalityText === 'true' || 
                                  formData.isOutputModalityImage === 'true' || 
                                  formData.isOutputModalityAudio === 'true' || 
                                  formData.isOutputModalityVideo === 'true';
        
        if (!hasInputModality) {
            toast.error('At least one input modality must be selected');
            return;
        }
        
        if (!hasOutputModality) {
            toast.error('At least one output modality must be selected');
            return;
        }

        setLoading(true);
        
        try {
            const config = {
                method: 'post',
                url: editingConfig 
                    ? '/api/user/openai-compatible-model/crud/openaiCompatibleModelEdit'
                    : '/api/user/openai-compatible-model/crud/openaiCompatibleModelAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: editingConfig 
                    ? { 
                        _id: editingConfig._id,
                        providerName: formData.providerName.trim() || undefined,
                        baseUrl: formData.baseUrl.trim(),
                        // Only send apiKey if it's been changed (not empty)
                        ...(formData.apiKey.trim() ? { apiKey: formData.apiKey.trim() } : {}),
                        modelName: formData.modelName.trim() || undefined,
                        customHeaders: formData.customHeaders.trim() || undefined,
                        isInputModalityText: formData.isInputModalityText,
                        isInputModalityImage: formData.isInputModalityImage,
                        isInputModalityAudio: formData.isInputModalityAudio,
                        isInputModalityVideo: formData.isInputModalityVideo,
                        isOutputModalityText: formData.isOutputModalityText,
                        isOutputModalityImage: formData.isOutputModalityImage,
                        isOutputModalityAudio: formData.isOutputModalityAudio,
                        isOutputModalityVideo: formData.isOutputModalityVideo,
                    }
                    : {
                        providerName: formData.providerName.trim() || undefined,
                        baseUrl: formData.baseUrl.trim(),
                        apiKey: formData.apiKey.trim(), // Required for new configs
                        modelName: formData.modelName.trim() || undefined,
                        customHeaders: formData.customHeaders.trim() || undefined,
                        isInputModalityText: formData.isInputModalityText,
                        isInputModalityImage: formData.isInputModalityImage,
                        isInputModalityAudio: formData.isInputModalityAudio,
                        isInputModalityVideo: formData.isInputModalityVideo,
                        isOutputModalityText: formData.isOutputModalityText,
                        isOutputModalityImage: formData.isOutputModalityImage,
                        isOutputModalityAudio: formData.isOutputModalityAudio,
                        isOutputModalityVideo: formData.isOutputModalityVideo,
                    },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            
            toast.success(editingConfig ? 'Configuration updated successfully!' : 'Configuration created successfully!');
            onSuccess();
            onClose();
            
            const randomNum = Math.floor(Math.random() * 1_000_000);
            setAuthStateReload(randomNum);
        } catch (error: any) {
            console.error(error);
            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                errorStr = error?.response?.data?.error;
            }
            toast.error(`Failed to save configuration. ${errorStr}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provider Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.providerName}
                            onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., OpenRouter, LM Studio, Local LLM"
                            disabled={loading}
                        />
                        <p className="text-gray-500 text-xs mt-1">A friendly name to identify this provider</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.baseUrl}
                            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://openrouter.ai/api/v1"
                            disabled={loading}
                            required
                        />
                        <p className="text-gray-500 text-xs mt-1">
                            Examples: https://openrouter.ai/api/v1, http://localhost:1234/v1
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key {editingConfig ? '(Optional)' : <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type={showApiKey ? "text" : "password"}
                            value={formData.apiKey}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="sk-..."
                            disabled={loading}
                            {...(!editingConfig && { required: true })}
                        />
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="showApiKey"
                                checked={showApiKey}
                                onChange={(e) => setShowApiKey(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={loading}
                            />
                            <label htmlFor="showApiKey" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                Show API Key
                            </label>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                            Your API key for authentication{editingConfig ? ' (leave empty to keep current)' : ''}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.modelName}
                            onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., gpt-4, claude-3-opus, llama-3.1-8b-instant"
                            disabled={loading}
                        />
                        <p className="text-gray-500 text-xs mt-1">The specific model to use from this provider</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Headers (Optional JSON)
                        </label>
                        <textarea
                            value={formData.customHeaders}
                            onChange={(e) => setFormData({ ...formData, customHeaders: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            placeholder='{ "HTTP-Referer": "https://yoursite.com", "X-Title": "Your App Name" }'
                            rows={4}
                            disabled={loading}
                        />
                        <p className="text-gray-500 text-xs mt-1">
                            Additional headers in JSON format. For OpenRouter, include HTTP-Referer and X-Title for attribution.
                        </p>
                    </div>

                    {/* Input Modalities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Input Modalities <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isInputModalityText === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isInputModalityText: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Text</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isInputModalityImage === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isInputModalityImage: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Image</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isInputModalityAudio === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isInputModalityAudio: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Audio</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isInputModalityVideo === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isInputModalityVideo: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Video</span>
                            </label>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Select the input types this model supports</p>
                    </div>

                    {/* Output Modalities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output Modalities <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isOutputModalityText === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isOutputModalityText: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Text</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isOutputModalityImage === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isOutputModalityImage: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Image</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isOutputModalityAudio === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isOutputModalityAudio: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Audio</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isOutputModalityVideo === 'true'}
                                    onChange={(e) => setFormData({ ...formData, isOutputModalityVideo: e.target.checked ? 'true' : 'false' })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-700">Video</span>
                            </label>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Select the output types this model supports</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (editingConfig ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OpenaiCompatibleModelModal;
