import { Helmet } from 'react-helmet-async';
import type { TouchEvent as ReactTouchEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import MemoLabelsModal from './MemoLabelsModal';
import MemoNoteCard from './MemoNoteCard';
import MemoNoteComposer from './MemoNoteComposer';
import MemoSidebar from './MemoSidebar';
import MemoToolbar from './MemoToolbar';
import type { MemoNavSelection, MemoNote } from './memoTypes';
import { memoNoteGridClass } from './memoLayoutClasses';
import { useMemoNotes } from './useMemoNotes';

/** Matches Tailwind `md` — pinned rail + desktop sidebar behavior. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
  );

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
  return (
    n.title.toLowerCase().includes(s) ||
    n.body.toLowerCase().includes(s) ||
    labelsBlob.includes(s)
  );
}

function labelNameFor(nav: MemoNavSelection, labels: { id: string; name: string }[]) {
  if (nav.kind !== 'label') return '';
  return labels.find((l) => l.id === nav.labelId)?.name ?? 'Label';
}

/** Horizontal / vertical tolerance for opening the mobile drawer from the edge strip. */
const MOBILE_MENU_SWIPE_MIN_DX = 36;
const MOBILE_MENU_SWIPE_MAX_DY = 140;

export default function MemoPage() {
  const isDesktop = useIsDesktop();
  const [selection, setSelection] = useState<MemoNavSelection>({ kind: 'notes' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [desktopSidebarNarrow, setDesktopSidebarNarrow] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [labelsModalOpen, setLabelsModalOpen] = useState(false);

  const {
    notes,
    labels,
    loading,
    refresh,
    addNote,
    updateNote,
    appendNoteImages,
    removeMemoImage,
    clearMemoImages,
    togglePin,
    archiveNote,
    trashNote,
    restoreNote,
    deleteForever,
    emptyBin,
    addLabel,
    renameLabel,
    deleteLabel,
  } = useMemoNotes();

  useEffect(() => {
    if (selection.kind !== 'label') return;
    if (!labels.some((l) => l.id === selection.labelId)) {
      setSelection({ kind: 'notes' });
    }
  }, [labels, selection]);

  const onMenuClick = useCallback(() => {
    if (isDesktop) {
      setDesktopSidebarNarrow((v) => !v);
    } else {
      setMobileSidebarOpen((v) => !v);
    }
  }, [isDesktop]);

  /** Narrow fixed strip: reliable hit target; main/sidebar stacking often ate edge touches. */
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
      if (dx >= MOBILE_MENU_SWIPE_MIN_DX && dy <= MOBILE_MENU_SWIPE_MAX_DY) {
        setMobileSidebarOpen(true);
      }
      return;
    }
  }, []);

  const onMobileEdgeTouchCancel = useCallback(() => {
    mobileEdgeSwipeRef.current = null;
  }, []);

  const labelNoteCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of notes) {
      if (n.trashed || n.archived) continue;
      for (const id of n.labelIds) {
        m.set(id, (m.get(id) ?? 0) + 1);
      }
    }
    return m;
  }, [notes]);

  const filtered = useMemo(() => {
    const q = searchQuery;
    return notes.filter((n) => {
      if (!matchesSearch(n, q)) return false;
      if (selection.kind === 'bin') return n.trashed;
      if (n.trashed) return false;
      if (selection.kind === 'archive') return n.archived;
      if (n.archived) return false;
      if (selection.kind === 'label') return n.labelIds.includes(selection.labelId);
      if (selection.kind === 'reminders') return false;
      return true;
    });
  }, [notes, selection, searchQuery]);

  const pinned = useMemo(
    () => filtered.filter((n) => n.pinned).sort((a, b) => b.updatedAt - a.updatedAt),
    [filtered],
  );
  const others = useMemo(
    () => filtered.filter((n) => !n.pinned).sort((a, b) => b.updatedAt - a.updatedAt),
    [filtered],
  );

  const sidebarCollapsed = isDesktop && desktopSidebarNarrow;
  const mainMargin = isDesktop ? (desktopSidebarNarrow ? 72 : 280) : 0;

  const showComposer = selection.kind === 'notes' || selection.kind === 'label';
  const showSections = selection.kind === 'notes' || selection.kind === 'label';
  const emptyReminders = selection.kind === 'reminders';

  if (loading && notes.length === 0) {
    return (
      <div
        className="flex min-h-[calc(100dvh-60px)] items-center justify-center overflow-x-hidden bg-[#f1f3f4] px-4 text-xs text-[#5f6368] md:min-h-[calc(100vh-60px)]"
        style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
      >
        <Helmet>
          <title>Memo</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        Loading memos…
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100dvh-60px)] overflow-x-hidden bg-[#f1f3f4] pb-[env(safe-area-inset-bottom,0px)] md:min-h-[calc(100vh-60px)]"
      style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
    >
      <Helmet>
        <title>Memo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <MemoLabelsModal
        open={labelsModalOpen}
        labels={labels}
        onClose={() => setLabelsModalOpen(false)}
        onAdd={(name) => addLabel(name)}
        onRename={(id, name) => renameLabel(id, name)}
        onDelete={(id) => deleteLabel(id)}
      />

      {!isDesktop && mobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-[60px] z-[140] touch-manipulation bg-black/25"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      {/* Mobile: invisible left strip above content so swipe-right reliably opens the drawer. */}
      {!isDesktop && !mobileSidebarOpen && !labelsModalOpen ? (
        <div
          aria-hidden
          className="fixed left-0 top-[60px] z-[135] h-[calc(100dvh-60px)] w-[max(3rem,calc(env(safe-area-inset-left,0px)+2.25rem))] max-w-[3.5rem] touch-none md:hidden"
          onTouchStart={onMobileEdgeTouchStart}
          onTouchEnd={onMobileEdgeTouchEnd}
          onTouchCancel={onMobileEdgeTouchCancel}
        />
      ) : null}

      <div
        className={`fixed left-0 top-[60px] z-[150] flex h-[calc(100dvh-60px)] flex-col border-r border-[#e8eaed] bg-white shadow-lg transition-[width,transform] duration-200 ease-out md:h-[calc(100vh-60px)] md:shadow-none ${
          isDesktop
            ? desktopSidebarNarrow
              ? 'w-[72px] max-w-[72px] translate-x-0'
              : 'w-[min(280px,85vw)] max-w-[280px] translate-x-0 sm:w-[280px]'
            : `w-[min(280px,min(85vw,20rem))] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${
                !mobileSidebarOpen ? 'pointer-events-none' : ''
              }`
        }`}
      >
        <MemoSidebar
          selection={selection}
          labels={labels}
          labelNoteCounts={labelNoteCounts}
          onSelect={setSelection}
          onEditLabels={() => setLabelsModalOpen(true)}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      <main
        className={`min-h-[calc(100dvh-60px)] min-w-0 max-w-[1600px] px-2.5 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-3 sm:px-3 sm:pt-4 md:min-h-[calc(100vh-60px)] md:px-5 md:pt-4 lg:px-6 ${
          isDesktop ? '' : 'mx-auto w-full'
        }`}
        style={
          isDesktop
            ? { marginLeft: mainMargin, width: `calc(100% - ${mainMargin}px)` }
            : undefined
        }
      >
        <MemoToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={onMenuClick}
          viewMode={viewMode}
          onToggleView={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))}
          onRefresh={() => {
            void refresh();
            toast.success('Synced');
          }}
        />

        {emptyReminders && (
          <p className="mx-auto max-w-xl px-1 py-8 text-center text-xs leading-relaxed text-[#5f6368] sm:py-10 sm:text-sm">
            Notes with reminders you add in the future will show up here.
          </p>
        )}

        {selection.kind === 'bin' && filtered.length > 0 && (
          <div className="mb-3 flex justify-stretch sm:mb-4 sm:justify-end">
            <button
              type="button"
              className="min-h-9 w-full rounded-lg px-3 text-xs font-medium text-[#3c4043] hover:bg-[#dadce0] active:bg-[#ced4da] sm:w-auto sm:rounded sm:px-2.5 sm:py-1.5"
              onClick={() => void emptyBin()}
            >
              Empty bin
            </button>
          </div>
        )}

        {showComposer ? (
          <MemoNoteComposer labels={labels} onSave={(input) => addNote(input)} />
        ) : null}

        <div className="mt-4 sm:mt-5">
          {showSections && pinned.length > 0 ? (
            <>
              <h2 className="mb-2 text-[10px] font-medium tracking-widest text-[#5f6368] sm:mb-2.5">PINNED</h2>
              <div className={viewMode === 'grid' ? memoNoteGridClass : 'flex flex-col gap-2'}>
                {pinned.map((n) => (
                  <div key={n.id} className={viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''}>
                    <MemoNoteCard
                      note={n}
                      labels={labels}
                      viewMode={viewMode}
                      variant="default"
                      onChange={(id, patch) => void updateNote(id, patch)}
                      onRemoveMemoImage={(id, url) => void removeMemoImage(id, url)}
                      onClearMemoImages={(id) => void clearMemoImages(id)}
                      onAppendMemoImages={(id, paths) => appendNoteImages(id, paths)}
                      onTogglePin={(id) => void togglePin(id)}
                      onArchive={(id) => void archiveNote(id)}
                      onTrash={(id) => void trashNote(id)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {showSections && others.length > 0 ? (
            <>
              <h2
                className={`mb-2 text-[10px] font-medium tracking-widest text-[#5f6368] sm:mb-2.5 ${pinned.length ? 'mt-5 sm:mt-6' : ''}`}
              >
                {selection.kind === 'label' ? labelNameFor(selection, labels).toUpperCase() : 'OTHERS'}
              </h2>
              <div className={viewMode === 'grid' ? memoNoteGridClass : 'flex flex-col gap-2'}>
                {others.map((n) => (
                  <div key={n.id} className={viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''}>
                    <MemoNoteCard
                      note={n}
                      labels={labels}
                      viewMode={viewMode}
                      variant="default"
                      onChange={(id, patch) => void updateNote(id, patch)}
                      onRemoveMemoImage={(id, url) => void removeMemoImage(id, url)}
                      onClearMemoImages={(id) => void clearMemoImages(id)}
                      onAppendMemoImages={(id, paths) => appendNoteImages(id, paths)}
                      onTogglePin={(id) => void togglePin(id)}
                      onArchive={(id) => void archiveNote(id)}
                      onTrash={(id) => void trashNote(id)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {selection.kind === 'archive' && (
            <div className={viewMode === 'grid' ? memoNoteGridClass : 'flex flex-col gap-2'}>
              {filtered.map((n) => (
                <div key={n.id} className={viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''}>
                  <MemoNoteCard
                    note={n}
                    labels={labels}
                    viewMode={viewMode}
                    variant="archive"
                    onChange={() => {}}
                    onTogglePin={() => {}}
                    onArchive={() => {}}
                    onTrash={(id) => void trashNote(id)}
                    onUnarchive={(id) => void updateNote(id, { archived: false })}
                  />
                </div>
              ))}
            </div>
          )}

          {selection.kind === 'bin' && (
            <div className={viewMode === 'grid' ? memoNoteGridClass : 'flex flex-col gap-2'}>
              {filtered.map((n) => (
                <div key={n.id} className={viewMode === 'grid' ? 'mb-2 break-inside-avoid' : ''}>
                  <MemoNoteCard
                    note={n}
                    labels={labels}
                    viewMode={viewMode}
                    variant="bin"
                    onChange={() => {}}
                    onTogglePin={() => {}}
                    onArchive={() => {}}
                    onTrash={() => {}}
                    onRestore={(id) => void restoreNote(id)}
                    onDeleteForever={(id) => void deleteForever(id)}
                  />
                </div>
              ))}
            </div>
          )}

          {!emptyReminders &&
            filtered.length === 0 &&
            selection.kind !== 'notes' &&
            selection.kind !== 'label' && (
              <p className="px-2 py-8 text-center text-xs leading-relaxed text-[#5f6368] sm:py-10 sm:text-sm">
                Nothing here yet.
              </p>
            )}

          {(selection.kind === 'notes' || selection.kind === 'label') &&
            pinned.length === 0 &&
            others.length === 0 && (
              <p className="px-2 py-8 text-center text-xs leading-relaxed text-[#5f6368] sm:py-10 sm:text-sm">
                {selection.kind === 'label'
                  ? `No memos with the "${labelNameFor(selection, labels)}" label.`
                  : searchQuery.trim()
                    ? 'No notes match your search.'
                    : 'No memos yet. Use Take a note… above.'}
              </p>
            )}
        </div>
      </main>
    </div>
  );
}
