import { LucideBrush, LucideCheckSquare, LucideImage, LucideLoader2, LucidePaperclip, LucideX } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import envKeys from '../../../../config/envKeys';
import { memoAttachmentDisplayName, memoAttachmentLooksLikeImage } from './memoAttachmentUtils';
import { memoImageDisplaySrc } from './memoImageDisplay';
import { uploadMemoNoteImage } from './memoImageUpload';
import MemoLabelPicklist from './MemoLabelPicklist';
import MemoStoredImage from './MemoStoredImage';
import {
  MEMO_NOTE_COLOR_HEX,
  MEMO_NOTE_COLOR_KEYS,
  memoNoteBackgroundStyle,
  type MemoNoteColorKey,
} from './memoNoteStyle';
import { MEMO_MAX_IMAGES_PER_NOTE, type MemoLabel } from './memoTypes';

type MemoNoteComposerProps = {
  labels: MemoLabel[];
  onSave: (input: {
    title: string;
    body: string;
    labelIds: string[];
    noteColor: string;
    reminderTime: string | null;
    /** Storage paths returned from `uploadMemoNoteImage` — registered on the server after the memo is created. */
    uploadStoragePaths: string[];
  }) => Promise<void>;
};

const DRAFT_KEY = 'memo-composer-draft';
function readDraft(): { title: string; body: string; labelIds: string[]; noteColor: string } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function writeDraft(d: { title: string; body: string; labelIds: string[]; noteColor: string }) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }
const iconToolBtn =
  'flex h-7 min-h-[28px] w-7 min-w-[28px] shrink-0 items-center justify-center rounded-full text-[#a1a1aa] transition hover:bg-white/[0.06] active:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-45';

function insertAtCursor(textarea: HTMLTextAreaElement, value: string, body: string, setBody: (s: string) => void) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = body.slice(0, start);
  const after = body.slice(end);
  const insert = (start > 0 && !before.endsWith('\n') ? '\n' : '') + value;
  const next = before + insert + after;
  setBody(next);
  requestAnimationFrame(() => {
    textarea.focus();
    const pos = start + insert.length;
    textarea.setSelectionRange(pos, pos);
  });
}

export default function MemoNoteComposer({ labels, onSave }: MemoNoteComposerProps) {
  const draft = readDraft();
  const [expanded, setExpanded] = useState(Boolean(draft && (draft.title || draft.body)));
  const [title, setTitle] = useState(draft?.title ?? '');
  const [body, setBody] = useState(draft?.body ?? '');
  const [labelIds, setLabelIds] = useState<string[]>(draft?.labelIds ?? []);
  const [noteColor, setNoteColor] = useState<string>(draft?.noteColor ?? '');
  const [reminderTime, setReminderTime] = useState<string>('');
  /** Local attachment list (storage paths and/or legacy display strings before save). */
  const [uploadStoragePaths, setUploadStoragePaths] = useState<string[]>([]);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const memoImageInputId = useId();

  const reset = () => {
    setTitle('');
    setBody('');
    setLabelIds([]);
    setNoteColor('');
    setReminderTime('');
    setUploadStoragePaths([]);
    setColorMenuOpen(false);
    setExpanded(false);
    clearDraft();
  };

  const commit = async () => {
    if (saving) return;
    const t = title.trim();
    const b = body.trim();
    if (!t && !b && uploadStoragePaths.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        title: t || (uploadStoragePaths.length > 0 ? 'Attachment' : ''),
        body: b,
        labelIds,
        noteColor,
        reminderTime: reminderTime ? new Date(reminderTime).toISOString() : null,
        uploadStoragePaths,
      });
      reset();
    } catch {
      /* addNote shows error toast */
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!expanded) return;
    writeDraft({ title, body, labelIds, noteColor });
  }, [expanded, title, body, labelIds, noteColor]);

  const handleBlurPanel = (e: React.FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      void commit();
    }
  };

  const onInsertChecklist = () => {
    if (saving) return;
    const el = bodyRef.current;
    if (!el) {
      setBody((prev) => (prev ? `${prev}\n` : '') + '- [ ] ');
      return;
    }
    insertAtCursor(el, '- [ ] ', body, setBody);
  };

  const addImagesFromFiles = async (rawFiles: File[]) => {
    if (saving) return;
    const files = rawFiles.filter((file) => file.size > 0);
    if (!files.length) {
      toast.error('Choose at least one file');
      return;
    }
    const toastId = 'memo-file-upload';
    const remaining = MEMO_MAX_IMAGES_PER_NOTE - uploadStoragePaths.length;
    if (remaining <= 0) {
      toast.error(`At most ${MEMO_MAX_IMAGES_PER_NOTE} files per note`);
      return;
    }
    const list = files.slice(0, remaining);
    toast.loading(list.length > 1 ? 'Uploading files…' : 'Uploading file…', { id: toastId });
    try {
      const paths: string[] = [];
      for (const file of list) {
        paths.push(await uploadMemoNoteImage(file, envKeys.API_URL));
      }
      setUploadStoragePaths((prev) => [...prev, ...paths]);
      if (files.length > remaining) {
        toast.success(`Added ${paths.length} file(s) (limit ${MEMO_MAX_IMAGES_PER_NOTE})`, { id: toastId });
      } else {
        toast.success(paths.length > 1 ? 'Files attached' : 'File attached', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Could not upload file', { id: toastId });
    }
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (!picked.length) return;
    await addImagesFromFiles(picked);
  };

  if (!expanded) {
    return (
      <div className="relative mx-auto w-full max-w-[600px]">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#52525b] bg-[#27272a] px-3 py-2 text-left text-sm text-[#e4e4e7] shadow-[0_1px_2px_0_rgba(0,0,0,0.4),0_2px_6px_2px_rgba(0,0,0,0.25)] transition hover:shadow-md active:bg-[#18181b] sm:px-3"
          style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
        >
          <span className="min-w-0 truncate text-[#a1a1aa]">Take a note...</span>
          <span className="flex shrink-0 items-center gap-0.5 text-[#a1a1aa]">
            <LucideCheckSquare className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            <LucideBrush className="hidden h-3.5 w-3.5 sm:block" strokeWidth={2} aria-hidden />
            <LucideImage className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </span>
        </button>
      </div>
    );
  }

  const bgStyle = memoNoteBackgroundStyle(noteColor);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-[600px] rounded-lg border border-[#52525b] shadow-[0_1px_2px_0_rgba(0,0,0,0.4),0_2px_6px_2px_rgba(0,0,0,0.25)] transition-colors"
      style={{ ...bgStyle, fontFamily: 'Roboto, system-ui, sans-serif' }}
      onBlur={handleBlurPanel}
      aria-busy={saving}
    >
      <input
        id={memoImageInputId}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => void onPickImage(e)}
      />

      <div className="px-3 pt-2">
        <input
          className="mb-0.5 w-full border-0 bg-transparent text-sm font-medium text-[#e4e4e7] outline-none placeholder:text-[#a1a1aa] disabled:opacity-60"
          placeholder="Title"
          value={title}
          disabled={saving}
          aria-label="Note title"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void commit(); } }}
        />
        <textarea
          ref={bodyRef}
          className="min-h-[72px] w-full resize-y border-0 bg-transparent text-sm text-[#e4e4e7] outline-none placeholder:text-[#a1a1aa] disabled:opacity-60"
          placeholder="Take a note..."
          value={body}
          disabled={saving}
          aria-label="Note body"
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void commit(); } }}
        />
        <div className="flex justify-end px-1 pb-1 text-[10px] text-[#a1a1aa]">{body.length} chars · Ctrl+Enter to save</div>

        {uploadStoragePaths.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {uploadStoragePaths.map((src, idx) => (
              <div key={`${src}-${idx}`} className="relative inline-block max-w-[min(100%,240px)]">
                {memoAttachmentLooksLikeImage(src) ? (
                  <MemoStoredImage
                    stored={src}
                    alt=""
                    className="max-h-40 max-w-full rounded-md border border-[#52525b] object-contain"
                  />
                ) : (
                  <a
                    href={memoImageDisplaySrc(src)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex max-w-[240px] items-center gap-2 rounded-md border border-[#52525b] bg-[#27272a] px-2 py-1.5 text-xs text-[#e4e4e7] hover:bg-[#18181b]"
                    title={memoAttachmentDisplayName(src, idx)}
                  >
                    <LucidePaperclip className="h-3.5 w-3.5 shrink-0 text-[#a1a1aa]" strokeWidth={2} aria-hidden />
                    <span className="truncate">{memoAttachmentDisplayName(src, idx)}</span>
                  </a>
                )}
                <button
                  type="button"
                  className="absolute right-0.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/65 disabled:opacity-40"
                  aria-label="Remove file"
                  disabled={saving}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => setUploadStoragePaths((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <LucideX className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div
          className="mb-2 rounded-lg border border-[#3f3f46] bg-[#27272a]/70 p-2 backdrop-blur-[2px]"
          role="group"
          aria-label="Labels"
        >
          <MemoLabelPicklist
            labels={labels}
            selectedIds={labelIds}
            onChange={setLabelIds}
            idPrefix="memo-composer"
            layout="pills"
            disabled={saving}
          />
        </div>
        <div className="mb-2 flex items-center gap-2">
          <input type="datetime-local" aria-label="Reminder time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} disabled={saving} className="h-8 rounded-md border border-zinc-600 bg-zinc-800 px-2 text-xs text-zinc-200" />
          {reminderTime ? <button type="button" aria-label="Clear reminder" onClick={() => setReminderTime('')} className="text-xs text-zinc-400 hover:text-zinc-200">Clear</button> : null}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-[#3f3f46]/80 px-0.5 py-0.5">
        {colorMenuOpen ? (
          <div
            className="absolute bottom-full left-0 z-20 mb-1.5 max-w-[min(100%,20rem)] rounded-lg border border-[#52525b] bg-[#27272a] p-1.5 shadow-lg"
            role="dialog"
            aria-label="Note color"
          >
            <div className="mb-1 text-[10px] font-medium text-[#a1a1aa]">Note color</div>
            <div className="flex flex-wrap gap-1.5">
              {MEMO_NOTE_COLOR_KEYS.filter((k) => k !== '').map((key) => {
                const hex = MEMO_NOTE_COLOR_HEX[key as Exclude<MemoNoteColorKey, ''>];
                return (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    disabled={saving}
                    aria-label={`Color ${key}`}
                    className={`h-7 w-7 rounded-full border-2 shadow-sm transition disabled:opacity-50 ${
                      noteColor === key ? 'border-[#1a73e8] ring-2 ring-[#1a73e8]/40' : 'border-[#52525b] ring-1 ring-[#52525b]'
                    }`}
                    style={{ backgroundColor: hex }}
                    onClick={() => {
                      setNoteColor(key);
                      setColorMenuOpen(false);
                    }}
                  />
                );
              })}
              <button
                type="button"
                title="Default"
                disabled={saving}
                className="h-7 w-7 rounded-full border-2 border-dashed border-[#52525b] bg-[#27272a] text-[9px] font-medium text-[#a1a1aa] disabled:opacity-50"
                onClick={() => {
                  setNoteColor('');
                  setColorMenuOpen(false);
                }}
              >
                ∅
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex gap-0 px-0.5">
          <button
            type="button"
            className={iconToolBtn}
            aria-label="Insert checklist item"
            title="Checklist"
            disabled={saving}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertChecklist}
          >
            <LucideCheckSquare className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className={`${iconToolBtn} ${colorMenuOpen ? 'bg-white/[0.06]' : ''}`}
            aria-label="Note color"
            aria-expanded={colorMenuOpen}
            title="Background color"
            disabled={saving}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setColorMenuOpen((v) => !v)}
          >
            <LucideBrush className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
          {saving ? (
            <button
              type="button"
              className={iconToolBtn}
              aria-label="Add images"
              title="Add images"
              disabled
            >
              <LucideImage className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          ) : (
            <label
              htmlFor={memoImageInputId}
              className={`${iconToolBtn} cursor-pointer`}
              aria-label="Add images"
              title="Add images"
            >
              <LucideImage className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </label>
          )}
        </div>
        <button
          type="button"
          className="inline-flex min-h-8 min-w-[5.5rem] items-center justify-center gap-1.5 rounded px-3 py-1 text-sm font-medium text-[#e4e4e7] hover:bg-white/[0.06] active:bg-white/[0.08] disabled:cursor-wait disabled:opacity-80"
          onMouseDown={(e) => e.preventDefault()}
          disabled={saving}
          onClick={() => void commit()}
          aria-busy={saving}
        >
          {saving ? (
            <>
              <LucideLoader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
              <span>Saving</span>
            </>
          ) : (
            'Close'
          )}
        </button>
      </div>
    </div>
  );
}
