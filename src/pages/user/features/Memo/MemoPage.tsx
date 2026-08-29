import { Helmet } from 'react-helmet-async';
import type { DragEvent as ReactDragEvent, TouchEvent as ReactTouchEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import MemoLabelsModal from './MemoLabelsModal';
import MemoNoteCard from './MemoNoteCard';
import MemoNoteComposer from './MemoNoteComposer';
import MemoSidebar from './MemoSidebar';
import MemoToolbar from './MemoToolbar';
import { exportMemosToCsv } from './memoExport';
import type { MemoNavSelection, MemoNote } from './memoTypes';
import { memoNoteGridClass, memoNoteListClass } from './memoLayoutClasses';
import { useMemoNotes } from './useMemoNotes';

const MEMO_DND_MIME = 'text/memo-id';
const MEMO_VIEW_MODE_KEY = 'memo-view-mode';
const MEMO_SORT_KEY = 'memo-sort';

function readStoredViewMode(): 'grid' | 'list' {
  try {
    const v = localStorage.getItem(MEMO_VIEW_MODE_KEY);
    if (v === 'list' || v === 'grid') return v;
  } catch { /* ignore */ }
  return 'grid';
}
function readStoredSort(): 'updated' | 'created' | 'title' {
  try {
    const v = localStorage.getItem(MEMO_SORT_KEY);
    if (v === 'updated' || v === 'created' || v === 'title') return v;
  } catch { /* ignore */ }
  return 'updated';
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

function matchesSearch(n: MemoNote, q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const labelsBlob = n.labelNames.join(' ').toLowerCase();
  return n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s) || labelsBlob.includes(s);
}

function labelNameFor(nav: MemoNavSelection, labels: { id: string; name: string }[]) {
  if (nav.kind !== 'label') return '';
  return labels.find((l) => l.id === nav.labelId)?.name ?? 'Label';
}

function memoDisplayOrder(a: MemoNote, b: MemoNote) {
  const ka = a.sortOrder || a.updatedAt;
  const kb = b.sortOrder || b.updatedAt;
  if (kb !== ka) return kb - ka;
  return b.updatedAt - a.updatedAt;
}

const MOBILE_MENU_SWIPE_MIN_DX = 36;
const MOBILE_MENU_SWIPE_MAX_DY = 140;

export default function MemoPage() {
  const isDesktop = useIsDesktop();
  const [selection, setSelection] = useState<MemoNavSelection>({ kind: 'notes' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(readStoredViewMode);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>(readStoredSort);
  const [filterLabelIds, setFilterLabelIds] = useState<string[]>([]);
  const [desktopSidebarNarrow, setDesktopSidebarNarrow] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [labelsModalOpen, setLabelsModalOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<{ ids: string[]; action: string; snapshot: MemoNote[] } | null>(null);
  const searchInputContainerRef = useRef<HTMLDivElement | null>(null);

  const { notes, labels, loading, refresh, addNote, updateNote, appendNoteImages, removeMemoImage, clearMemoImages, togglePin, reorderNote, archiveNote, trashNote, restoreNote, deleteForever, emptyBin, addLabel, renameLabel, deleteLabel, setReminder } = useMemoNotes();

  useEffect(() => {
    if (selection.kind !== 'label') return;
    if (!labels.some((l) => l.id === selection.labelId)) setSelection({ kind: 'notes' });
  }, [labels, selection]);

  const onMenuClick = useCallback(() => {
    if (isDesktop) setDesktopSidebarNarrow((v) => !v);
    else setMobileSidebarOpen((v) => !v);
  }, [isDesktop]);

  const mobileEdgeSwipeRef = useRef<{ id: number; x0: number; y0: number } | null>(null);
  const onMobileEdgeTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (!t) return;
    mobileEdgeSwipeRef.current = { id: t.identifier, x0: t.clientX, y0: t.clientY };
  }, []);
  const onMobileEdgeTouchEnd = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    const s = mobileEdgeSwipeRef.current;
    if (!s) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== s.id) continue;
      mobileEdgeSwipeRef.current = null;
      const dx = t.clientX - s.x0;
      const dy = Math.abs(t.clientY - s.y0);
      if (dx >= MOBILE_MENU_SWIPE_MIN_DX && dy <= MOBILE_MENU_SWIPE_MAX_DY) setMobileSidebarOpen(true);
      return;
    }
  }, []);
  const onMobileEdgeTouchCancel = useCallback(() => { mobileEdgeSwipeRef.current = null; }, []);

  const labelNoteCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of notes) {
      if (n.trashed || n.archived) continue;
      for (const id of n.labelIds) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [notes]);

  const filtered = useMemo(() => {
    const q = searchQuery;
    return notes.filter((n) => {
      if (!matchesSearch(n, q)) return false;
      if (filterLabelIds.length > 0 && !n.labelIds.some((id) => filterLabelIds.includes(id))) return false;
      if (selection.kind === 'bin') return n.trashed;
      if (n.trashed) return false;
      if (selection.kind === 'archive') return n.archived;
      if (n.archived) return false;
      if (selection.kind === 'label') return n.labelIds.includes(selection.labelId);
      if (selection.kind === 'reminders') return Boolean(n.reminderTime);
      return true;
    });
  }, [notes, selection, searchQuery, filterLabelIds]);

  const sortFn = useCallback((a: MemoNote, b: MemoNote) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'created') return b.createdAt - a.createdAt;
    return memoDisplayOrder(a, b);
  }, [sortBy]);
  const pinned = useMemo(() => filtered.filter((n) => n.pinned).sort(sortFn), [filtered, sortFn]);
  const others = useMemo(() => filtered.filter((n) => !n.pinned).sort(sortFn), [filtered, sortFn]);
  const pinnedIds = useMemo(() => pinned.map((n) => n.id), [pinned]);
  const othersIds = useMemo(() => others.map((n) => n.id), [others]);

  const sidebarCollapsed = isDesktop && desktopSidebarNarrow;
  const mainMargin = isDesktop ? (desktopSidebarNarrow ? 72 : 280) : 0;
  const showComposer = selection.kind === 'notes' || selection.kind === 'label';
  const showSections = selection.kind === 'notes' || selection.kind === 'label' || selection.kind === 'reminders';
  const notesLayoutClass = viewMode === 'grid' ? memoNoteGridClass : memoNoteListClass;

  const setAndStoreViewMode = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    try { localStorage.setItem(MEMO_VIEW_MODE_KEY, mode); } catch { /* ignore */ }
  }, []);
  const setAndStoreSort = useCallback((v: 'updated' | 'created' | 'title') => {
    setSortBy(v);
    try { localStorage.setItem(MEMO_SORT_KEY, v); } catch { /* ignore */ }
  }, []);

  const onReorderDragStart = useCallback((id: string, e: ReactDragEvent) => {
    e.dataTransfer.setData(MEMO_DND_MIME, id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  }, []);
  const onReorderDragEnd = useCallback(() => setDraggingId(null), []);
  const onNoteDragOver = useCallback((e: ReactDragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onNoteDrop = useCallback((targetId: string, orderedIds: string[]) => (e: ReactDragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const sourceId = e.dataTransfer.getData(MEMO_DND_MIME) || draggingId;
    setDraggingId(null);
    if (!sourceId || sourceId === targetId) return;
    if (!orderedIds.includes(sourceId) || !orderedIds.includes(targetId)) return;
    const toIndex = orderedIds.indexOf(targetId);
    if (toIndex < 0) return;
    void reorderNote(sourceId, toIndex, orderedIds);
  }, [draggingId, reorderNote]);

  const pushUndo = useCallback((ids: string[], action: string) => {
    const snap = notes.filter((n) => ids.includes(n.id));
    setUndoStack({ ids, action, snapshot: snap });
  }, [notes]);

  const doTrashWithUndo = useCallback((id: string) => {
    pushUndo([id], 'trash');
    void trashNote(id);
    toast(() => ({
      message: 'Moved to bin',
      duration: 4000,
    } as unknown as string), { id: 'undo-trash' });
    toast.success('Moved to bin — Undo?', { duration: 4000 });
  }, [pushUndo, trashNote]);

  const undoLast = useCallback(() => {
    if (!undoStack) return;
    for (const n of undoStack.snapshot) {
      if (undoStack.action === 'trash') void restoreNote(n.id);
      if (undoStack.action === 'archive') void updateNote(n.id, { archived: false });
    }
    setUndoStack(null);
    toast.success('Undone');
  }, [undoStack, restoreNote, updateNote]);

  const handleCopy = useCallback((id: string) => {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    const text = `${n.title}\n${n.body}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast.success('Copied')).catch(() => toast.error('Copy failed'));
    } else {
      toast.error('Clipboard not available');
    }
  }, [notes]);

  const handleDuplicate = useCallback((id: string) => {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    void addNote({ title: n.title ? `${n.title} (copy)` : 'Copy', body: n.body, labelIds: n.labelIds, noteColor: n.noteColor, reminderTime: n.reminderTime ? new Date(n.reminderTime).toISOString() : null });
    toast.success('Duplicated');
  }, [notes, addNote]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = document.activeElement as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!typing && e.key === '/') {
        e.preventDefault();
        const el = document.querySelector('input[placeholder="Search memos"]') as HTMLInputElement | null;
        if (el) el.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      for (const n of notes) {
        if (n.reminderTime && n.reminderTime <= now && n.reminderTime > now - 60000 && !n.trashed && !n.archived) {
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(n.title || 'Memo reminder', { body: n.body.slice(0, 120) });
            }
          } catch { /* ignore */ }
        }
      }
    };
    const id = window.setInterval(check, 30000);
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
    return () => window.clearInterval(id);
  }, [notes]);

  if (loading && notes.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-60px)] items-center justify-center overflow-x-hidden bg-[#18181b] px-4 text-xs text-[#a1a1aa] md:min-h-[calc(100vh-60px)]" style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
        <Helmet><title>Memo</title></Helmet>
        Loading memos…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-60px)] overflow-x-hidden bg-[#18181b] pb-[env(safe-area-inset-bottom,0px)] md:min-h-[calc(100vh-60px)]" style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
      <Helmet><title>Memo</title></Helmet>
      <MemoLabelsModal open={labelsModalOpen} labels={labels} onClose={() => setLabelsModalOpen(false)} onAdd={(name) => addLabel(name)} onRename={(id, name) => renameLabel(id, name)} onDelete={(id) => deleteLabel(id)} />
      {!isDesktop && mobileSidebarOpen ? <button type="button" className="fixed inset-0 top-[60px] z-[140] touch-manipulation bg-black/25" aria-label="Close sidebar" onClick={() => setMobileSidebarOpen(false)} /> : null}
      {!isDesktop && !mobileSidebarOpen && !labelsModalOpen ? <div aria-hidden className="fixed left-0 top-[60px] z-[135] h-[calc(100dvh-60px)] w-2 touch-none md:hidden" onTouchStart={onMobileEdgeTouchStart} onTouchEnd={onMobileEdgeTouchEnd} onTouchCancel={onMobileEdgeTouchCancel} /> : null}
      <div className={`fixed left-0 top-[60px] z-[150] flex h-[calc(100dvh-60px)] flex-col border-r border-[#3f3f46] bg-[#27272a] shadow-lg transition-[width,transform] duration-200 ease-out md:h-[calc(100vh-60px)] md:shadow-none ${isDesktop ? desktopSidebarNarrow ? 'w-[72px] max-w-[72px] translate-x-0' : 'w-[min(280px,85vw)] max-w-[280px] translate-x-0 sm:w-[280px]' : `w-[min(280px,min(85vw,20rem))] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${!mobileSidebarOpen ? 'pointer-events-none' : ''}`}`}>
        <MemoSidebar selection={selection} labels={labels} labelNoteCounts={labelNoteCounts} onSelect={setSelection} onEditLabels={() => setLabelsModalOpen(true)} collapsed={sidebarCollapsed} onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>
      <main className={`min-h-[calc(100dvh-60px)] min-w-0 max-w-[1600px] px-2.5 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-3 sm:px-3 sm:pt-4 md:min-h-[calc(100vh-60px)] md:px-5 md:pt-4 lg:px-6 ${isDesktop ? '' : 'mx-auto w-full'}`} style={isDesktop ? { marginLeft: mainMargin, width: `calc(100% - ${mainMargin}px)` } : undefined}>
        <div ref={searchInputContainerRef}>
          <MemoToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} onMenuClick={onMenuClick} viewMode={viewMode} onViewModeChange={setAndStoreViewMode} sortBy={sortBy} onSortChange={setAndStoreSort} filterLabelIds={filterLabelIds} onFilterLabelIdsChange={setFilterLabelIds} labels={labels} onRefresh={() => { void refresh(); toast.success('Synced'); }} />
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <button type="button" aria-label="Export CSV" onClick={() => exportMemosToCsv(filtered)} className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700">Export CSV</button>
          {undoStack ? <button type="button" aria-label="Undo last action" onClick={undoLast} className="rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-black">Undo</button> : null}
        </div>

        {selection.kind === 'reminders' && filtered.length === 0 ? <p className="mx-auto max-w-xl px-1 py-8 text-center text-xs leading-relaxed text-[#a1a1aa] sm:py-10 sm:text-sm">No reminders — set a date via the reminder picker on a memo.</p> : null}
        {selection.kind === 'bin' && filtered.length > 0 && <div className="mb-3 flex flex-wrap justify-stretch gap-2 sm:mb-4 sm:justify-end"><button type="button" aria-label="Restore all" className="min-h-9 rounded-lg bg-[#27272a] px-3 text-xs font-medium text-[#e4e4e7] hover:bg-[#52525b]" onClick={() => { for (const n of filtered) void restoreNote(n.id); toast.success('Restored all'); }}>Restore all</button><button type="button" aria-label="Empty bin" className="min-h-9 rounded-lg px-3 text-xs font-medium text-[#e4e4e7] hover:bg-[#52525b] sm:px-2.5 sm:py-1.5" onClick={() => void emptyBin()}>Empty bin</button></div>}
        {selection.kind === 'archive' && filtered.length > 0 && <div className="mb-3 flex justify-end"><button type="button" aria-label="Unarchive all" className="min-h-9 rounded-lg bg-[#27272a] px-3 text-xs font-medium text-[#e4e4e7] hover:bg-[#52525b]" onClick={() => { for (const n of filtered) void updateNote(n.id, { archived: false }); toast.success('Unarchived all'); }}>Unarchive all</button></div>}
        {selection.kind === 'archive' && filtered.length === 0 && <p className="py-12 text-center text-sm text-[#a1a1aa]">No archived memos — archive notes to see them here.</p>}
        {selection.kind === 'bin' && filtered.length === 0 && <p className="py-12 text-center text-sm text-[#a1a1aa]">Bin is empty.</p>}

        {showComposer ? <MemoNoteComposer labels={labels} onSave={(input) => addNote(input)} /> : null}

        <div className="mt-4 sm:mt-5">
          {showSections && pinned.length > 0 ? (
            <>
              <h2 className="mb-2 text-[10px] font-medium tracking-widest text-[#a1a1aa] sm:mb-2.5">PINNED</h2>
              <div className={notesLayoutClass}>
                {pinned.map((n) => (
                  <div key={n.id} className={`${viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''} ${draggingId === n.id ? 'opacity-50' : ''} ${draggingId && draggingId !== n.id ? 'ring-1 ring-dashed ring-[#52525b] rounded-lg' : ''}`} onDragOver={onNoteDragOver} onDrop={onNoteDrop(n.id, pinnedIds)}>
                    <MemoNoteCard note={n} labels={labels} viewMode={viewMode} variant="default" onChange={(id, patch) => void updateNote(id, patch)} onRemoveMemoImage={(id, url) => void removeMemoImage(id, url)} onClearMemoImages={(id) => void clearMemoImages(id)} onAppendMemoImages={(id, paths) => appendNoteImages(id, paths)} onTogglePin={(id) => void togglePin(id)} onReorderDragStart={onReorderDragStart} onReorderDragEnd={onReorderDragEnd} onArchive={(id) => { pushUndo([id], 'archive'); void archiveNote(id); toast.success('Archived — Undo?', { duration: 3000 }); }} onTrash={(id) => doTrashWithUndo(id)} onCopy={handleCopy} onDuplicate={handleDuplicate} onSetReminder={(id, iso) => void setReminder(id, iso)} />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {showSections && others.length > 0 ? (
            <>
              <h2 className={`mb-2 text-[10px] font-medium tracking-widest text-[#a1a1aa] sm:mb-2.5 ${pinned.length ? 'mt-5 sm:mt-6' : ''}`}>{selection.kind === 'label' ? labelNameFor(selection, labels).toUpperCase() : selection.kind === 'reminders' ? 'REMINDERS' : 'OTHERS'}</h2>
              <div className={notesLayoutClass}>
                {others.map((n) => (
                  <div key={n.id} className={`${viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''} ${draggingId === n.id ? 'opacity-50' : ''} ${draggingId && draggingId !== n.id ? 'ring-1 ring-dashed ring-[#52525b] rounded-lg' : ''}`} onDragOver={onNoteDragOver} onDrop={onNoteDrop(n.id, othersIds)}>
                    <MemoNoteCard note={n} labels={labels} viewMode={viewMode} variant="default" onChange={(id, patch) => void updateNote(id, patch)} onRemoveMemoImage={(id, url) => void removeMemoImage(id, url)} onClearMemoImages={(id) => void clearMemoImages(id)} onAppendMemoImages={(id, paths) => appendNoteImages(id, paths)} onTogglePin={(id) => void togglePin(id)} onReorderDragStart={onReorderDragStart} onReorderDragEnd={onReorderDragEnd} onArchive={(id) => { pushUndo([id], 'archive'); void archiveNote(id); toast.success('Archived'); }} onTrash={(id) => doTrashWithUndo(id)} onCopy={handleCopy} onDuplicate={handleDuplicate} onSetReminder={(id, iso) => void setReminder(id, iso)} />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {selection.kind === 'archive' && <div className={notesLayoutClass}>{filtered.map((n) => <div key={n.id} className={viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''}><MemoNoteCard note={n} labels={labels} viewMode={viewMode} variant="archive" onChange={() => {}} onTogglePin={() => {}} onArchive={() => {}} onTrash={(id) => void trashNote(id)} onUnarchive={(id) => void updateNote(id, { archived: false })} /></div>)}</div>}
          {selection.kind === 'bin' && <div className={notesLayoutClass}>{filtered.map((n) => <div key={n.id} className={viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''}><MemoNoteCard note={n} labels={labels} viewMode={viewMode} variant="bin" onChange={() => {}} onTogglePin={() => {}} onArchive={() => {}} onTrash={() => {}} onRestore={(id) => void restoreNote(id)} onDeleteForever={(id) => void deleteForever(id)} /></div>)}</div>}

          {selection.kind === 'reminders' && filtered.length === 0 ? null : !showSections && filtered.length === 0 && <p className="px-2 py-8 text-center text-xs leading-relaxed text-[#a1a1aa] sm:py-10 sm:text-sm">Nothing here yet.</p>}
          {(selection.kind === 'notes' || selection.kind === 'label') && pinned.length === 0 && others.length === 0 && <p className="px-2 py-8 text-center text-xs leading-relaxed text-[#a1a1aa] sm:py-10 sm:text-sm">{selection.kind === 'label' ? `No memos with the "${labelNameFor(selection, labels)}" label.` : searchQuery.trim() ? 'No notes match your search.' : 'No memos yet. Use Take a note… above.'}</p>}
        </div>
      </main>
    </div>
  );
}
