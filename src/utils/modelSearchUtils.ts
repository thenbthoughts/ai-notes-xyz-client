/**
 * Helper utilities for break-word regex searching, modality filtering, and context length formatting.
 */

export const escapeRegex = (value: string): string => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Break-word regex matcher:
 * Splits a search query by whitespace and tests if EVERY word matches anywhere in the target string(s).
 */
export const matchBreakWordRegex = (
    query: string,
    ...targets: (string | number | undefined | null | boolean)[]
): boolean => {
    if (!query || !query.trim()) {
        return true;
    }

    const words = query
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return true;
    }

    const combined = targets
        .filter((t): t is string | number | boolean => t !== undefined && t !== null)
        .map(String)
        .join(' ');

    return words.every((word) => {
        try {
            const reg = new RegExp(escapeRegex(word), 'i');
            return reg.test(combined);
        } catch {
            return combined.toLowerCase().includes(word.toLowerCase());
        }
    });
};

/**
 * Creates a react-select filterOption using break-word regex.
 */
export const createBreakWordFilterOption = <OptionType extends { label: string; value: string; [key: string]: any }>() => {
    return (candidate: { label: string; value: string; data: OptionType }, input: string): boolean => {
        if (!input || !input.trim()) return true;
        const extraSearchable = candidate.data?.description || candidate.data?.searchKey || candidate.data?.owned_by || '';
        return matchBreakWordRegex(input, candidate.label, candidate.value, extraSearchable);
    };
};

/**
 * Formats context length into human-readable compact notation (e.g., 128k, 1M, 32k).
 */
export const formatContextLength = (length: number | undefined | null): string => {
    if (!length || length <= 0) return '';
    if (length >= 1_000_000) {
        const val = length / 1_000_000;
        return Number.isInteger(val) ? `${val}M` : `${val.toFixed(1)}M`;
    }
    if (length >= 1_000) {
        const val = length / 1_000;
        return Number.isInteger(val) ? `${val}k` : `${val.toFixed(1)}k`;
    }
    return String(length);
};

/**
 * Formats max completion tokens into human-readable compact notation (e.g., 4k, 8k, 16k).
 */
export const formatMaxCompletionTokens = (tokens: number | undefined | null): string => {
    if (!tokens || tokens <= 0) return '';
    if (tokens >= 1_000_000) {
        const val = tokens / 1_000_000;
        return Number.isInteger(val) ? `${val}M` : `${val.toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
        const val = tokens / 1_000;
        return Number.isInteger(val) ? `${val}k` : `${val.toFixed(1)}k`;
    }
    return String(tokens);
};

export interface ModalityFilterState {
    inputText: boolean;
    inputImage: boolean;
    inputAudio: boolean;
    inputVideo: boolean;
    outputText: boolean;
    outputImage: boolean;
    outputAudio: boolean;
    outputVideo: boolean;
    outputEmbedding: boolean;
    minContextLength?: number; // e.g. 32000, 128000, 1000000
    minOutputTokens?: number;  // e.g. 4096, 8192
}

export const initialModalityFilterState: ModalityFilterState = {
    inputText: false,
    inputImage: false,
    inputAudio: false,
    inputVideo: false,
    outputText: false,
    outputImage: false,
    outputAudio: false,
    outputVideo: false,
    outputEmbedding: false,
    minContextLength: 0,
    minOutputTokens: 0,
};

export const hasActiveModalityFilters = (filters: ModalityFilterState): boolean => {
    return (
        filters.inputText ||
        filters.inputImage ||
        filters.inputAudio ||
        filters.inputVideo ||
        filters.outputText ||
        filters.outputImage ||
        filters.outputAudio ||
        filters.outputVideo ||
        filters.outputEmbedding ||
        (filters.minContextLength !== undefined && filters.minContextLength > 0) ||
        (filters.minOutputTokens !== undefined && filters.minOutputTokens > 0)
    );
};

export const matchModalityFilters = (
    model: {
        isInputModalityText?: string;
        isInputModalityImage?: string;
        isInputModalityAudio?: string;
        isInputModalityVideo?: string;
        isOutputModalityText?: string;
        isOutputModalityImage?: string;
        isOutputModalityAudio?: string;
        isOutputModalityVideo?: string;
        isOutputModalityEmbedding?: string;
        contextLength?: number;
        context_window?: number;
        maxCompletionTokens?: number;
    },
    filters: ModalityFilterState
): boolean => {
    if (filters.inputText && model.isInputModalityText !== 'true') return false;
    if (filters.inputImage && model.isInputModalityImage !== 'true') return false;
    if (filters.inputAudio && model.isInputModalityAudio !== 'true') return false;
    if (filters.inputVideo && model.isInputModalityVideo !== 'true') return false;
    if (filters.outputText && model.isOutputModalityText !== 'true') return false;
    if (filters.outputImage && model.isOutputModalityImage !== 'true') return false;
    if (filters.outputAudio && model.isOutputModalityAudio !== 'true') return false;
    if (filters.outputVideo && model.isOutputModalityVideo !== 'true') return false;
    if (filters.outputEmbedding && model.isOutputModalityEmbedding !== 'true') return false;

    const ctx = model.contextLength || model.context_window || 0;
    if (filters.minContextLength && filters.minContextLength > 0) {
        if (ctx < filters.minContextLength) return false;
    }

    const out = model.maxCompletionTokens || 0;
    if (filters.minOutputTokens && filters.minOutputTokens > 0) {
        if (out < filters.minOutputTokens) return false;
    }

    return true;
};
