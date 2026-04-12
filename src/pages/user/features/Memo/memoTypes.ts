/** Must match server `MAX_IMAGES_PER_NOTE` in memo CRUD routes. */
export const MEMO_MAX_IMAGES_PER_NOTE = 25;

export type MemoLabel = {
  id: string;
  name: string;
};

export type MemoNote = {
  id: string;
  title: string;
  body: string;
  /** Palette key from server; see memoNoteStyle */
  noteColor: string;
  /** Storage paths or data URLs, in display order */
  imageDataUrls: string[];
  labelIds: string[];
  labelNames: string[];
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  createdAt: number;
  updatedAt: number;
};

/** Primary sidebar navigation (labels are loaded separately). */
export type MemoNavSelection =
  | { kind: 'notes' }
  | { kind: 'reminders' }
  | { kind: 'archive' }
  | { kind: 'bin' }
  | { kind: 'label'; labelId: string };

export function memoNavKey(nav: MemoNavSelection): string {
  if (nav.kind === 'label') return `label:${nav.labelId}`;
  return nav.kind;
}
