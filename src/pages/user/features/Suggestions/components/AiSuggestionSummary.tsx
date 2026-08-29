import { LucideChevronDown, LucideChevronUp, LucideCopy, LucideLightbulb, LucideLoader2, LucideRefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import axiosCustom from '../../../../../config/axiosCustom';
import { suggestionsRefreshAtom } from '../suggestionsRefreshAtom';

const collapsedStorageKey = 'suggestions-diaries-collapsed';
const showDailyKey = 'suggestions-diaries-showDaily';
const showYesterdayKey = 'suggestions-diaries-showYesterday';
const showWeeklyKey = 'suggestions-diaries-showWeekly';
const showMonthlyKey = 'suggestions-diaries-showMonthly';
const showLastWeekKey = 'suggestions-diaries-showLastWeek';
const showLastMonthKey = 'suggestions-diaries-showLastMonth';

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

const readBoolStorage = (key: string, fallback: boolean) => {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            return fallback;
        }
        if (raw === 'true') {
            return true;
        }
        if (raw === 'false') {
            return false;
        }
        return fallback;
    } catch {
        return fallback;
    }
};

const writeBoolStorage = (key: string, value: boolean) => {
    try {
        localStorage.setItem(key, String(value));
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

const AiSuggestionsDiary = () => {
    const [stateRevailateAIAll, setStateRevailateAIAll] = useState({
        loading: false,
    });
    const [dailyAiDiary, setDailyAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [yesterdayAiDiary, setYesterdayAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [currentWeekAiDiary, setCurrentWeekAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [lastWeekAiDiary, setLastWeekAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [currentMonthAiDiary, setCurrentMonthAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [lastMonthAiDiary, setLastMonthAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [showDaily, setShowDaily] = useState(() => {
        return readBoolStorage(showDailyKey, true);
    });
    const [showYesterday, setShowYesterday] = useState(() => {
        return readBoolStorage(showYesterdayKey, true);
    });
    const [showWeekly, setShowWeekly] = useState(() => {
        return readBoolStorage(showWeeklyKey, true);
    });
    const [showMonthly, setShowMonthly] = useState(() => {
        return readBoolStorage(showMonthlyKey, true);
    });
    const [showLastWeek, setShowLastWeek] = useState(() => {
        return readBoolStorage(showLastWeekKey, true);
    });
    const [showLastMonth, setShowLastMonth] = useState(() => {
        return readBoolStorage(showLastMonthKey, true);
    });
    const [initialLoading, setInitialLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [regenProgress, setRegenProgress] = useState(0);
    const [regenTotal] = useState(6);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return readCollapsed();
    });
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const refreshTick = useAtomValue(suggestionsRefreshAtom);
    const fetchControllerRef = useRef<AbortController | null>(null);

    const copyDiary = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Diary copied');
        } catch {
            toast.error('Copy failed');
        }
    };

    useEffect(() => {
        writeCollapsed(isCollapsed);
    }, [isCollapsed]);

    useEffect(() => {
        writeBoolStorage(showDailyKey, showDaily);
    }, [showDaily]);

    useEffect(() => {
        writeBoolStorage(showYesterdayKey, showYesterday);
    }, [showYesterday]);

    useEffect(() => {
        writeBoolStorage(showWeeklyKey, showWeekly);
    }, [showWeekly]);

    useEffect(() => {
        writeBoolStorage(showMonthlyKey, showMonthly);
    }, [showMonthly]);

    useEffect(() => {
        writeBoolStorage(showLastWeekKey, showLastWeek);
    }, [showLastWeek]);

    useEffect(() => {
        writeBoolStorage(showLastMonthKey, showLastMonth);
    }, [showLastMonth]);

    useEffect(() => {
        void fetchAllSummaries();
        return () => {
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (refreshTick > 0) {
            void fetchAllSummaries();
        }
    }, [refreshTick]);

    const fetchAllSummaries = async () => {
        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort();
        }
        const controller = new AbortController();
        fetchControllerRef.current = controller;
        setFetchError(null);
        setInitialLoading(true);
        try {
            const response = await axiosCustom.get('/api/suggestions/crud/ai-summary-get', { signal: controller.signal });
            if (controller.signal.aborted) {
                return;
            }
            if (response.data && response.data.data) {
                const data = response.data.data;
                if (data.summaryToday) {
                    setDailyAiDiary({
                        content: data.summaryToday.description || '',
                        lifeEventId: data.summaryToday._id || '',
                    });
                } else {
                    setDailyAiDiary({ content: '', lifeEventId: '' });
                }
                if (data.summaryYesterday) {
                    setYesterdayAiDiary({
                        content: data.summaryYesterday.description || '',
                        lifeEventId: data.summaryYesterday._id || '',
                    });
                } else {
                    setYesterdayAiDiary({ content: '', lifeEventId: '' });
                }
                if (data.summaryCurrentWeek) {
                    setCurrentWeekAiDiary({
                        content: data.summaryCurrentWeek.description || '',
                        lifeEventId: data.summaryCurrentWeek._id || '',
                    });
                } else {
                    setCurrentWeekAiDiary({ content: '', lifeEventId: '' });
                }
                if (data.summaryLastWeek) {
                    setLastWeekAiDiary({
                        content: data.summaryLastWeek.description || '',
                        lifeEventId: data.summaryLastWeek._id || '',
                    });
                } else {
                    setLastWeekAiDiary({ content: '', lifeEventId: '' });
                }
                if (data.summaryCurrentMonth) {
                    setCurrentMonthAiDiary({
                        content: data.summaryCurrentMonth.description || '',
                        lifeEventId: data.summaryCurrentMonth._id || '',
                    });
                } else {
                    setCurrentMonthAiDiary({ content: '', lifeEventId: '' });
                }
                if (data.summaryLastMonth) {
                    setLastMonthAiDiary({
                        content: data.summaryLastMonth.description || '',
                        lifeEventId: data.summaryLastMonth._id || '',
                    });
                } else {
                    setLastMonthAiDiary({ content: '', lifeEventId: '' });
                }
                setLastUpdated(new Date());
            }
        } catch (error: unknown) {
            const err = error as { name?: string; code?: string };
            if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Error fetching AI summaries:', error);
            setFetchError('Failed to load diaries');
        } finally {
            if (fetchControllerRef.current === controller) {
                setInitialLoading(false);
            }
        }
    };

    const fetchRevailateAIAll = async () => {
        setStateRevailateAIAll({
            loading: true,
        });
        setFetchError(null);
        setRegenProgress(0);
        try {
            const tasks = [
                fetchRevailateAIDiary({ summaryDate: new Date().toISOString(), summaryType: 'daily' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toISOString(), summaryType: 'daily' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf()).toISOString(), summaryType: 'weekly' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7).toISOString(), summaryType: 'weekly' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf()).toISOString(), summaryType: 'monthly' }),
                fetchRevailateAIDiary({ summaryDate: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 30).toISOString(), summaryType: 'monthly' }),
            ];
            let completed = 0;
            await Promise.all(
                tasks.map(async (p) => {
                    await p;
                    completed += 1;
                    setRegenProgress(completed);
                })
            );
            await fetchAllSummaries();
            toast.success('Diaries regenerated');
        } catch (error) {
            console.error('Error fetching daily AI diary:', error);
            setFetchError('Failed to regenerate diaries');
        } finally {
            setStateRevailateAIAll({
                loading: false,
            });
            setRegenProgress(0);
        }
    };

    const hasAnyDiary = () => {
        if (dailyAiDiary.content) {
            return true;
        }
        if (yesterdayAiDiary.content) {
            return true;
        }
        if (currentWeekAiDiary.content) {
            return true;
        }
        if (lastWeekAiDiary.content) {
            return true;
        }
        if (currentMonthAiDiary.content) {
            return true;
        }
        if (lastMonthAiDiary.content) {
            return true;
        }
        return false;
    };

    const isEmptyAfterLoad = () => {
        if (initialLoading) {
            return false;
        }
        if (stateRevailateAIAll.loading) {
            return false;
        }
        if (fetchError) {
            return false;
        }
        return !hasAnyDiary();
    };

    return (
        <div className="mb-2 rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm md:p-3">
            <div className="mb-2 flex items-center gap-2">
                <LucideLightbulb className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />
                <h2 className="text-sm font-semibold text-zinc-100">AI diaries</h2>
                {lastUpdated && <span className="rounded-sm border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">Updated {lastUpdated.toLocaleTimeString()}</span>}
                {stateRevailateAIAll.loading && <span className="rounded-sm border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">Regenerating {regenProgress}/{regenTotal}…</span>}
                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => {
                            setIsCollapsed((prev) => {
                                return !prev;
                            });
                        }}
                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 hover:bg-zinc-800"
                        aria-label={isCollapsed ? 'Expand diaries' : 'Collapse diaries'}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <LucideChevronDown className="h-4 w-4" strokeWidth={2} /> : <LucideChevronUp className="h-4 w-4" strokeWidth={2} />}
                    </button>
                    {stateRevailateAIAll.loading && <LucideLoader2 className="h-4 w-4 animate-spin text-zinc-500" strokeWidth={2} />}
                    {!stateRevailateAIAll.loading && (
                        <button
                            type="button"
                            title="Regenerate diaries"
                            aria-label="Regenerate diaries"
                            className="rounded-sm border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 hover:bg-zinc-800"
                            onClick={() => {
                                void fetchRevailateAIAll();
                            }}
                        >
                            <LucideRefreshCcw className="h-4 w-4" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
            {isCollapsed ? (
                <div className="rounded-sm border border-zinc-800 bg-zinc-950/50 px-2 py-2 text-center text-xs text-zinc-500">Collapsed</div>
            ) : (
                <div>
                    {fetchError && (
                        <div className="mb-2 rounded-sm border border-zinc-700 bg-zinc-800 px-3 py-2 text-center">
                            <p className="text-xs font-medium text-zinc-200">{fetchError}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    void fetchAllSummaries();
                                }}
                                className="mt-2 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                                aria-label="Retry loading diaries"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {initialLoading && (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2">
                                <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '80ms' } as React.CSSProperties} />
                                <div className="mt-2 h-16 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '160ms' } as React.CSSProperties} />
                            </div>
                            <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2">
                                <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '80ms' } as React.CSSProperties} />
                                <div className="mt-2 h-16 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '160ms' } as React.CSSProperties} />
                            </div>
                            <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2">
                                <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '80ms' } as React.CSSProperties} />
                                <div className="mt-2 h-16 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '160ms' } as React.CSSProperties} />
                            </div>
                        </div>
                    )}
                    {!initialLoading && isEmptyAfterLoad() && (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950/50 px-3 py-6 text-center">
                            <p className="text-xs font-medium text-zinc-300">No diaries yet</p>
                            <p className="text-xs text-zinc-500">Diaries will appear after you add activity. Chat more to generate insights.</p>
                            <Link
                                to="/user/chat"
                                className="rounded-sm border border-indigo-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-indigo-200 hover:bg-zinc-800"
                                aria-label="Go to chat to generate diaries"
                            >
                                Go to chat
                            </Link>
                        </div>
                    )}
                    {!initialLoading && !isEmptyAfterLoad() && (
                        <div>
                            <div className="mb-2 flex flex-wrap gap-1">
                                {dailyAiDiary.content && (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-200">
                                        <input type="checkbox" checked={showDaily} onChange={(e) => setShowDaily(e.target.checked)} className="rounded-sm border-zinc-300 text-indigo-600" aria-label="Toggle Today diary" />
                                        Today
                                    </label>
                                )}
                                {yesterdayAiDiary.content && (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-200">
                                        <input
                                            type="checkbox"
                                            checked={showYesterday}
                                            onChange={(e) => setShowYesterday(e.target.checked)}
                                            className="rounded-sm border-zinc-300 text-indigo-600"
                                            aria-label="Toggle Yesterday diary"
                                        />
                                        Yesterday
                                    </label>
                                )}
                                {currentWeekAiDiary.content && (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-200">
                                        <input
                                            type="checkbox"
                                            checked={showWeekly}
                                            onChange={(e) => setShowWeekly(e.target.checked)}
                                            className="rounded-sm border-zinc-300 text-indigo-600"
                                            aria-label="Toggle This week diary"
                                        />
                                        This week
                                    </label>
                                )}
                                {lastWeekAiDiary.content && (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-200">
                                        <input
                                            type="checkbox"
                                            checked={showLastWeek}
                                            onChange={(e) => setShowLastWeek(e.target.checked)}
                                            className="rounded-sm border-zinc-300 text-indigo-600"
                                            aria-label="Toggle Last week diary"
                                        />
                                        Last week
                                    </label>
                                )}
                                {currentMonthAiDiary.content && (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-200">
                                        <input
                                            type="checkbox"
                                            checked={showMonthly}
                                            onChange={(e) => setShowMonthly(e.target.checked)}
                                            className="rounded-sm border-zinc-300 text-indigo-600"
                                            aria-label="Toggle This month diary"
                                        />
                                        This month
                                    </label>
                                )}
                                {lastMonthAiDiary.content && (
                                    <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-200">
                                        <input
                                            type="checkbox"
                                            checked={showLastMonth}
                                            onChange={(e) => setShowLastMonth(e.target.checked)}
                                            className="rounded-sm border-zinc-300 text-indigo-600"
                                            aria-label="Toggle Last month diary"
                                        />
                                        Last month
                                    </label>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {showDaily && dailyAiDiary.content && (
                                    <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">{new Date().toLocaleDateString()}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copyDiary(dailyAiDiary.content);
                                                }}
                                                className="rounded-sm border border-zinc-700 bg-zinc-950 p-1 text-zinc-400 hover:bg-zinc-800"
                                                aria-label="Copy Today diary"
                                                title="Copy"
                                            >
                                                <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                                            Today
                                            {dailyAiDiary.lifeEventId && (
                                                <Link to={`/user/life-events?action=edit&id=${dailyAiDiary.lifeEventId}`} className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-300">
                                                    View
                                                </Link>
                                            )}
                                        </h3>
                                        <div className="whitespace-pre-wrap text-xs text-zinc-200" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                            {dailyAiDiary.content}
                                        </div>
                                    </div>
                                )}
                                {showYesterday && yesterdayAiDiary.content && (
                                    <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">{new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toLocaleDateString()}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copyDiary(yesterdayAiDiary.content);
                                                }}
                                                className="rounded-sm border border-zinc-700 bg-zinc-950 p-1 text-zinc-400 hover:bg-zinc-800"
                                                aria-label="Copy Yesterday diary"
                                                title="Copy"
                                            >
                                                <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                                            Yesterday
                                            {yesterdayAiDiary.lifeEventId && (
                                                <Link to={`/user/life-events?action=edit&id=${yesterdayAiDiary.lifeEventId}`} className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-300">
                                                    View
                                                </Link>
                                            )}
                                        </h3>
                                        <div className="whitespace-pre-wrap text-xs text-zinc-200" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                            {yesterdayAiDiary.content}
                                        </div>
                                    </div>
                                )}
                                {showWeekly && currentWeekAiDiary.content && (
                                    <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">This Week</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copyDiary(currentWeekAiDiary.content);
                                                }}
                                                className="rounded-sm border border-zinc-700 bg-zinc-950 p-1 text-zinc-400 hover:bg-zinc-800"
                                                aria-label="Copy This week diary"
                                                title="Copy"
                                            >
                                                <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                                            AI Weekly Diary
                                            {currentWeekAiDiary.lifeEventId && (
                                                <Link to={`/user/life-events?action=edit&id=${currentWeekAiDiary.lifeEventId}`} className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-300">
                                                    View
                                                </Link>
                                            )}
                                        </h3>
                                        <div className="whitespace-pre-wrap text-xs text-zinc-200" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                            {currentWeekAiDiary.content}
                                        </div>
                                    </div>
                                )}
                                {showLastWeek && lastWeekAiDiary.content && (
                                    <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">Last Week</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copyDiary(lastWeekAiDiary.content);
                                                }}
                                                className="rounded-sm border border-zinc-700 bg-zinc-950 p-1 text-zinc-400 hover:bg-zinc-800"
                                                aria-label="Copy Last week diary"
                                                title="Copy"
                                            >
                                                <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                                            AI Last Week Diary
                                            {lastWeekAiDiary.lifeEventId && (
                                                <Link to={`/user/life-events?action=edit&id=${lastWeekAiDiary.lifeEventId}`} className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-300">
                                                    View
                                                </Link>
                                            )}
                                        </h3>
                                        <div className="whitespace-pre-wrap text-xs text-zinc-200" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                            {lastWeekAiDiary.content}
                                        </div>
                                    </div>
                                )}
                                {showMonthly && currentMonthAiDiary.content && (
                                    <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">This Month</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copyDiary(currentMonthAiDiary.content);
                                                }}
                                                className="rounded-sm border border-zinc-700 bg-zinc-950 p-1 text-zinc-400 hover:bg-zinc-800"
                                                aria-label="Copy This month diary"
                                                title="Copy"
                                            >
                                                <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                                            AI Monthly Diary
                                            {currentMonthAiDiary.lifeEventId && (
                                                <Link to={`/user/life-events?action=edit&id=${currentMonthAiDiary.lifeEventId}`} className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-300">
                                                    View
                                                </Link>
                                            )}
                                        </h3>
                                        <div className="whitespace-pre-wrap text-xs text-zinc-200" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                            {currentMonthAiDiary.content}
                                        </div>
                                    </div>
                                )}
                                {showLastMonth && lastMonthAiDiary.content && (
                                    <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">Last Month</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copyDiary(lastMonthAiDiary.content);
                                                }}
                                                className="rounded-sm border border-zinc-700 bg-zinc-950 p-1 text-zinc-400 hover:bg-zinc-800"
                                                aria-label="Copy Last month diary"
                                                title="Copy"
                                            >
                                                <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                        <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                                            AI Last Month Diary
                                            {lastMonthAiDiary.lifeEventId && (
                                                <Link to={`/user/life-events?action=edit&id=${lastMonthAiDiary.lifeEventId}`} className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-300">
                                                    View
                                                </Link>
                                            )}
                                        </h3>
                                        <div className="whitespace-pre-wrap text-xs text-zinc-200" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                            {lastMonthAiDiary.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiSuggestionsDiary;
