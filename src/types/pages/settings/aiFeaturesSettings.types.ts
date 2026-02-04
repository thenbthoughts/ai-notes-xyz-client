// AI Features Settings Types
export interface AiFeaturesSettings {
    featureAiActionsEnabled: boolean;
    featureAiModelProvider: 'groq' | 'openrouter' | 'ollama' | 'openai-compatible';
    featureAiModelName: string;
    featureAiActionsChatThread: boolean;
    featureAiActionsChatMessage: boolean;
    featureAiActionsNotes: boolean;
    featureAiActionsTask: boolean;
    featureAiActionsLifeEvents: boolean;
    featureAiActionsInfoVault: boolean;
}

// AI Model Provider Options
export type AiModelProvider = '' | 'groq' | 'openrouter' | 'ollama' | 'openai-compatible';