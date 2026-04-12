import axiosCustom from '../../../../config/axiosCustom';
import type { MemoLabel, MemoNote } from './memoTypes';

const MEMO_BASE = '/api/memo/crud';
const MEMO_FILE_BASE = '/api/memo-file/crud';
const MEMO_LABEL_BASE = '/api/memo-label/crud';

type ApiMemoDoc = {
  _id: string;
  title?: string;
  body?: string;
  labelIds?: (string | { $oid: string })[];
  labelNames?: string[];
  pinned?: boolean;
  archived?: boolean;
  trashed?: boolean;
  noteColor?: string;
  imageDataUrls?: string[];
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

type ApiLabelDoc = {
  _id: string;
  name?: string;
};

export function idToString(id: unknown): string {
  if (id == null) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id !== null && '$oid' in (id as Record<string, unknown>)) {
    return String((id as { $oid: string }).$oid);
  }
  return String(id);
}

function imageUrlsFromApi(d: ApiMemoDoc): string[] {
  if (Array.isArray(d.imageDataUrls) && d.imageDataUrls.length > 0) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const x of d.imageDataUrls) {
      if (typeof x !== 'string' || !x.trim()) continue;
      const v = x.trim();
      if (seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    if (out.length > 0) return out;
  }
  return [];
}

function mapDoc(d: ApiMemoDoc): MemoNote {
  const rawIds = Array.isArray(d.labelIds) ? d.labelIds : [];
  const labelIds = rawIds.map((x) => idToString(x)).filter(Boolean);
  const names = Array.isArray(d.labelNames) ? d.labelNames.map((n) => String(n ?? '')) : [];
  let labelNames: string[];
  if (labelIds.length > 0) {
    labelNames = labelIds.map((_, i) => names[i] ?? '');
  } else if (names.length > 0) {
    labelNames = names;
  } else {
    labelNames = [];
  }

  return {
    id: idToString(d._id),
    title: d.title ?? '',
    body: d.body ?? '',
    noteColor: typeof d.noteColor === 'string' ? d.noteColor : '',
    imageDataUrls: imageUrlsFromApi(d),
    labelIds,
    labelNames,
    pinned: Boolean(d.pinned),
    archived: Boolean(d.archived),
    trashed: Boolean(d.trashed),
    createdAt: d.createdAtUtc ? new Date(d.createdAtUtc).getTime() : 0,
    updatedAt: d.updatedAtUtc ? new Date(d.updatedAtUtc).getTime() : 0,
  };
}

function mapLabelDoc(d: ApiLabelDoc): MemoLabel {
  return {
    id: idToString(d._id),
    name: d.name ?? '',
  };
}

export async function fetchMemoList(): Promise<MemoNote[]> {
  const { data } = await axiosCustom.post<{ docs: ApiMemoDoc[] }>(`${MEMO_BASE}/memoList`, {});
  const docs = Array.isArray(data.docs) ? data.docs : [];
  return docs.map(mapDoc);
}

export async function fetchMemoLabelList(): Promise<MemoLabel[]> {
  const { data } = await axiosCustom.post<{ docs: ApiLabelDoc[] }>(`${MEMO_LABEL_BASE}/memoLabelList`, {});
  const docs = Array.isArray(data.docs) ? data.docs : [];
  return docs.map(mapLabelDoc);
}

export async function memoLabelAdd(name: string): Promise<MemoLabel> {
  const { data } = await axiosCustom.post<{ doc: ApiLabelDoc }>(`${MEMO_LABEL_BASE}/memoLabelAdd`, { name });
  return mapLabelDoc(data.doc);
}

export async function memoLabelEdit(id: string, name: string): Promise<MemoLabel> {
  const { data } = await axiosCustom.post<{ doc: ApiLabelDoc }>(`${MEMO_LABEL_BASE}/memoLabelEdit`, {
    _id: id,
    name,
  });
  return mapLabelDoc(data.doc);
}

export async function memoLabelDelete(id: string): Promise<void> {
  await axiosCustom.post(`${MEMO_LABEL_BASE}/memoLabelDelete`, { _id: id });
}

export async function memoAdd(input: {
  title: string;
  body: string;
  labelIds?: string[];
  pinned?: boolean;
  noteColor?: string;
}): Promise<MemoNote> {
  const { data } = await axiosCustom.post<{ doc: ApiMemoDoc }>(`${MEMO_BASE}/memoAdd`, input);
  return mapDoc(data.doc);
}

export async function memoEdit(
  id: string,
  patch: Partial<{
    title: string;
    body: string;
    labelIds: string[];
    pinned: boolean;
    archived: boolean;
    trashed: boolean;
    noteColor: string;
  }>,
): Promise<void> {
  await axiosCustom.post(`${MEMO_BASE}/memoEdit`, { _id: id, ...patch });
}

/** Register an uploaded storage path (from `POST /api/uploads/crud/uploadFile`) for a memo. */
export async function memoFileAdd(memoNoteId: string, filePath: string): Promise<void> {
  await axiosCustom.post(`${MEMO_FILE_BASE}/memoFileAdd`, { memoNoteId, filePath });
}

export async function memoFileDelete(memoNoteId: string, filePath: string): Promise<void> {
  await axiosCustom.post(`${MEMO_FILE_BASE}/memoFileDelete`, { memoNoteId, filePath });
}

/** Clears memoFiles + storage + legacy `imageDataUrls` on the memo document. */
export async function memoClearAllImages(memoNoteId: string): Promise<void> {
  await axiosCustom.post(`${MEMO_FILE_BASE}/memoClearAllImages`, { memoNoteId });
}

export async function memoDelete(id: string): Promise<void> {
  await axiosCustom.post(`${MEMO_BASE}/memoDelete`, { _id: id });
}

export async function memoEmptyBin(): Promise<void> {
  await axiosCustom.post(`${MEMO_BASE}/memoEmptyBin`, {});
}
