import { useState, useEffect } from "react";

import axiosCustom from "../../../../../../config/axiosCustom";
import type { ChatAiModelProvider } from "./selectModel.types";

const LastUsedLlmModel = ({
    aiModelName,
    setAiModelName,
    setAiModelProvider,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    setAiModelProvider: React.Dispatch<React.SetStateAction<ChatAiModelProvider>>;
}) => {
    const [topLlmModels, setTopLlmModels] = useState<Array<{ aiModelProvider: string; aiModelName: string }>>([]);
    const [showMoreModels, setShowMoreModels] = useState(false);

    useEffect(() => {
        const fetchTopLlmModels = async () => {
            try {
                const response = await axiosCustom.get('/api/chat-llm/threads-crud/topLlmConversationModel');
                setTopLlmModels(response.data.modelArr || []);
            } catch (error) {
                console.error('Error fetching top LLM models:', error);
            }
        };

        fetchTopLlmModels();
    }, []);

    const handleModelSelect = (model: { aiModelProvider: string; aiModelName: string }) => {
        if (
            model.aiModelProvider === 'openrouter' ||
            model.aiModelProvider === 'groq' ||
            model.aiModelProvider === 'ollama' ||
            model.aiModelProvider === 'localai' ||
            model.aiModelProvider === 'openai-compatible'
        ) {
            setAiModelProvider(model.aiModelProvider as ChatAiModelProvider);
        }
        setAiModelName(model.aiModelName);
    };

    const formatModelNameForDisplay = (modelName: string): string => {
        return modelName.replace('/', ' / ').replace('/', ' / ');
    };

    return (
        <div className="mb-2">
            {topLlmModels.slice(0, showMoreModels ? topLlmModels.length : 4).map((model, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleModelSelect(model)}
                    className={`text-left px-2 py-1 text-sm rounded-sm border hover:bg-gray-50 ${aiModelName === model.aiModelName ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                        }`}
                >
                    <div>
                        <span className="inline-block text-gray-700 text-sm">
                            {formatModelNameForDisplay(model?.aiModelName || '')}
                        </span>
                    </div>
                </button>
            ))}

            {topLlmModels.length > 4 && (
                <button
                    type="button"
                    onClick={() => setShowMoreModels(!showMoreModels)}
                    className="text-sm text-gray-500 hover:text-gray-700 inline-block border border-gray-200 px-2 py-1 rounded"
                >
                    <span className="mr-1">🔍</span>
                    {showMoreModels ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
};

export default LastUsedLlmModel;
