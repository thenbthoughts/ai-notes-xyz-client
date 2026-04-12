import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  fetchMemoLabelList,
  fetchMemoList,
  memoAdd,
  memoClearAllImages,
  memoDelete,
  memoEdit,
  memoEmptyBin,
  memoFileAdd,
  memoFileDelete,
  memoLabelAdd,
  memoLabelDelete,
  memoLabelEdit,
} from './memoApi';
import type { MemoLabel, MemoNote } from './memoTypes';

function namesForLabelIds(ids: string[], labels: MemoLabel[]): string[] {
  return ids.map((id) => labels.find((l) => l.id === id)?.name ?? '');
}

export function useMemoNotes() {
  const [notes, setNotes] = useState<MemoNote[]>([]);
  const notesRef = useRef<MemoNote[]>(notes);
  const [labels, setLabels] = useState<MemoLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [list, lbls] = await Promise.all([fetchMemoList(), fetchMemoLabelList()]);
      setNotes(list);
      setLabels(lbls);
    } catch (e) {
      console.error(e);
      setError('Could not load memos');
      toast.error('Could not load memos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addLabel = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const doc = await memoLabelAdd(trimmed);
      setLabels((prev) => [...prev, doc].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Label created');
      return doc;
    } catch (e: unknown) {
      console.error(e);
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Could not create label');
      return null;
    }
  }, []);

  const renameLabel = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        const doc = await memoLabelEdit(id, trimmed);
        setLabels((prev) => prev.map((l) => (l.id === id ? doc : l)).sort((a, b) => a.name.localeCompare(b.name)));
        setNotes((prev) =>
          prev.map((n) => {
            if (!n.labelIds.includes(id)) return n;
            const labelNames = n.labelIds.map((lid) => (lid === id ? doc.name : labels.find((x) => x.id === lid)?.name ?? ''));
            return { ...n, labelNames, updatedAt: Date.now() };
          }),
        );
        toast.success('Label renamed');
      } catch (e: unknown) {
        console.error(e);
        const msg =
          typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(msg || 'Could not rename label');
      }
    },
    [labels],
  );

  const deleteLabel = useCallback(async (id: string) => {
    try {
      await memoLabelDelete(id);
      setLabels((prev) => prev.filter((l) => l.id !== id));
      setNotes((prev) =>
        prev.map((n) => {
          const pairs = n.labelIds.map((lid, i) => ({ lid, name: n.labelNames[i] ?? '' }));
          const kept = pairs.filter((p) => p.lid !== id);
          if (kept.length === pairs.length) return n;
          return {
            ...n,
            labelIds: kept.map((p) => p.lid),
            labelNames: kept.map((p) => p.name),
            updatedAt: Date.now(),
          };
        }),
      );
      toast.success('Label deleted');
    } catch (e) {
      console.error(e);
      toast.error('Could not delete label');
    }
  }, []);

  const addNote = useCallback(
    async (input: {
      title: string;
      body: string;
      labelIds?: string[];
      noteColor?: string;
      /** Storage paths from `uploadMemoNoteImage` — registered via `memoFileAdd` after the memo exists. */
      uploadStoragePaths?: string[];
    }) => {
      const toastId = 'memo-add';
      toast.loading('Saving…', { id: toastId });
      try {
        const doc = await memoAdd({
          title: input.title,
          body: input.body,
          labelIds: input.labelIds ?? [],
          noteColor: input.noteColor,
        });
        const paths = input.uploadStoragePaths ?? [];
        for (const filePath of paths) {
          await memoFileAdd(doc.id, filePath);
        }
        const withImages: MemoNote =
          paths.length > 0
            ? {
                ...doc,
                imageDataUrls: [...doc.imageDataUrls, ...paths.filter((p) => !doc.imageDataUrls.includes(p))],
                updatedAt: Date.now(),
              }
            : doc;
        setNotes((prev) => [withImages, ...prev]);
        toast.success('Memo saved', { id: toastId });
      } catch (e) {
        console.error(e);
        toast.error('Could not save memo', { id: toastId });
        throw e;
      }
    },
    [],
  );

  const updateNote = useCallback(
    async (
      id: string,
      patch: Partial<Pick<MemoNote, 'title' | 'body' | 'labelIds' | 'pinned' | 'archived' | 'trashed' | 'noteColor'>>,
    ) => {
      try {
        await memoEdit(id, patch);
        setNotes((prev) =>
          prev.map((n) => {
            if (n.id !== id) return n;
            const next: MemoNote = { ...n, ...patch, updatedAt: Date.now() };
            if ('labelIds' in patch && patch.labelIds !== undefined) {
              next.labelNames = namesForLabelIds(patch.labelIds, labels);
            }
            return next;
          }),
        );
      } catch (e: unknown) {
        console.error(e);
        const msg =
          typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(msg || 'Could not update memo');
        void refresh();
      }
    },
    [refresh, labels],
  );

  const appendNoteImages = useCallback(
    async (id: string, newPaths: string[]) => {
      if (newPaths.length === 0) return;
      const n = notesRef.current.find((x) => x.id === id);
      const existing = n?.imageDataUrls ?? [];
      const seen = new Set(existing);
      const toAdd: string[] = [];
      for (const p of newPaths) {
        if (seen.has(p)) continue;
        seen.add(p);
        toAdd.push(p);
      }
      if (toAdd.length === 0) return;
      try {
        for (const filePath of toAdd) {
          await memoFileAdd(id, filePath);
        }
        setNotes((prev) =>
          prev.map((x) => {
            if (x.id !== id) return x;
            const merged = [...x.imageDataUrls];
            for (const p of toAdd) {
              if (!merged.includes(p)) merged.push(p);
            }
            return { ...x, imageDataUrls: merged, updatedAt: Date.now() };
          }),
        );
      } catch (e: unknown) {
        console.error(e);
        const msg =
          typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(msg || 'Could not attach images');
        void refresh();
      }
    },
    [refresh],
  );

  const removeMemoImage = useCallback(
    async (memoNoteId: string, imageUrlOrPath: string) => {
      const trimmed = imageUrlOrPath.trim();
      const dropFromNote = (n: MemoNote): MemoNote => ({
        ...n,
        imageDataUrls: n.imageDataUrls.filter((u) => u !== imageUrlOrPath && u.trim() !== trimmed),
        updatedAt: Date.now(),
      });

      if (!trimmed.startsWith('ai-notes-xyz/')) {
        setNotes((cur) => cur.map((n) => (n.id === memoNoteId ? dropFromNote(n) : n)));
        return;
      }

      try {
        await memoFileDelete(memoNoteId, trimmed);
        setNotes((cur) => cur.map((n) => (n.id === memoNoteId ? dropFromNote(n) : n)));
      } catch (e: unknown) {
        console.error(e);
        const msg =
          typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(msg || 'Could not remove image');
        void refresh();
      }
    },
    [refresh],
  );

  const clearMemoImages = useCallback(
    async (memoNoteId: string) => {
      try {
        await memoClearAllImages(memoNoteId);
        setNotes((prev) =>
          prev.map((n) => (n.id === memoNoteId ? { ...n, imageDataUrls: [], updatedAt: Date.now() } : n)),
        );
      } catch (e: unknown) {
        console.error(e);
        const msg =
          typeof e === 'object' && e !== null && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(msg || 'Could not clear images');
        void refresh();
      }
    },
    [refresh],
  );

  const togglePin = useCallback(
    async (id: string) => {
      let nextPinned = false;
      setNotes((prev) => {
        const n = prev.find((x) => x.id === id);
        if (!n) return prev;
        nextPinned = !n.pinned;
        return prev.map((x) => (x.id === id ? { ...x, pinned: nextPinned, updatedAt: Date.now() } : x));
      });
      try {
        await memoEdit(id, { pinned: nextPinned });
      } catch (e) {
        console.error(e);
        toast.error('Could not update pin');
        void refresh();
      }
    },
    [refresh],
  );

  const archiveNote = useCallback(
    async (id: string) => {
      await updateNote(id, { archived: true, pinned: false });
    },
    [updateNote],
  );

  const trashNote = useCallback(
    async (id: string) => {
      await updateNote(id, { trashed: true, archived: false, pinned: false });
    },
    [updateNote],
  );

  const restoreNote = useCallback(
    async (id: string) => {
      await updateNote(id, { trashed: false, archived: false });
    },
    [updateNote],
  );

  const deleteForever = useCallback(
    async (id: string) => {
      try {
        await memoDelete(id);
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } catch (e) {
        console.error(e);
        toast.error('Could not delete memo');
      }
    },
    [],
  );

  const emptyBin = useCallback(async () => {
    try {
      await memoEmptyBin();
      setNotes((prev) => prev.filter((n) => !n.trashed));
      toast.success('Bin emptied');
    } catch (e) {
      console.error(e);
      toast.error('Could not empty bin');
    }
  }, []);

  return {
    notes,
    labels,
    loading,
    error,
    refresh,
    addLabel,
    renameLabel,
    deleteLabel,
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
  };
}
