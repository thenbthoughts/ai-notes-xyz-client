import { LucideChevronDown, LucideChevronUp, LucideCopy, LucideDownload, LucideRefreshCw, LucideSparkles, LucideZap } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import axiosCustom from '../../../../../config/axiosCustom';
import MarkdownRenderer from '../../../../../components/markdown/MarkdownRenderer';
import { suggestionsRefreshAtom } from '../suggestionsRefreshAtom';

const autoLoadAtom = atomWithStorage('aiSummaryAutoLoad', false);

const collapsedStorageKey = 'suggestions-combined-collapsed';

const readCollapsed = () => {
    try {
        const raw = localStorage.getItem(collapsedStorageKey);
        if (raw === 'true') {
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

const writeCollapsed = (next: boolean) => {
    try {
        localStorage.setItem(collapsedStorageKey, String(next));
    } catch {
        return;
    }
};

const fetchRevailateAIDiary = async ({ summaryDate, summaryType }: { summaryDate: string; summaryType: 'daily' | 'weekly' | 'monthly' }) => {
    try {
        await axiosCustom.post('/api/suggestions/crud/ai-daily-diary-revalidate', {
            summaryDate: summaryDate,
            summaryType: summaryType,
        });
    } catch (error) {
        console.error('Error fetching daily AI diary:', error);
    }
};

const AiSuggestionSummaryCombined = () => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [autoLoad, setAutoLoad] = useAtom(autoLoadAtom);
    const [randomNum, setRandomNum] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [generationDurationMs, setGenerationDurationMs] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const refreshTick = useAtomValue(suggestionsRefreshAtom);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return readCollapsed();
    });

    const fetchSummary = async (signal?: AbortSignal) => {
        setIsLoading(true);
        setErrorMsg(null);
        const start = Date.now();
        try {
            await Promise.all([
                fetchRevailateAIDiary({ summaryDate: new Date().toISOString(), summaryType: 'daily' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toISOString(), summaryType: 'daily' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf()).toISOString(), summaryType: 'weekly' }),
            ]);
            if (signal && signal.aborted) {
                return;
            }
            const response = await axiosCustom.get('/api/suggestions/crud/get-ai-summary-combined', {
                signal,
            });
            const tempUserSummary = response.data.data.userSummary;
            if (typeof tempUserSummary === 'string') {
                setSummary(tempUserSummary);
            } else {
                setSummary('');
            }
            setLastUpdated(new Date());
            setGenerationDurationMs(Date.now() - start);
            setIsLoading(false);
        } catch (error: unknown) {
            console.error('Error fetching AI summary:', error);
            const err = error as { name?: string; code?: string };
            if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }
            setErrorMsg('Failed to load summary. Please try again.');
            setGenerationDurationMs(Date.now() - start);
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setRandomNum(Math.random());
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(summary);
            toast.success('Summary copied');
        } catch {
            toast.error('Copy failed');
        }
    };

    const handleExportMd = () => {
        try {
            const blob = new Blob([summary], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'ai-summary.md';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            toast.success('Exported markdown');
        } catch {
            toast.error('Export failed');
        }
    };

    useEffect(() => {
        writeCollapsed(isCollapsed);
    }, [isCollapsed]);

    useEffect(() => {
        if (refreshTick > 0) {
            setRandomNum(Math.random());
        }
    }, [refreshTick]);

    useEffect(() => {
        if (randomNum === 0) {
            setIsLoading(false);
            return;
        }
        const controller = new AbortController();
        void fetchSummary(controller.signal);
        return () => {
            controller.abort();
        };
    }, [randomNum]);

    useEffect(() => {
        if (autoLoad) {
            setRandomNum(Math.random());
        }
    }, [autoLoad]);

    const toggleBtn = (on: boolean) => {
        if (on) {
            return 'rounded-sm border px-2 py-1 text-xs font-medium transition-colors border-emerald-700 bg-emerald-950 text-emerald-200 hover:bg-emerald-900';
        }
        return 'rounded-sm border px-2 py-1 text-xs font-medium transition-colors border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800';
    };

    return (
        <div className="mb-2 rounded-sm border border-zinc-700 bg-zinc-900 p-2.5 shadow-sm md:p-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5">
                    <LucideSparkles className="h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2} />
                    <h2 className="text-sm font-semibold text-zinc-100">AI summary</h2>
                    <button
                        type="button"
                        onClick={() => {
                            setIsCollapsed((prev) => {
                                return !prev;
                            });
                        }}
                        className="ml-1 rounded-sm border border-zinc-700 bg-zinc-800 p-1 text-zinc-300 hover:bg-zinc-700"
                        aria-label={isCollapsed ? 'Expand AI summary' : 'Collapse AI summary'}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} /> : <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />}
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    {lastUpdated && (
                        <span className="rounded-sm border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">Updated {lastUpdated.toLocaleTimeString()}</span>
                    )}
                    {generationDurationMs !== null && (
                        <span className="rounded-sm border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-300">Took {(generationDurationMs / 1000).toFixed(1)}s</span>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setAutoLoad(!autoLoad);
                        }}
                        className={toggleBtn(autoLoad)}
                        title={autoLoad ? 'Auto-load on' : 'Auto-load off'}
                        aria-label={autoLoad ? 'Disable auto-load' : 'Enable auto-load'}
                    >
                        <span className="inline-flex items-center gap-1">
                            <LucideZap className={`h-3.5 w-3.5 ${autoLoad ? 'text-emerald-600' : 'text-zinc-400'}`} strokeWidth={2} />
                            {autoLoad ? 'Auto-load on' : 'Auto-load off'}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            handleRefresh();
                        }}
                        disabled={isLoading}
                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1.5 text-indigo-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Refresh summary"
                        aria-label="Refresh AI summary"
                    >
                        <LucideRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                    </button>
                    {summary.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                void handleCopy();
                            }}
                            className="rounded-sm border border-zinc-700 bg-zinc-900 p-1.5 text-zinc-300 hover:bg-zinc-800"
                            title="Copy summary"
                            aria-label="Copy AI summary"
                        >
                            <LucideCopy className="h-4 w-4" strokeWidth={2} />
                        </button>
                    )}
                    {summary.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                handleExportMd();
                            }}
                            className="rounded-sm border border-zinc-700 bg-zinc-900 p-1.5 text-zinc-300 hover:bg-zinc-800"
                            title="Export summary as markdown"
                            aria-label="Export AI summary as markdown"
                        >
                            <LucideDownload className="h-4 w-4" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
            {isCollapsed ? (
                <div className="rounded-sm border border-zinc-800 bg-zinc-950/50 px-2 py-2 text-center text-xs text-zinc-500">Collapsed</div>
            ) : (
                <div>
                    {!autoLoad && summary.length === 0 && isLoading === false && !errorMsg && (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <span className="text-xs text-zinc-400">Auto-load is off. Use refresh to load the summary.</span>
                            <Link
                                to="/user/chat"
                                className="rounded-sm border border-indigo-700 bg-indigo-950 px-2 py-1 text-xs font-medium text-indigo-200 hover:bg-indigo-900"
                                aria-label="Go to chat"
                            >
                                Go to chat
                            </Link>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="my-2 rounded-sm border border-zinc-700 bg-zinc-800 px-3 py-2 text-center">
                            <p className="text-xs font-medium text-zinc-200">{errorMsg}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    handleRefresh();
                                }}
                                className="mt-2 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                                aria-label="Retry loading AI summary"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="space-y-2 py-2">
                            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '120ms' } as React.CSSProperties} />
                            <div className="h-20 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '240ms' } as React.CSSProperties} />
                        </div>
                    ) : (
                        <div>
                            {summary.length === 0 && !errorMsg && autoLoad && (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950/50 px-3 py-6 text-center">
                                    <p className="text-xs text-zinc-400">No summary yet.</p>
                                    <Link
                                        to="/user/chat"
                                        className="rounded-sm border border-indigo-700 bg-zinc-900 px-2 py-1 text-xs font-medium text-indigo-200 hover:bg-zinc-800"
                                        aria-label="Start a chat to generate summary"
                                    >
                                        Start a chat
                                    </Link>
                                </div>
                            )}
                            {summary.length > 0 && (
                                <div className="max-h-[80vh] overflow-y-auto rounded-sm border border-zinc-800 bg-zinc-950/50 p-2">
                                    <div className="prose prose-sm max-w-none text-zinc-200">
                                        <MarkdownRenderer content={summary} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiSuggestionSummaryCombined;
