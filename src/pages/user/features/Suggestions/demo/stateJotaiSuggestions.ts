import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type SuggestionUserState = {
    dismissed?: boolean;
    done?: boolean;
    snoozeUntil?: number; // epoch ms
    feedback?: 'up' | 'down' | null;
};

// Keyed by suggestion id (e.g., 'a1')
export const suggestionStateAtom = atomWithStorage<Record<string, SuggestionUserState>>(
    'ai_notes_xyz:suggestionUserState',
    {}
);

// Helper write atom to update a single id
export const setSuggestionStateAtom = atom(
    null,
    (get, set, { id, update }: { id: string; update: Partial<SuggestionUserState> }) => {
        const current = get(suggestionStateAtom);
        const existing = current[id] || {};
        const next = { ...current, [id]: { ...existing, ...update } };
        set(suggestionStateAtom, next);
    }
);


