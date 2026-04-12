import type { CSSProperties } from 'react';

/** Keep-style note colors; stored on the server as these keys (empty = default white). */
export const MEMO_NOTE_COLOR_KEYS = ['', 'coral', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'brown', 'gray'] as const;

export type MemoNoteColorKey = (typeof MEMO_NOTE_COLOR_KEYS)[number];

export const MEMO_NOTE_COLOR_HEX: Record<Exclude<MemoNoteColorKey, ''>, string> = {
  coral: '#f28b82',
  orange: '#fbbc04',
  yellow: '#fff475',
  green: '#ccff90',
  teal: '#a7ffeb',
  blue: '#cbf0f8',
  purple: '#d7aefb',
  pink: '#fdcfe8',
  brown: '#e6c9a8',
  gray: '#e8eaed',
};

export function memoNoteBackgroundStyle(noteColor: string): CSSProperties {
  if (!noteColor) {
    return { backgroundColor: '#ffffff' };
  }
  const hex = MEMO_NOTE_COLOR_HEX[noteColor as keyof typeof MEMO_NOTE_COLOR_HEX];
  return { backgroundColor: hex ?? '#ffffff' };
}
