import { useState, useEffect } from 'react';
import {
    LucideSparkles,
    LucideChevronRight,
    LucideChevronLeft,
    LucidePlus,
    LucideTrash2,
    LucideLoader,
    LucideRefreshCw,
    LucideCopy,
    LucideEdit,
    LucideSave,
    LucideDownload,
    LucideX,
} from 'lucide-react';
import toast from 'react-hot-toast';

import axiosCustom from '../../../config/axiosCustom';
import { panel, panelTitle, panelIconBtn, mutedText } from './homepagePanelStyles';

interface HomepageSummary {
    _id: string;
    generatedAtUtc: string;
    summary: string;
}

const ComponentHomepageSummary = ({ refreshKey }: { refreshKey?: number }) => {
    const [summaryArr, setSummaryArr] = useState([] as HomepageSummary[]);
    const [currentSummaryIndex, setCurrentSummaryIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fetchSummaries = async () => {
        setIsLoading(true);
        try {
            const response = await axiosCustom.get(`/api/dashboard/crud/homepage-summary/list`);
            const arr = response.data.docs;
            setSummaryArr(arr as HomepageSummary[]);
            setLastUpdated(new Date());
            setCurrentSummaryIndex((prev) => {
                if ((arr as HomepageSummary[]).length === 0) {
                    return 0;
                }
                if (prev >= (arr as HomepageSummary[]).length) {
                    return 0;
                }
                return prev;
            });
        } catch (error) {
            console.error('Error fetching homepage summaries:', error);
            toast.error('Failed to load homepage summaries');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchSummaries();
    }, [refreshKey]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await axiosCustom.post('/api/dashboard/crud/homepage-summary/generate');
            await fetchSummaries();
            setCurrentSummaryIndex(0);
            toast.success('Homepage summary generated');
        } catch (error) {
            console.error('Error generating homepage summary:', error);
            toast.error('Failed to generate summary');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            await axiosCustom.delete('/api/dashboard/crud/homepage-summary/clear-all');
            setSummaryArr([]);
            setCurrentSummaryIndex(0);
            toast.success('All summaries cleared');
        } catch (error) {
            console.error('Error clearing homepage summaries:', error);
            toast.error('Failed to clear summaries');
        } finally {
            setIsClearing(false);
        }
    };

    const handleDeleteSingle = async () => {
        if (confirmDeleteIndex === null) {
            return;
        }
        const target = summaryArr[confirmDeleteIndex];
        if (!target) {
            setConfirmDeleteIndex(null);
            return;
        }
        const next = summaryArr.filter((_, idx) => {
            return idx !== confirmDeleteIndex;
        });
        setSummaryArr(next);
        setConfirmDeleteIndex(null);
        setCurrentSummaryIndex((prev) => {
            if (next.length === 0) {
                return 0;
            }
            if (prev >= next.length) {
                return next.length - 1;
            }
            return prev;
        });
        toast.success(`Deleted summary`);
        if (next.length === 0) {
            try {
                await axiosCustom.delete('/api/dashboard/crud/homepage-summary/clear-all');
            } catch {
                return;
            }
        }
    };

    const handleCardClick = async () => {
        const current = summaryArr[currentSummaryIndex];
        if (!current) {
            return;
        }
        try {
            await navigator.clipboard.writeText(current.summary);
            toast.success('Summary copied to clipboard');
        } catch {
            toast.error('Failed to copy summary');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
            setCurrentSummaryIndex((prev) => {
                if (prev <= 0) {
                    return prev;
                }
                return prev - 1;
            });
        }
        if (event.key === 'ArrowRight') {
            setCurrentSummaryIndex((prev) => {
                if (prev >= summaryArr.length - 1) {
                    return prev;
                }
                return prev + 1;
            });
        }
    };

    const handlePrev = () => {
        setCurrentSummaryIndex((prev) => {
            if (prev <= 0) {
                return prev;
            }
            return prev - 1;
        });
    };

    const handleNext = () => {
        setCurrentSummaryIndex((prev) => {
            if (prev >= summaryArr.length - 1) {
                return prev;
            }
            return prev + 1;
        });
    };

    const handleStartEdit = () => {
        const cur = summaryArr[currentSummaryIndex];
        if (!cur) {
            return;
        }
        setEditText(cur.summary);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        const cur = summaryArr[currentSummaryIndex];
        if (!cur) {
            return;
        }
        const trimmed = editText.trim();
        if (trimmed.length === 0) {
            toast.error('Summary cannot be empty');
            return;
        }
        setIsSavingEdit(true);
        try {
            const res = await axiosCustom.patch('/api/dashboard/crud/homepage-summary/update', { id: cur._id, summary: trimmed });
            const updated = res.data.doc as HomepageSummary;
            setSummaryArr((prev) => {
                return prev.map((item, idx) => {
                    if (idx === currentSummaryIndex) {
                        return { ...item, summary: updated.summary };
                    }
                    return item;
                });
            });
            setIsEditing(false);
            toast.success('Summary updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update summary');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleExportMarkdown = async () => {
        const cur = summaryArr[currentSummaryIndex];
        if (!cur) {
            return;
        }
        const md = `# Homepage Summary\n\nGenerated: ${new Date(cur.generatedAtUtc).toLocaleString()}\n\n${cur.summary}\n`;
        try {
            const blob = new Blob([md], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `homepage-summary-${cur._id.slice(0, 6)}.md`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success('Markdown exported');
        } catch {
            toast.error('Failed to export markdown');
        }
        try {
            await navigator.clipboard.writeText(md);
            toast.success('Markdown copied to clipboard');
        } catch {
            toast.error('Failed to copy markdown');
        }
    };

    const toolbar = (
        <div className="mb-2 flex flex-wrap items-center gap-1">
            <button
                type="button"
                className={panelIconBtn}
                aria-label="Generate homepage summary"
                title="Generate"
                onClick={() => {
                    void handleGenerate();
                }}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <LucideLoader className="h-3.5 w-3.5 animate-spin text-sky-400" strokeWidth={2} />
                ) : (
                    <LucidePlus className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
                )}
            </button>
            <button
                type="button"
                className={panelIconBtn}
                aria-label="Refresh summaries"
                title="Refresh"
                onClick={() => {
                    void fetchSummaries();
                }}
            >
                <LucideRefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
                type="button"
                className={panelIconBtn}
                aria-label="Previous summary"
                title="Previous"
                disabled={currentSummaryIndex <= 0}
                onClick={handlePrev}
            >
                <LucideChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <span className="rounded-lg border-2 border-sky-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-sky-100" title={`${summaryArr.length > 0 ? currentSummaryIndex + 1 : 0} of ${summaryArr.length} summaries`}>
                {summaryArr.length > 0 ? `${currentSummaryIndex + 1} / ${summaryArr.length}` : '0 / 0'}
            </span>
            <button
                type="button"
                className={panelIconBtn}
                aria-label="Next summary"
                title="Next"
                disabled={currentSummaryIndex >= summaryArr.length - 1}
                onClick={handleNext}
            >
                <LucideChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
                type="button"
                className={`${panelIconBtn} border-rose-700 hover:bg-rose-950`}
                aria-label="Clear all summaries"
                title="Clear all"
                onClick={() => {
                    void handleClearAll();
                }}
                disabled={isClearing}
            >
                {isClearing ? (
                    <LucideLoader className="h-3.5 w-3.5 animate-spin text-rose-400" strokeWidth={2} />
                ) : (
                    <LucideTrash2 className="h-3.5 w-3.5 text-rose-400" strokeWidth={2} />
                )}
            </button>
            {summaryArr.length > 0 && (
                <button
                    type="button"
                    className={`${panelIconBtn} border-amber-700 hover:bg-amber-950`}
                    aria-label="Delete current summary"
                    title="Delete current"
                    onClick={() => {
                        setConfirmDeleteIndex(currentSummaryIndex);
                    }}
                >
                    <LucideTrash2 className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
                </button>
            )}
            {summaryArr.length > 0 && (
                <button
                    type="button"
                    className={panelIconBtn}
                    aria-label="Edit summary"
                    title="Edit"
                    onClick={handleStartEdit}
                >
                    <LucideEdit className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            )}
            {summaryArr.length > 0 && (
                <button
                    type="button"
                    className={panelIconBtn}
                    aria-label="Export summary as markdown"
                    title="Export md"
                    onClick={() => {
                        void handleExportMarkdown();
                    }}
                >
                    <LucideDownload className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className={`${panel} border-l-[3px] border-l-sky-500`} tabIndex={0} onKeyDown={handleKeyDown}>
                <h2 className={`${panelTitle} mb-0.5`}>
                    <LucideSparkles className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
                    Homepage summary
                </h2>
                {toolbar}
                <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-zinc-800/60" style={{ animationDelay: '0ms' }} />
                    <div className="h-20 animate-pulse rounded-xl bg-zinc-800/50" style={{ animationDelay: '150ms' }} />
                    <div className="h-3 w-32 animate-pulse rounded bg-zinc-800/60" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        );
    }

    return (
        <div className={`${panel} border-l-[3px] border-l-sky-500`} tabIndex={0} onKeyDown={handleKeyDown} aria-label="Homepage summary carousel">
            <h2 className={`${panelTitle} mb-0.5`}>
                <LucideSparkles className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
                Homepage summary
            </h2>
            {toolbar}
            {lastUpdated && (
                <p className="mb-1 text-[10px] font-medium text-zinc-500">Updated {lastUpdated.toLocaleTimeString()}</p>
            )}
            {summaryArr.length > 0 && summaryArr[currentSummaryIndex] && (
                <div>
                    <p className={mutedText}>{new Date(summaryArr[currentSummaryIndex].generatedAtUtc).toLocaleString()}</p>
                    {isEditing ? (
                        <div className="mt-1 space-y-2">
                            <textarea
                                value={editText}
                                onChange={(event) => {
                                    setEditText(event.target.value);
                                }}
                                rows={4}
                                className="w-full rounded-xl border-2 border-sky-700 bg-zinc-900 px-2 py-1.5 text-xs font-medium text-sky-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                aria-label="Edit summary text"
                            />
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleSaveEdit();
                                    }}
                                    disabled={isSavingEdit}
                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-700 bg-emerald-900 px-2 py-1 text-xs font-bold text-emerald-100 hover:bg-emerald-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    aria-label="Save summary"
                                >
                                    {isSavingEdit ? <LucideLoader className="h-3 w-3 animate-spin" strokeWidth={2} /> : <LucideSave className="h-3 w-3" strokeWidth={2} />}
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                                    aria-label="Cancel edit summary"
                                >
                                    <LucideX className="h-3 w-3" strokeWidth={2} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    void handleCardClick();
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        void handleCardClick();
                                    }
                                }}
                                className="mt-1 max-h-[120px] cursor-pointer overflow-y-auto whitespace-pre-wrap rounded-xl border border-transparent px-1 py-1 text-xs font-medium leading-relaxed text-sky-100/90 transition hover:border-sky-700 hover:bg-zinc-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                title="Click to copy summary"
                                aria-label="Homepage summary content, click to copy"
                            >
                                {summaryArr[currentSummaryIndex].summary}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleCardClick();
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-sky-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                    aria-label="Copy summary to clipboard"
                                >
                                    <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                    Copy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleExportMarkdown();
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-sky-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                    aria-label="Export summary markdown"
                                >
                                    <LucideDownload className="h-3 w-3" strokeWidth={2} />
                                    Export md
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {summaryArr.length === 0 && (
                <p className={`${mutedText} py-1 text-center`}>No summaries — tap + to generate.</p>
            )}
            {confirmDeleteIndex !== null && (
                <div className="mt-2 rounded-xl border-2 border-amber-700 bg-zinc-900 p-2">
                    <p className="text-xs font-semibold text-amber-200">Delete this summary?</p>
                    <p className={`${mutedText} mt-1`}>This removes the card from view. Clear-all still deletes from server.</p>
                    <div className="mt-2 flex gap-1">
                        <button
                            type="button"
                            className="rounded-lg border border-amber-700 bg-amber-900 px-2 py-1 text-xs font-bold text-amber-100 hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                            onClick={() => {
                                void handleDeleteSingle();
                            }}
                            aria-label="Confirm delete summary"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                            onClick={() => {
                                setConfirmDeleteIndex(null);
                            }}
                            aria-label="Cancel delete summary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentHomepageSummary;
