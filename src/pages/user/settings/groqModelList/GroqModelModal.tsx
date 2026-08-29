import React, { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { LucideX } from 'lucide-react';
import { tsSchemaAiModelListGroq } from '../../../../types/pages/settings/dataModelGroq';

interface GroqModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingModel: tsSchemaAiModelListGroq | null;
    onSuccess: () => void;
}

const GroqModelModal: React.FC<GroqModelModalProps> = ({
    isOpen,
    onClose,
    editingModel,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        id: '',
        owned_by: '',
        active: true,
        contextLength: '0',
        maxCompletionTokens: '0',
        isInputModalityText: 'true',
        isInputModalityImage: 'false',
        isInputModalityAudio: 'false',
        isInputModalityVideo: 'false',
        isOutputModalityText: 'true',
        isOutputModalityImage: 'false',
        isOutputModalityAudio: 'false',
        isOutputModalityVideo: 'false',
        isOutputModalityEmbedding: 'false',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingModel) {
            setFormData({
                id: editingModel.id || '',
                owned_by: editingModel.owned_by || '',
                active: editingModel.active !== false,
                contextLength: String(editingModel.contextLength || editingModel.context_window || 0),
                maxCompletionTokens: String(editingModel.maxCompletionTokens || 0),
                isInputModalityText: editingModel.isInputModalityText || 'true',
                isInputModalityImage: editingModel.isInputModalityImage || 'false',
                isInputModalityAudio: editingModel.isInputModalityAudio || 'false',
                isInputModalityVideo: editingModel.isInputModalityVideo || 'false',
                isOutputModalityText: editingModel.isOutputModalityText || 'true',
                isOutputModalityImage: editingModel.isOutputModalityImage || 'false',
                isOutputModalityAudio: editingModel.isOutputModalityAudio || 'false',
                isOutputModalityVideo: editingModel.isOutputModalityVideo || 'false',
                isOutputModalityEmbedding: editingModel.isOutputModalityEmbedding || 'false',
            });
        }
    }, [editingModel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingModel) return;

        setLoading(true);
        try {
            const ctxLenNum = parseInt(formData.contextLength, 10) || 0;
            const maxTokensNum = parseInt(formData.maxCompletionTokens, 10) || 0;

            const config: AxiosRequestConfig = {
                method: 'patch',
                url: '/api/dynamic-data/model-groq/modelGroqUpdate',
                headers: { 'Content-Type': 'application/json' },
                data: {
                    id: editingModel.id,
                    owned_by: formData.owned_by.trim(),
                    active: formData.active,
                    contextLength: ctxLenNum,
                    maxCompletionTokens: maxTokensNum,
                    isInputModalityText: formData.isInputModalityText,
                    isInputModalityImage: formData.isInputModalityImage,
                    isInputModalityAudio: formData.isInputModalityAudio,
                    isInputModalityVideo: formData.isInputModalityVideo,
                    isOutputModalityText: formData.isOutputModalityText,
                    isOutputModalityImage: formData.isOutputModalityImage,
                    isOutputModalityAudio: formData.isOutputModalityAudio,
                    isOutputModalityVideo: formData.isOutputModalityVideo,
                    isOutputModalityEmbedding: formData.isOutputModalityEmbedding,
                },
            };

            await axiosCustom.request(config);
            toast.success('GROQ model updated successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Failed to update GROQ model');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !editingModel) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">
                            Edit GROQ Model
                        </h2>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{editingModel.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                                Owned By
                            </label>
                            <input
                                type="text"
                                value={formData.owned_by}
                                onChange={(e) => setFormData({ ...formData, owned_by: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                placeholder="e.g. Meta, Google, Groq"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center space-x-2 cursor-pointer text-sm text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 text-orange-600 border-zinc-700 rounded focus:ring-orange-500"
                                    disabled={loading}
                                />
                                <span className="font-medium">Active (Available for chat)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                                Context Window (Tokens)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.contextLength}
                                onChange={(e) => setFormData({ ...formData, contextLength: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                placeholder="e.g. 131072"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                                Max Output Tokens
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.maxCompletionTokens}
                                onChange={(e) => setFormData({ ...formData, maxCompletionTokens: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                placeholder="e.g. 8192"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Input Modalities */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Input Modalities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { key: 'isInputModalityText', label: 'Text' },
                                { key: 'isInputModalityImage', label: 'Image / Vision' },
                                { key: 'isInputModalityAudio', label: 'Audio / Whisper' },
                                { key: 'isInputModalityVideo', label: 'Video' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center space-x-2 cursor-pointer text-xs text-zinc-300">
                                    <input
                                        type="checkbox"
                                        checked={(formData as any)[key] === 'true'}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked ? 'true' : 'false' })}
                                        className="w-4 h-4 text-orange-600 border-zinc-700 rounded focus:ring-orange-500"
                                        disabled={loading}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Output Modalities */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Output Modalities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                                { key: 'isOutputModalityText', label: 'Text' },
                                { key: 'isOutputModalityImage', label: 'Image' },
                                { key: 'isOutputModalityAudio', label: 'Audio' },
                                { key: 'isOutputModalityVideo', label: 'Video' },
                                { key: 'isOutputModalityEmbedding', label: 'Embedding' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center space-x-2 cursor-pointer text-xs text-zinc-300">
                                    <input
                                        type="checkbox"
                                        checked={(formData as any)[key] === 'true'}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked ? 'true' : 'false' })}
                                        className="w-4 h-4 text-orange-600 border-zinc-700 rounded focus:ring-orange-500"
                                        disabled={loading}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-zinc-400 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm font-semibold"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroqModelModal;
