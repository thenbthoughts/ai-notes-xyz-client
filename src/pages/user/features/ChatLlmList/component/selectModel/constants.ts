import type { ChatAiModelProvider } from './selectModel.types';

export const PROVIDER_OPTIONS: { label: string; value: ChatAiModelProvider }[] = [
    { label: 'OpenRouter', value: 'openrouter' },
    { label: 'GROQ', value: 'groq' },
    { label: 'Ollama', value: 'ollama' },
    { label: 'LocalAI', value: 'localai' },
    { label: 'OpenAI Compatible', value: 'openai-compatible' },
];
