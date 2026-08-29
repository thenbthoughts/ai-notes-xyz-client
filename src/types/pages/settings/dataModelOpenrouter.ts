export interface tsSchemaAiModelListOpenrouter {
    // identification
    id: string;

    // ai
    name: string;
    description: string;
    contextLength?: number;
    maxCompletionTokens?: number;

    // input modalities
    isInputModalityText?: string;
    isInputModalityImage?: string;
    isInputModalityAudio?: string;
    isInputModalityVideo?: string;

    // output modalities
    isOutputModalityText?: string;
    isOutputModalityImage?: string;
    isOutputModalityAudio?: string;
    isOutputModalityVideo?: string;
    isOutputModalityEmbedding?: string;
    raw?: any;
};