export enum MetadataSourceType {
    NOTES = 'notes',
    TASKS = 'tasks',
    CHAT_LLM = 'chatLlm',
    LIFE_EVENTS = 'lifeEvents',
    INFO_VAULT = 'infoVault',
}

// Frontend interface mirroring the Mongoose Schema
export interface ILlmContextKeyword {
    _id: string; // Mapped from ObjectId
    username: string;
    keyword: string;
    aiCategory: string;
    aiSubCategory: string;
    aiTopic: string;
    aiSubTopic: string;
    metadataSourceType: MetadataSourceType;
    metadataSourceId: string | null; // Mapped from ObjectId
    hasEmbedding: boolean;
    vectorEmbeddingStr: string;
    createdAt: string; // Additional UI field
}

export type KeywordFormData = Omit<ILlmContextKeyword, '_id' | 'createdAt'>;

export interface ClassificationResponse {
    aiCategory: string;
    aiSubCategory: string;
    aiTopic: string;
    aiSubTopic: string;
}