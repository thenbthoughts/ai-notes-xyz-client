export type ChatAiModelProvider =
    | 'openrouter'
    | 'groq'
    | 'ollama'
    | 'localai'
    | 'openai-compatible';

export interface SelectModelProps {
    aiModelProvider: ChatAiModelProvider;
    setAiModelProvider: React.Dispatch<React.SetStateAction<ChatAiModelProvider>>;
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    aiModelOpenAiCompatibleConfigId: string | null;
    setAiModelOpenAiCompatibleConfigId: React.Dispatch<React.SetStateAction<string | null>>;

    sttModelProvider: string;
    setSttModelProvider: React.Dispatch<React.SetStateAction<string>>;
    sttModelName: string;
    setSttModelName: React.Dispatch<React.SetStateAction<string>>;

    ttsModelProvider: string;
    setTtsModelProvider: React.Dispatch<React.SetStateAction<string>>;
    ttsModelName: string;
    setTtsModelName: React.Dispatch<React.SetStateAction<string>>;

    /** Triggers random LLM pick in OpenRouter/GROQ selectors */
    selectRandomModel?: number;
    setSelectRandomModel?: React.Dispatch<React.SetStateAction<number>>;
}
