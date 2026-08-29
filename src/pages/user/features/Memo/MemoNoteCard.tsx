import {
  LucideArchive,
  LucideBrush,
  LucideChevronDown,
  LucideChevronUp,
  LucideGripVertical,
  LucideImage,
  LucideMoreVertical,
  LucidePaperclip,
  LucidePin,
  LucideTag,
  LucideTrash2,
  LucideX,
} from 'lucide-react';
import type { Dispatch, DragEvent, SetStateAction } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { DebounceInput } from 'react-debounce-input';
import envKeys from '../../../../config/envKeys';
import { memoAttachmentDisplayName, memoAttachmentLooksLikeImage } from './memoAttachmentUtils';
import { memoImageDisplaySrc } from './memoImageDisplay';
import MemoLabelBadgeRow from './MemoLabelBadgeRow';
import MemoLabelPicklist from './MemoLabelPicklist';
import MemoStoredImage from './MemoStoredImage';
import {
  MEMO_NOTE_COLOR_HEX,
  MEMO_NOTE_COLOR_KEYS,
  memoNoteBackgroundStyle,
  type MemoNoteColorKey,
} from './memoNoteStyle';
import { uploadMemoNoteImage } from './memoImageUpload';
import { MEMO_MAX_IMAGES_PER_NOTE, type MemoLabel, type MemoNote } from './memoTypes';
import { checklistProgress, parseChecklist, toggleChecklistLine } from './memoChecklist';

type MemoNoteCardProps = {
  note: MemoNote;
  labels: MemoLabel[];
  viewMode: 'grid' | 'list';
  variant: 'default' | 'bin' | 'archive';
  onChange: (id: string, patch: Partial<Pick<MemoNote, 'title' | 'body' | 'labelIds' | 'noteColor' | 'reminderTime'>>) => void;
  /** Remove one image (storage path or legacy `data:image/...`). */
  onRemoveMemoImage?: (id: string, imageUrlOrPath: string) => void | Promise<void>;
  /** Clear all images for the note (memoFiles + legacy). */
  onClearMemoImages?: (id: string) => void | Promise<void>;
  onTogglePin: (id: string) => void;
  onReorderDragStart?: (id: string, e: DragEvent) => void;
  onReorderDragEnd?: () => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onRestore?: (id: string) => void;
  onDeleteForever?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onAppendMemoImages?: (id: string, paths: string[]) => void | Promise<void>;
  onCopy?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSetReminder?: (id: string, iso: string | null) => void;
  searchQuery?: string;
};

const ff = { fontFamily: 'Roboto, system-ui, sans-serif' } as const;

const iconBtn =
  'flex h-8 min-h-[32px] w-8 min-w-[32px] items-center justify-center rounded-full text-[#a1a1aa] transition hover:bg-white/[0.06] active:bg-white/[0.1]';

const dashedTool =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-[#52525b] bg-[#27272a]/65 text-[#a1a1aa] backdrop-blur-[1px] transition hover:border-[#71717a] hover:bg-[#27272a]/85 hover:text-[#e4e4e7]';

const menuItem =
  'flex min-h-[32px] w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-sm text-[#e4e4e7] hover:bg-[#18181b] active:bg-[#3f3f46]';

const imgThumbClass = 'max-h-40 max-w-full rounded-md border border-[#52525b]/50 object-contain';

function cardClassName(viewMode: 'grid' | 'list', variant: MemoNoteCardProps['variant'], pinned: boolean): string {
  const pin = variant === 'default' && pinned;
  const border = pin ? 'border-[#f9ab00]/50 ring-1 ring-[#feefc3]' : 'border-[#52525b]';
  if (viewMode === 'grid') {
    return `break-inside-avoid rounded-lg border p-2.5 shadow-sm transition hover:shadow-md sm:p-3 ${border}`;
  }
  return `flex flex-col rounded-lg border p-3 shadow-sm transition hover:shadow-md ${border}`;
}

type OverflowMenuProps = {
  variant: MemoNoteCardProps['variant'];
  note: MemoNote;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClearMemoImages?: MemoNoteCardProps['onClearMemoImages'];
  onArchive: MemoNoteCardProps['onArchive'];
  onTrash: MemoNoteCardProps['onTrash'];
  onRestore?: MemoNoteCardProps['onRestore'];
  onDeleteForever?: MemoNoteCardProps['onDeleteForever'];
  onUnarchive?: MemoNoteCardProps['onUnarchive'];
  onCopy?: MemoNoteCardProps['onCopy'];
  onDuplicate?: MemoNoteCardProps['onDuplicate'];
};

function MemoCardOverflowMenu({
  variant,
  note,
  open,
  setOpen,
  onClearMemoImages,
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
  onUnarchive,
  onCopy,
  onDuplicate,
}: OverflowMenuProps) {
  return (
    <>
      <button type="button" className={iconBtn} aria-label="More" onClick={() => setOpen((v) => !v)}>
        <LucideMoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[160] cursor-default touch-manipulation bg-black/5"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 bottom-full z-[170] mb-1 w-max min-w-[10rem] max-w-[min(18rem,calc(100vw-2rem))] rounded-md border border-[#52525b] bg-[#27272a] py-1 shadow-lg"
          >
            {variant === 'default' && (
              <>
                {onCopy ? (
                  <button type="button" className={menuItem} onClick={() => { onCopy(note.id); setOpen(false); }}>Copy text</button>
                ) : null}
                {onDuplicate ? (
                  <button type="button" className={menuItem} onClick={() => { onDuplicate(note.id); setOpen(false); }}>Duplicate</button>
                ) : null}
                {note.imageDataUrls.length > 0 && onClearMemoImages ? (
                  <button
                    type="button"
                    className={menuItem}
                    onClick={() => {
                      void onClearMemoImages(note.id);
                      setOpen(false);
                    }}
                  >
                    Remove all images
                  </button>
                ) : null}
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    onArchive(note.id);
                    setOpen(false);
                  }}
                >
                  <LucideArchive className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  Archive
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    onTrash(note.id);
                    setOpen(false);
                  }}
                >
                  <LucideTrash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  Delete
                </button>
              </>
            )}
            {variant === 'archive' && (
              <button
                type="button"
                className={menuItem}
                onClick={() => {
                  onUnarchive?.(note.id);
                  setOpen(false);
                }}
              >
                Restore to Notes
              </button>
            )}
            {variant === 'bin' && (
              <>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => {
                    onRestore?.(note.id);
                    setOpen(false);
                  }}
                >
                  Restore
                </button>
                <button
                  type="button"
                  className={`${menuItem} text-rose-400 hover:bg-rose-950/50 active:bg-rose-900/50`}
                  onClick={() => {
                    onDeleteForever?.(note.id);
                    setOpen(false);
                  }}
                >
                  Delete forever
                </button>
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

type EditableBodyProps = {
  note: MemoNote;
  labels: MemoLabel[];
  memoImageInputId: string;
  viewMode: 'grid' | 'list';
  colorOpen: boolean;
  setColorOpen: Dispatch<SetStateAction<boolean>>;
  labelsOpen: boolean;
  setLabelsOpen: Dispatch<SetStateAction<boolean>>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  onChange: MemoNoteCardProps['onChange'];
  onTogglePin: MemoNoteCardProps['onTogglePin'];
  onReorderDragStart?: MemoNoteCardProps['onReorderDragStart'];
  onReorderDragEnd?: MemoNoteCardProps['onReorderDragEnd'];
  onArchive: MemoNoteCardProps['onArchive'];
  onTrash: MemoNoteCardProps['onTrash'];
  onRemoveMemoImage?: MemoNoteCardProps['onRemoveMemoImage'];
  onClearMemoImages?: MemoNoteCardProps['onClearMemoImages'];
  uploadImagesForCard: (files: File[]) => void;
  onCopy?: MemoNoteCardProps['onCopy'];
  onDuplicate?: MemoNoteCardProps['onDuplicate'];
  onSetReminder?: MemoNoteCardProps['onSetReminder'];
};

function MemoCardEditableBody({
  note,
  labels,
  memoImageInputId,
  viewMode,
  colorOpen,
  setColorOpen,
  labelsOpen,
  setLabelsOpen,
  menuOpen,
  setMenuOpen,
  onChange,
  onTogglePin,
  onReorderDragStart,
  onReorderDragEnd,
  onArchive,
  onTrash,
  onRemoveMemoImage,
  onClearMemoImages,
  uploadImagesForCard,
  onCopy,
  onDuplicate,
  onSetReminder,
}: EditableBodyProps) {
  const [expandedManual, setExpandedManual] = useState(false);
  const expanded = viewMode === 'grid' || expandedManual;
  const atImageLimit = note.imageDataUrls.length >= MEMO_MAX_IMAGES_PER_NOTE;
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const titleDisplay = note.title.trim() || 'Untitled';
  const hasDetails = Boolean(note.body.trim() || note.imageDataUrls.length > 0);

  const resizeBodyTextarea = useCallback(() => {
    const el = bodyTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxPx = parseFloat(getComputedStyle(el).maxHeight);
    const cap = Number.isFinite(maxPx) ? maxPx : Number.POSITIVE_INFINITY;
    el.style.height = `${Math.min(el.scrollHeight, cap)}px`;
  }, []);

  useLayoutEffect(() => {
    if (!expanded) return;
    resizeBodyTextarea();
  }, [expanded, note.body, resizeBodyTextarea]);

  const setExpandedSafe = (next: boolean) => {
    if (viewMode === 'grid') return;
    setExpandedManual(next);
    if (!next) {
      setColorOpen(false);
      setLabelsOpen(false);
    }
  };

  const actionCluster = (
    <div className="relative z-10 mt-1 flex min-w-0 flex-nowrap items-center justify-between gap-1">
      <div className="flex min-w-0 flex-nowrap items-center gap-1">
        {atImageLimit ? (
          <button
            type="button"
            className={`${dashedTool} shrink-0 opacity-50`}
            style={ff}
            title={`At most ${MEMO_MAX_IMAGES_PER_NOTE} files`}
            aria-label="Image limit reached"
            onClick={() => toast.error(`At most ${MEMO_MAX_IMAGES_PER_NOTE} files per note`)}
          >
            <LucideImage className="h-3 w-3" strokeWidth={2} aria-hidden />
          </button>
        ) : (
          <label
            htmlFor={memoImageInputId}
            className={`${dashedTool} shrink-0 cursor-pointer`}
            style={ff}
            title={note.imageDataUrls.length > 0 ? 'Add more files' : 'Add files'}
            aria-label={note.imageDataUrls.length > 0 ? 'Add more files' : 'Add files'}
          >
            <LucideImage className="h-3 w-3" strokeWidth={2} aria-hidden />
          </label>
        )}
        <button
          type="button"
          aria-expanded={colorOpen}
          aria-label="Note color"
          title={note.noteColor ? `Color: ${note.noteColor}` : 'Note color'}
          className={`${dashedTool} shrink-0 ${colorOpen ? 'border-[#71717a] bg-[#27272a]/85' : ''}`}
          style={ff}
          onClick={() => {
            setExpandedSafe(true);
            setColorOpen((v) => !v);
          }}
        >
          <LucideBrush className="h-3 w-3" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-expanded={labelsOpen}
          aria-label="Labels"
          title={
            labelsOpen
              ? 'Close labels'
              : note.labelIds.length > 0
                ? `${note.labelIds.length} label(s) — click to edit`
                : 'Add labels'
          }
          className={`${dashedTool} shrink-0 ${labelsOpen ? 'border-[#71717a] bg-[#27272a]/85' : ''}`}
          style={ff}
          onClick={() => {
            setExpandedSafe(true);
            setLabelsOpen((v) => !v);
          }}
        >
          <LucideTag className="h-3 w-3" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {onReorderDragStart ? (
          <span
            role="button"
            tabIndex={0}
            draggable
            className={`${iconBtn} cursor-grab touch-none active:cursor-grabbing`}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            onDragStart={(e) => onReorderDragStart(note.id, e)}
            onDragEnd={() => onReorderDragEnd?.()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
            }}
          >
            <LucideGripVertical className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
        <button
          type="button"
          className={`${iconBtn} ${note.pinned ? 'text-[#fbbc04]' : ''}`}
          aria-label={note.pinned ? 'Unpin' : 'Pin'}
          onClick={() => onTogglePin(note.id)}
        >
          <LucidePin className="h-4 w-4" strokeWidth={2} />
        </button>
        <MemoCardOverflowMenu
          variant="default"
          note={note}
          open={menuOpen}
          setOpen={setMenuOpen}
          onClearMemoImages={onClearMemoImages}
          onArchive={onArchive}
          onTrash={onTrash}
          onCopy={onCopy}
          onDuplicate={onDuplicate}
        />
      </div>
    </div>
  );

  return (
    <>
      <input
        id={memoImageInputId}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          const picked = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = '';
          if (!picked.length) return;
          setExpandedSafe(true);
          uploadImagesForCard(picked);
        }}
      />

      <div className="flex min-w-0 items-start gap-0.5">
        {viewMode === 'list' ? (
          <button
            type="button"
            className={`${iconBtn} mt-0.5 shrink-0 ${hasDetails || expanded ? '' : 'invisible'}`}
            aria-label={expanded ? 'Collapse note' : 'Expand note'}
            aria-expanded={expanded}
            title={expanded ? 'Collapse' : 'Expand'}
            disabled={!hasDetails && !expanded}
            onClick={() => setExpandedSafe(!expandedManual)}
          >
            {expanded ? (
              <LucideChevronUp className="h-4 w-4" strokeWidth={2} />
            ) : (
              <LucideChevronDown className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        ) : null}
        {expanded ? (
          <DebounceInput
            element="input"
            debounceTimeout={500}
            placeholder="Title"
            className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium text-[#e4e4e7] outline-none placeholder:text-[#a1a1aa]"
            value={note.title}
            onChange={(e) => onChange(note.id, { title: e.target.value })}
          />
        ) : (
          <button
            type="button"
            className={`min-w-0 flex-1 truncate py-1 text-left text-sm font-medium ${
              note.title.trim() ? 'text-[#e4e4e7]' : 'text-[#a1a1aa]'
            }`}
            aria-expanded={false}
            title={hasDetails ? 'Expand note' : titleDisplay}
            onClick={() => setExpandedSafe(true)}
          >
            {titleDisplay}
          </button>
        )}
      </div>

      {expanded ? (
        <>
          {note.imageDataUrls.length > 0 ? (
            <div className="mb-1.5 mt-1 flex flex-wrap gap-2">
              {note.imageDataUrls.map((src, idx) => (
                <div key={`${src}-${idx}`} className="relative inline-block max-w-[min(100%,240px)]">
                  {memoAttachmentLooksLikeImage(src) ? (
                    <MemoStoredImage stored={src} alt="" className={imgThumbClass} />
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
                    className="absolute right-0.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove file"
                    disabled={!onRemoveMemoImage}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      const fileSrc = note.imageDataUrls[idx];
                      if (fileSrc && onRemoveMemoImage) void onRemoveMemoImage(note.id, fileSrc);
                    }}
                  >
                    <LucideX className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <DebounceInput
            element="textarea"
            debounceTimeout={500}
            placeholder="Take a note..."
            rows={1}
            className="mb-1 max-h-[50vh] min-h-[44px] w-full resize-none overflow-y-auto border-0 bg-transparent text-sm text-[#e4e4e7] outline-none placeholder:text-[#a1a1aa] sm:min-h-[40px]"
            value={note.body}
            inputRef={(el) => {
              bodyTextareaRef.current = el as HTMLTextAreaElement | null;
            }}
            onInput={resizeBodyTextarea}
            onChange={(e) => onChange(note.id, { body: e.target.value })}
          />
          {(() => {
            const prog = checklistProgress(note.body);
            if (prog.total === 0) return null;
            const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
            return (
              <div className="mb-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-zinc-700"><div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} /></div>
                <span className="text-[10px] text-zinc-400">{prog.done}/{prog.total}</span>
              </div>
            );
          })()}
          {parseChecklist(note.body).length > 0 ? (
            <div className="mb-1 flex flex-col gap-1">
              {parseChecklist(note.body).map((it) => (
                <label key={it.lineIndex} className="flex items-center gap-2 text-xs text-zinc-200">
                  <input type="checkbox" aria-label={it.checked ? 'Uncheck item' : 'Check item'} checked={it.checked} onChange={() => { const next = toggleChecklistLine(note.body, it.lineIndex); onChange(note.id, { body: next }); }} className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 text-amber-400" />
                  <span className={it.checked ? 'line-through text-zinc-500' : ''}>{it.text || '—'}</span>
                </label>
              ))}
            </div>
          ) : null}
          {onSetReminder ? (
            <div className="mb-1 flex items-center gap-1">
              <input type="datetime-local" aria-label="Reminder time" value={note.reminderTime ? new Date(note.reminderTime - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16) : ''} onChange={(e) => { const v = e.target.value ? new Date(e.target.value).toISOString() : null; onSetReminder(note.id, v); }} className="h-7 rounded border border-zinc-600 bg-zinc-800 px-1 text-xs text-zinc-200" />
              {note.reminderTime ? <span className="rounded-full bg-amber-900/40 px-1.5 py-0.5 text-[10px] text-amber-300">{new Date(note.reminderTime).toLocaleString()}</span> : null}
            </div>
          ) : null}

          <MemoLabelBadgeRow note={note} labels={labels} className="mb-1" />
        </>
      ) : null}

      {colorOpen ? (
        <div className="mb-1 mt-1 flex flex-wrap gap-1.5 rounded-lg border border-[#3f3f46] bg-[#27272a]/80 p-1.5">
          {MEMO_NOTE_COLOR_KEYS.filter((k) => k !== '').map((key) => {
            const hex = MEMO_NOTE_COLOR_HEX[key as Exclude<MemoNoteColorKey, ''>];
            return (
              <button
                key={key}
                type="button"
                title={key}
                className={`h-7 w-7 rounded-full border-2 shadow-sm ${
                  note.noteColor === key
                    ? 'border-[#1a73e8] ring-1 ring-[#1a73e8]/30'
                    : 'border-[#52525b] ring-1 ring-[#52525b]'
                }`}
                style={{ backgroundColor: hex }}
                onClick={() => onChange(note.id, { noteColor: key })}
              />
            );
          })}
          <button
            type="button"
            title="Default white"
            className="h-7 w-7 rounded-full border-2 border-dashed border-[#52525b] bg-[#27272a] text-[9px] font-medium text-[#a1a1aa]"
            onClick={() => onChange(note.id, { noteColor: '' })}
          >
            ∅
          </button>
        </div>
      ) : null}

      {labelsOpen ? (
        <div className="mb-1 mt-1 rounded-lg border border-[#3f3f46] bg-[#18181b] p-1.5">
          <MemoLabelPicklist
            labels={labels}
            selectedIds={note.labelIds}
            onChange={(ids) => onChange(note.id, { labelIds: ids })}
            idPrefix={`memo-card-${note.id}`}
            layout="pills"
          />
        </div>
      ) : null}

      {actionCluster}
    </>
  );
}

type StaticBodyProps = {
  variant: 'archive' | 'bin';
  note: MemoNote;
  labels: MemoLabel[];
  viewMode: 'grid' | 'list';
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  onClearMemoImages?: MemoNoteCardProps['onClearMemoImages'];
  onArchive: MemoNoteCardProps['onArchive'];
  onTrash: MemoNoteCardProps['onTrash'];
  onRestore?: MemoNoteCardProps['onRestore'];
  onDeleteForever?: MemoNoteCardProps['onDeleteForever'];
  onUnarchive?: MemoNoteCardProps['onUnarchive'];
};

function MemoCardStaticBody({
  variant,
  note,
  labels,
  viewMode,
  menuOpen,
  setMenuOpen,
  onClearMemoImages,
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
  onUnarchive,
}: StaticBodyProps) {
  const [expandedManual, setExpandedManual] = useState(false);
  const expanded = viewMode === 'grid' || expandedManual;
  const titleDisplay = note.title.trim() || 'Untitled';
  const hasDetails = Boolean(note.body.trim() || note.imageDataUrls.length > 0);

  return (
    <>
      <div className="flex min-w-0 items-start gap-0.5">
        {viewMode === 'list' ? (
          <button
            type="button"
            className={`${iconBtn} mt-0.5 shrink-0 ${hasDetails || expanded ? '' : 'invisible'}`}
            aria-label={expanded ? 'Collapse note' : 'Expand note'}
            aria-expanded={expanded}
            title={expanded ? 'Collapse' : 'Expand'}
            disabled={!hasDetails && !expanded}
            onClick={() => setExpandedManual((v) => !v)}
          >
            {expanded ? (
              <LucideChevronUp className="h-4 w-4" strokeWidth={2} />
            ) : (
              <LucideChevronDown className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        ) : null}
        {viewMode === 'list' && !expanded ? (
          <button
            type="button"
            className={`min-w-0 flex-1 truncate py-1 text-left text-sm font-medium ${
              note.title.trim() ? 'text-[#e4e4e7]' : 'text-[#a1a1aa]'
            }`}
            style={ff}
            aria-expanded={false}
            title={hasDetails ? 'Expand note' : titleDisplay}
            onClick={() => setExpandedManual(true)}
          >
            {titleDisplay}
          </button>
        ) : (
          <div
            className={`min-w-0 flex-1 py-1 text-sm font-medium ${
              note.title.trim() ? 'text-[#e4e4e7]' : 'text-[#a1a1aa]'
            }`}
            style={ff}
          >
            {titleDisplay}
          </div>
        )}
      </div>

      {expanded ? (
        <>
          {note.imageDataUrls.length > 0 ? (
            <div className="mb-1.5 mt-1 flex flex-wrap gap-2">
              {note.imageDataUrls.map((src, idx) =>
                memoAttachmentLooksLikeImage(src) ? (
                  <MemoStoredImage
                    key={`${src}-${idx}`}
                    stored={src}
                    alt=""
                    className="max-h-40 max-w-[min(100%,240px)] rounded-md border border-[#52525b]/50 object-contain"
                  />
                ) : (
                  <a
                    key={`${src}-${idx}`}
                    href={memoImageDisplaySrc(src)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex max-w-[240px] items-center gap-2 rounded-md border border-[#52525b] bg-[#27272a] px-2 py-1.5 text-xs text-[#e4e4e7] hover:bg-[#18181b]"
                    title={memoAttachmentDisplayName(src, idx)}
                  >
                    <LucidePaperclip className="h-3.5 w-3.5 shrink-0 text-[#a1a1aa]" strokeWidth={2} aria-hidden />
                    <span className="truncate">{memoAttachmentDisplayName(src, idx)}</span>
                  </a>
                ),
              )}
            </div>
          ) : null}
          <p
            className={`mb-1 min-h-[1.25rem] whitespace-pre-wrap text-sm ${
              note.body.trim() ? 'text-[#e4e4e7]' : 'text-[#a1a1aa]'
            }`}
            style={ff}
          >
            {note.body.trim() || 'Take a note...'}
          </p>
          <MemoLabelBadgeRow note={note} labels={labels} />
        </>
      ) : null}

      <div className="relative z-10 mt-1 flex justify-end gap-0.5">
        <MemoCardOverflowMenu
          variant={variant}
          note={note}
          open={menuOpen}
          setOpen={setMenuOpen}
          onClearMemoImages={onClearMemoImages}
          onArchive={onArchive}
          onTrash={onTrash}
          onRestore={onRestore}
          onDeleteForever={onDeleteForever}
          onUnarchive={onUnarchive}
        />
      </div>
    </>
  );
}

export default function MemoNoteCard({
  note,
  labels,
  viewMode,
  variant,
  onChange,
  onRemoveMemoImage,
  onClearMemoImages,
  onTogglePin,
  onReorderDragStart,
  onReorderDragEnd,
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
  onUnarchive,
  onAppendMemoImages,
  onCopy,
  onDuplicate,
  onSetReminder,
}: MemoNoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const memoImageInputId = `memo-card-file-${note.id}`;

  const uploadImagesForCard = (rawFiles: File[]) => {
    void (async () => {
      const files = rawFiles.filter((file) => file.size > 0);
      if (!files.length) {
        toast.error('Choose at least one file');
        return;
      }
      const current = note.imageDataUrls;
      const remaining = MEMO_MAX_IMAGES_PER_NOTE - current.length;
      if (remaining <= 0) {
        toast.error(`At most ${MEMO_MAX_IMAGES_PER_NOTE} files per note`);
        return;
      }
      const list = files.slice(0, remaining);
      const tid = `memo-card-file-${note.id}`;
      toast.loading(list.length > 1 ? 'Uploading files…' : 'Uploading file…', { id: tid });
      try {
        const paths: string[] = [];
        for (const file of list) {
          paths.push(await uploadMemoNoteImage(file, envKeys.API_URL, note.id));
        }
        if (onAppendMemoImages) {
          await onAppendMemoImages(note.id, paths);
        }
        if (files.length > remaining) {
          toast.success(`Added ${paths.length} file(s) (limit ${MEMO_MAX_IMAGES_PER_NOTE})`, { id: tid });
        } else {
          toast.success(paths.length > 1 ? 'Files added' : 'File added', { id: tid });
        }
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Upload failed', { id: tid });
      }
    })();
  };

  return (
    <article
      className={`${cardClassName(viewMode, variant, note.pinned)} relative max-w-full break-words [overflow-wrap:anywhere]`}
      style={{ ...memoNoteBackgroundStyle(note.noteColor), ...ff }}
    >
      <div className="min-w-0 flex-1">
        {variant === 'default' ? (
          <MemoCardEditableBody
            note={note}
            labels={labels}
            memoImageInputId={memoImageInputId}
            viewMode={viewMode}
            colorOpen={colorOpen}
            setColorOpen={setColorOpen}
            labelsOpen={labelsOpen}
            setLabelsOpen={setLabelsOpen}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onChange={onChange}
            onTogglePin={onTogglePin}
            onReorderDragStart={onReorderDragStart}
            onReorderDragEnd={onReorderDragEnd}
            onArchive={onArchive}
            onTrash={onTrash}
            onRemoveMemoImage={onRemoveMemoImage}
            onClearMemoImages={onClearMemoImages}
            uploadImagesForCard={uploadImagesForCard}
            onCopy={onCopy}
            onDuplicate={onDuplicate}
            onSetReminder={onSetReminder}
          />
        ) : (
          <MemoCardStaticBody
            variant={variant}
            note={note}
            labels={labels}
            viewMode={viewMode}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onClearMemoImages={onClearMemoImages}
            onArchive={onArchive}
            onTrash={onTrash}
            onRestore={onRestore}
            onDeleteForever={onDeleteForever}
            onUnarchive={onUnarchive}
          />
        )}
      </div>
    </article>
  );
}
