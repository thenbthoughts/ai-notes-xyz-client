// AI Features Settings Types
export interface AiFeaturesSettings {
    featureAiActionsEnabled: boolean;
    featureAiModelProvider: 'groq' | 'openrouter' | 'ollama' | 'openai-compatible';
    featureAiModelName: string; // For openai-compatible provider, this stores the config ID; for others, it stores the model name
    featureAiActionsChatThread: boolean;
    featureAiActionsChatMessage: boolean;
    featureAiActionsNotes: boolean;
    featureAiActionsTask: boolean;
    featureAiActionsLifeEvents: boolean;
    featureAiActionsInfoVault: boolean;
}

// AI Model Provider Options
export type AiModelProvider = '' | 'groq' | 'openrouter' | 'ollama' | 'openai-compatible';