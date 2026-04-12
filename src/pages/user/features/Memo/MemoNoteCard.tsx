import {
  LucideArchive,
  LucideBrush,
  LucideImage,
  LucideMoreVertical,
  LucidePaperclip,
  LucidePin,
  LucideTag,
  LucideTrash2,
  LucideX,
} from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
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

type MemoNoteCardProps = {
  note: MemoNote;
  labels: MemoLabel[];
  viewMode: 'grid' | 'list';
  variant: 'default' | 'bin' | 'archive';
  onChange: (id: string, patch: Partial<Pick<MemoNote, 'title' | 'body' | 'labelIds' | 'noteColor'>>) => void;
  /** Remove one image (storage path or legacy `data:image/...`). */
  onRemoveMemoImage?: (id: string, imageUrlOrPath: string) => void | Promise<void>;
  /** Clear all images for the note (memoFiles + legacy). */
  onClearMemoImages?: (id: string) => void | Promise<void>;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onRestore?: (id: string) => void;
  onDeleteForever?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onAppendMemoImages?: (id: string, paths: string[]) => void | Promise<void>;
};

const ff = { fontFamily: 'Roboto, system-ui, sans-serif' } as const;

const iconBtn =
  'flex h-8 min-h-[32px] w-8 min-w-[32px] items-center justify-center rounded-full text-[#5f6368] transition hover:bg-black/[0.06] active:bg-black/[0.1]';

const dashedTool =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-[#dadce0] bg-white/65 text-[#5f6368] backdrop-blur-[1px] transition hover:border-[#bdc1c6] hover:bg-white/85 hover:text-[#3c4043]';

const menuItem =
  'flex min-h-[32px] w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-sm text-[#3c4043] hover:bg-[#f1f3f4] active:bg-[#e8eaed]';

const imgThumbClass = 'max-h-40 max-w-full rounded-md border border-[#dadce0]/50 object-contain';

function cardClassName(viewMode: 'grid' | 'list', variant: MemoNoteCardProps['variant'], pinned: boolean): string {
  const pin = variant === 'default' && pinned;
  const border = pin ? 'border-[#f9ab00]/50 ring-1 ring-[#feefc3]' : 'border-[#dadce0]';
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
            className="absolute right-0 bottom-full z-[170] mb-1 w-max min-w-[10rem] max-w-[min(18rem,calc(100vw-2rem))] rounded-md border border-[#dadce0] bg-white py-1 shadow-lg"
          >
            {variant === 'default' && (
              <>
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
                  className={`${menuItem} text-rose-700 hover:bg-rose-50 active:bg-rose-100`}
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
  colorOpen: boolean;
  setColorOpen: Dispatch<SetStateAction<boolean>>;
  labelsOpen: boolean;
  setLabelsOpen: Dispatch<SetStateAction<boolean>>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  onChange: MemoNoteCardProps['onChange'];
  onTogglePin: MemoNoteCardProps['onTogglePin'];
  onArchive: MemoNoteCardProps['onArchive'];
  onTrash: MemoNoteCardProps['onTrash'];
  onRemoveMemoImage?: MemoNoteCardProps['onRemoveMemoImage'];
  onClearMemoImages?: MemoNoteCardProps['onClearMemoImages'];
  uploadImagesForCard: (files: File[]) => void;
};

function MemoCardEditableBody({
  note,
  labels,
  memoImageInputId,
  colorOpen,
  setColorOpen,
  labelsOpen,
  setLabelsOpen,
  menuOpen,
  setMenuOpen,
  onChange,
  onTogglePin,
  onArchive,
  onTrash,
  onRemoveMemoImage,
  onClearMemoImages,
  uploadImagesForCard,
}: EditableBodyProps) {
  const atImageLimit = note.imageDataUrls.length >= MEMO_MAX_IMAGES_PER_NOTE;

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
          uploadImagesForCard(picked);
        }}
      />

      {note.imageDataUrls.length > 0 ? (
        <div className="mb-1.5 flex flex-wrap gap-2">
          {note.imageDataUrls.map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative inline-block max-w-[min(100%,240px)]">
              {memoAttachmentLooksLikeImage(src) ? (
                <MemoStoredImage stored={src} alt="" className={imgThumbClass} />
              ) : (
                <a
                  href={memoImageDisplaySrc(src)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex max-w-[240px] items-center gap-2 rounded-md border border-[#dadce0] bg-white px-2 py-1.5 text-xs text-[#3c4043] hover:bg-[#f8f9fa]"
                  title={memoAttachmentDisplayName(src, idx)}
                >
                  <LucidePaperclip className="h-3.5 w-3.5 shrink-0 text-[#5f6368]" strokeWidth={2} aria-hidden />
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
                  const src = note.imageDataUrls[idx];
                  if (src && onRemoveMemoImage) void onRemoveMemoImage(note.id, src);
                }}
              >
                <LucideX className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <DebounceInput
        element="input"
        debounceTimeout={500}
        placeholder="Title"
        className="mb-0.5 w-full border-0 bg-transparent text-sm font-medium text-[#3c4043] outline-none placeholder:text-[#5f6368]"
        value={note.title}
        onChange={(e) => onChange(note.id, { title: e.target.value })}
      />
      <DebounceInput
        element="textarea"
        debounceTimeout={500}
        placeholder="Take a note..."
        className="mb-1 min-h-[44px] w-full resize-y border-0 bg-transparent text-sm text-[#3c4043] outline-none placeholder:text-[#5f6368] sm:min-h-[40px]"
        value={note.body}
        onChange={(e) => onChange(note.id, { body: e.target.value })}
      />

      <div className="mb-1 flex min-w-0 flex-nowrap items-center justify-between gap-1">
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
            className={`${dashedTool} shrink-0 ${colorOpen ? 'border-[#bdc1c6] bg-white/85' : ''}`}
            style={ff}
            onClick={() => setColorOpen((v) => !v)}
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
            className={`${dashedTool} shrink-0 ${labelsOpen ? 'border-[#bdc1c6] bg-white/85' : ''}`}
            style={ff}
            onClick={() => setLabelsOpen((v) => !v)}
          >
            <LucideTag className="h-3 w-3" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="relative z-10 flex shrink-0 items-center gap-0.5">
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
          />
        </div>
      </div>

      {colorOpen ? (
        <div className="mb-1 flex flex-wrap gap-1.5 rounded-lg border border-[#e8eaed] bg-white/80 p-1.5">
          {MEMO_NOTE_COLOR_KEYS.filter((k) => k !== '').map((key) => {
            const hex = MEMO_NOTE_COLOR_HEX[key as Exclude<MemoNoteColorKey, ''>];
            return (
              <button
                key={key}
                type="button"
                title={key}
                className={`h-7 w-7 rounded-full border-2 shadow-sm ${note.noteColor === key ? 'border-[#1a73e8] ring-1 ring-[#1a73e8]/30' : 'border-white ring-1 ring-[#dadce0]'
                  }`}
                style={{ backgroundColor: hex }}
                onClick={() => onChange(note.id, { noteColor: key })}
              />
            );
          })}
          <button
            type="button"
            title="Default white"
            className="h-7 w-7 rounded-full border-2 border-dashed border-[#dadce0] bg-white text-[9px] font-medium text-[#5f6368]"
            onClick={() => onChange(note.id, { noteColor: '' })}
          >
            ∅
          </button>
        </div>
      ) : null}

      <MemoLabelBadgeRow note={note} labels={labels} className="mb-1" />
      {labelsOpen ? (
        <div className="mb-0.5 rounded-lg border border-[#e8eaed] bg-[#f8f9fa] p-1.5">
          <MemoLabelPicklist
            labels={labels}
            selectedIds={note.labelIds}
            onChange={(ids) => onChange(note.id, { labelIds: ids })}
            idPrefix={`memo-card-${note.id}`}
            layout="pills"
          />
        </div>
      ) : null}
    </>
  );
}

type StaticBodyProps = {
  variant: 'archive' | 'bin';
  note: MemoNote;
  labels: MemoLabel[];
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
  menuOpen,
  setMenuOpen,
  onClearMemoImages,
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
  onUnarchive,
}: StaticBodyProps) {
  return (
    <>
      {note.imageDataUrls.length > 0 ? (
        <div className="mb-1.5 flex flex-wrap gap-2">
          {note.imageDataUrls.map((src, idx) => (
            memoAttachmentLooksLikeImage(src) ? (
              <MemoStoredImage
                key={`${src}-${idx}`}
                stored={src}
                alt=""
                className="max-h-40 max-w-[min(100%,240px)] rounded-md border border-[#dadce0]/50 object-contain"
              />
            ) : (
              <a
                key={`${src}-${idx}`}
                href={memoImageDisplaySrc(src)}
                target="_blank"
                rel="noreferrer"
                className="flex max-w-[240px] items-center gap-2 rounded-md border border-[#dadce0] bg-white px-2 py-1.5 text-xs text-[#3c4043] hover:bg-[#f8f9fa]"
                title={memoAttachmentDisplayName(src, idx)}
              >
                <LucidePaperclip className="h-3.5 w-3.5 shrink-0 text-[#5f6368]" strokeWidth={2} aria-hidden />
                <span className="truncate">{memoAttachmentDisplayName(src, idx)}</span>
              </a>
            )
          ))}
        </div>
      ) : null}
      <div
        className={`mb-0.5 text-sm font-medium ${note.title.trim() ? 'text-[#3c4043]' : 'text-[#5f6368]'}`}
        style={ff}
      >
        {note.title.trim() || 'Title'}
      </div>
      <p
        className={`mb-1 min-h-[1.25rem] whitespace-pre-wrap text-sm ${note.body.trim() ? 'text-[#3c4043]' : 'text-[#5f6368]'
          }`}
        style={ff}
      >
        {note.body.trim() || 'Take a note...'}
      </p>
      <MemoLabelBadgeRow note={note} labels={labels} />
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
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
  onUnarchive,
  onAppendMemoImages,
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
            colorOpen={colorOpen}
            setColorOpen={setColorOpen}
            labelsOpen={labelsOpen}
            setLabelsOpen={setLabelsOpen}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onChange={onChange}
            onTogglePin={onTogglePin}
            onArchive={onArchive}
            onTrash={onTrash}
            onRemoveMemoImage={onRemoveMemoImage}
            onClearMemoImages={onClearMemoImages}
            uploadImagesForCard={uploadImagesForCard}
          />
        ) : (
          <MemoCardStaticBody
            variant={variant}
            note={note}
            labels={labels}
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
