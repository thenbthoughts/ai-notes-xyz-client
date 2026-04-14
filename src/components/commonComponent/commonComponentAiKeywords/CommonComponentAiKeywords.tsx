import { useState, useEffect, useMemo } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../config/axiosCustom.ts';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';

interface IKeyword {
    _id: string;
    username: string;
    keyword: string;
    aiCategory: string;
    aiSubCategory: string;
    aiTopic: string;
    aiSubTopic: string;
    metadataSourceType: string;
    metadataSourceId: string;
    hasEmbedding: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CommonComponentAiKeyword = ({
    sourceId,
    metadataSourceType = 'notes',
}: {
    sourceId: string;
    metadataSourceType?: string;
}) => {
    const [keywords, setKeywords] = useState<IKeyword[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [adding, setAdding] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchKeywords();
    }, [sourceId]);

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/ai-context/keyword/list`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    sourceId,
                    page: 1,
                    limit: 100,
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            if (response.data.docs) {
                setKeywords(response.data.docs);
            } else {
                toast.error('Error fetching Keywords');
            }
        } catch (error) {
            console.error('Error fetching Keywords:', error);
            toast.error('Error fetching Keywords!');
        } finally {
            setLoading(false);
        }
    };

    const metaSource = useMemo(() => {
        const withMeta = keywords.find(
            (k) =>
                k.aiCategory ||
                k.aiSubCategory ||
                k.aiTopic ||
                k.aiSubTopic
        );
        return withMeta ?? keywords[0];
    }, [keywords]);

    /** Unique keywords by trimmed text (API may return duplicates); no display cap. */
    const displayKeywords = useMemo(() => {
        const seen = new Set<string>();
        const ordered: IKeyword[] = [];
        for (const k of keywords) {
            const t = (k.keyword || '').trim();
            if (!t || seen.has(t)) continue;
            seen.add(t);
            ordered.push(k);
        }
        return ordered;
    }, [keywords]);

    const submitAdd = async () => {
        const trimmed = newKeyword.trim();
        if (!trimmed) {
            toast.error('Enter a keyword');
            return;
        }
        setSaving(true);
        try {
            await axiosCustom.post('/api/ai-context/keyword/add', {
                sourceId,
                sourceType: metadataSourceType,
                keyword: trimmed,
            });
            toast.success('Keyword added');
            setNewKeyword('');
            setAdding(false);
            await fetchKeywords();
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data
                          ?.message
                    : undefined;
            toast.error(msg || 'Could not add keyword');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-none border border-zinc-200 bg-white p-2">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                    Keywords
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => {
                            setAdding((v) => !v);
                        }}
                        className="inline-flex h-6 items-center gap-0.5 rounded-none border border-indigo-600 bg-indigo-600 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-indigo-500"
                        title="Add keyword"
                    >
                        <Plus className="h-3 w-3" strokeWidth={2} />
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={fetchKeywords}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-none border border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        title="Refresh"
                    >
                        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {adding && (
                <div className="mb-2 flex gap-1">
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitAdd();
                            }
                        }}
                        placeholder="New keyword…"
                        className="min-w-0 flex-1 rounded-none border border-zinc-300 bg-zinc-50/80 px-2 py-1 text-xs text-zinc-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                        maxLength={256}
                    />
                    <button
                        type="button"
                        disabled={saving}
                        onClick={submitAdd}
                        className="rounded-none border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                    >
                        {saving ? '…' : 'Save'}
                    </button>
                </div>
            )}

            {loading && (
                <p className="py-2 text-center font-mono text-[10px] text-zinc-500">Loading…</p>
            )}

            {!loading && displayKeywords.length > 0 && (
                <ul className="flex flex-wrap gap-1" role="list">
                    {displayKeywords.map((item) => (
                        <li
                            key={item._id}
                            className="max-w-full border border-indigo-200 bg-indigo-50/50 px-1.5 py-0.5 text-[10px] font-medium leading-snug text-zinc-800"
                        >
                            <span className="break-words" title={item.keyword}>
                                {item.keyword}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && metaSource && (
                (metaSource.aiCategory ||
                    metaSource.aiSubCategory ||
                    metaSource.aiTopic ||
                    metaSource.aiSubTopic) && (
                    <div className="mt-2 border border-zinc-200 bg-zinc-50/80 p-1.5">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-zinc-700">
                            {metaSource.aiCategory ? (
                                <div>
                                    <span className="font-semibold text-zinc-600">Category</span>{' '}
                                    <span>{metaSource.aiCategory}</span>
                                </div>
                            ) : null}
                            {metaSource.aiSubCategory ? (
                                <div>
                                    <span className="font-semibold text-zinc-600">Sub</span>{' '}
                                    <span>{metaSource.aiSubCategory}</span>
                                </div>
                            ) : null}
                            {metaSource.aiTopic ? (
                                <div>
                                    <span className="font-semibold text-zinc-600">Topic</span>{' '}
                                    <span>{metaSource.aiTopic}</span>
                                </div>
                            ) : null}
                            {metaSource.aiSubTopic ? (
                                <div>
                                    <span className="font-semibold text-zinc-600">Sub-topic</span>{' '}
                                    <span>{metaSource.aiSubTopic}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )
            )}

            {!loading && displayKeywords.length === 0 && !adding && (
                <p className="py-1 text-center text-[11px] text-zinc-500">No keywords yet. Use Add.</p>
            )}
        </div>
    );
};

export default CommonComponentAiKeyword;
