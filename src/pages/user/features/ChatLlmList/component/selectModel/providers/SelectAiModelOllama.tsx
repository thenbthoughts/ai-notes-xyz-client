import { useState, useEffect } from "react";

import axiosCustom from "../../../../../../../config/axiosCustom";

const SelectAiModelOllama = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [ollamaModels, setOllamaModels] = useState<
        Array<{ _id: string; modelName: string; modelLabel: string }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchOllamaModels = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-ollama/modelOllamaGet");
                setOllamaModels(res.data.docs || []);
            } catch {
                setError("Failed to fetch models");
            } finally {
                setLoading(false);
            }
        };
        fetchOllamaModels();
    }, []);

    useEffect(() => {
        if (ollamaModels.length > 0 && !aiModelName) {
            setAiModelName(ollamaModels[0].modelName);
        }
    }, [ollamaModels, aiModelName, setAiModelName]);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Ollama Model</h3>
            {loading ? (
                <div className="text-gray-500 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : ollamaModels.length === 0 ? (
                <div className="text-sm text-gray-500">No Ollama models found. Go to Ollama settings to add models.</div>
            ) : (
                <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={aiModelName}
                    onChange={e => setAiModelName(e.target.value)}
                >
                    {ollamaModels.map(model => (
                        <option key={model._id} value={model.modelName}>
                            {model.modelLabel || model.modelName}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default SelectAiModelOllama;
