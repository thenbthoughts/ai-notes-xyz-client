import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { LucideCalendar, LucideChevronRight, LucideRefreshCw, LucideChevronDown, LucideChevronUp } from 'lucide-react';

import axiosCustom from '../../../config/axiosCustom';
import { panel, panelTitle, filterChipBtn } from './homepagePanelStyles';

type CalFromCollection =
    | 'tasks'
    | 'taskRemainders'
    | 'taskDueDateRemainders'
    | 'lifeEvents'
    | 'infoVaultSignificantDate'
    | 'infoVaultSignificantDateRepeat'
    | 'taskSchedules';

interface tsCalenderApiRes {
    _id: string;
    fromCollection: CalFromCollection;
    taskInfo?: {
        _id: string;
        title: string;
        dueDate: Date;
    };
    lifeEventInfo?: {
        _id: string;
        title: string;
        eventDateUtc: Date;
    };
    infoVaultSignificantDate?: {
        _id: string;
        infoVaultId: string;
        label: string;
        date: Date;
    };
    infoVaultSignificantDateRepeat?: {
        _id: string;
        infoVaultId: string;
        label: string;
        date: Date;
        normalizedDate: Date;
    };
    taskScheduleInfo?: {
        _id: string;
        title: string;
        scheduleExecutionTime: Date;
    };
    taskReminderInfo?: {
        _id: string;
        title: string;
        dueDate: Date;
        reminderTime: Date;
    };
}

type UpcomingRow = {
    start: Date;
    title: string;
    moreInfoLink: string;
    kindLabel: string;
};

const TASK_EDIT_PREFIX = '/user/task/?edit-task-id=';
const UPCOMING_LIMIT = 100;
const INITIAL_VISIBLE = 5;

type UpcomingKindFilter = 'all' | 'task' | 'life' | 'infoVault';

const filterRowsByKind = (rows: UpcomingRow[], filter: UpcomingKindFilter) => {
    if (filter === 'all') {
        return rows;
    }
    if (filter === 'task') {
        return rows.filter((r) => {
            return r.kindLabel === 'Task';
        });
    }
    if (filter === 'life') {
        return rows.filter((r) => {
            return r.kindLabel === 'Event';
        });
    }
    return rows.filter((r) => {
        return r.kindLabel === 'Info Vault' || r.kindLabel === 'Repeating';
    });
};

const parseTaskIdFromRow = (row: UpcomingRow) => {
    if (!row.moreInfoLink.startsWith(TASK_EDIT_PREFIX)) {
        return null;
    }
    const id = row.moreInfoLink.slice(TASK_EDIT_PREFIX.length).split('&')[0];
    return id || null;
};

const pickUpcomingDedupedTasks = (sorted: UpcomingRow[], limit: number) => {
    const seenTaskIds = new Set<string>();
    const out: UpcomingRow[] = [];
    for (const row of sorted) {
        const taskId = parseTaskIdFromRow(row);
        if (taskId) {
            if (seenTaskIds.has(taskId)) {
                continue;
            }
            seenTaskIds.add(taskId);
        }
        out.push(row);
        if (out.length >= limit) {
            break;
        }
    }
    return out;
};

const mapCalenderDocsToRows = (docs: tsCalenderApiRes[]) => {
    const rows: UpcomingRow[] = [];
    const seenRepeatIds = new Set<string>();

    if (!Array.isArray(docs)) {
        return rows;
    }

    for (const doc of docs) {
        if (doc.fromCollection === 'tasks' && doc.taskInfo) {
            rows.push({
                start: new Date(doc.taskInfo.dueDate),
                title: doc.taskInfo.title,
                moreInfoLink: `/user/task/?edit-task-id=${doc.taskInfo._id}`,
                kindLabel: 'Task',
            });
        } else if (doc.fromCollection === 'lifeEvents' && doc.lifeEventInfo) {
            rows.push({
                start: new Date(doc.lifeEventInfo.eventDateUtc),
                title: doc.lifeEventInfo.title,
                moreInfoLink: `/user/life-events?action=edit&id=${doc.lifeEventInfo._id}`,
                kindLabel: 'Event',
            });
        } else if (doc.fromCollection === 'infoVaultSignificantDate' && doc.infoVaultSignificantDate) {
            rows.push({
                start: new Date(doc.infoVaultSignificantDate.date),
                title: doc.infoVaultSignificantDate.label,
                moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDate.infoVaultId}`,
                kindLabel: 'Info Vault',
            });
        } else if (doc.fromCollection === 'infoVaultSignificantDateRepeat' && doc.infoVaultSignificantDateRepeat) {
            const repeatId = doc.infoVaultSignificantDateRepeat._id;
            if (seenRepeatIds.has(repeatId)) {
                continue;
            }
            seenRepeatIds.add(repeatId);
            const repeatDate = new Date(
                doc.infoVaultSignificantDateRepeat.normalizedDate || doc.infoVaultSignificantDateRepeat.date
            );
            rows.push({
                start: repeatDate,
                title: doc.infoVaultSignificantDateRepeat.label,
                moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDateRepeat.infoVaultId}`,
                kindLabel: 'Repeating',
            });
        } else if (doc.fromCollection === 'taskSchedules' && doc.taskScheduleInfo) {
            rows.push({
                start: new Date(doc.taskScheduleInfo.scheduleExecutionTime),
                title: doc.taskScheduleInfo.title,
                moreInfoLink: `/user/task-schedule`,
                kindLabel: 'Schedule',
            });
        }
    }

    return rows;
};

const getRelativeChip = (start: Date) => {
    const now = Date.now();
    const diffMs = start.getTime() - now;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        return 'today';
    }
    if (diffDays === 1) {
        return 'in 1 day';
    }
    if (diffDays > 1 && diffDays < 30) {
        return `in ${diffDays} days`;
    }
    if (diffDays >= 30) {
        const months = Math.round(diffDays / 30);
        if (months === 1) {
            return 'in 1 month';
        }
        return `in ${months} months`;
    }
    if (diffDays < 0) {
        return 'overdue';
    }
    return `in ${diffDays} days`;
};

const scheduleStorageKey = 'home-upcoming-include-schedule';
const dateStartStorageKey = 'home-upcoming-start';
const dateEndStorageKey = 'home-upcoming-end';

const readBoolStorage = (key: string, fallback: boolean) => {
    try {
        const raw = localStorage.getItem(key);
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

const readDateStorage = (key: string, fallback: string) => {
    try {
        const raw = localStorage.getItem(key);
        if (typeof raw === 'string' && raw.length >= 8) {
            return raw;
        }
        return fallback;
    } catch {
        return fallback;
    }
};

const writeStorage = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        return;
    }
};

const toInputDate = (d: Date) => {
    return d.toISOString().slice(0, 10);
};

const ComponentUpcomingCalendar = ({ refreshKey }: { refreshKey?: number }) => {
    const [baseRows, setBaseRows] = useState<UpcomingRow[]>([]);
    const [kindFilter, setKindFilter] = useState<UpcomingKindFilter>('all');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [includeTaskSchedule, setIncludeTaskSchedule] = useState(() => {
        return readBoolStorage(scheduleStorageKey, false);
    });
    const [startDateStr, setStartDateStr] = useState(() => {
        return readDateStorage(dateStartStorageKey, toInputDate(new Date()));
    });
    const [endDateStr, setEndDateStr] = useState(() => {
        const e = new Date();
        e.setFullYear(e.getFullYear() + 1);
        return readDateStorage(dateEndStorageKey, toInputDate(e));
    });

    const displayRows = useMemo(() => {
        const narrowed = filterRowsByKind(baseRows, kindFilter);
        return pickUpcomingDedupedTasks(narrowed, UPCOMING_LIMIT);
    }, [baseRows, kindFilter]);

    const visibleRows = useMemo(() => {
        if (showAll) {
            return displayRows;
        }
        return displayRows.slice(0, INITIAL_VISIBLE);
    }, [displayRows, showAll]);

    const fetchUpcoming = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            let start = new Date();
            let end = new Date();
            end.setFullYear(end.getFullYear() + 1);
            try {
                if (startDateStr) {
                    const parsed = new Date(startDateStr);
                    if (!isNaN(parsed.getTime())) {
                        start = parsed;
                    }
                }
                if (endDateStr) {
                    const parsed = new Date(endDateStr);
                    if (!isNaN(parsed.getTime())) {
                        end = parsed;
                        end.setHours(23, 59, 59, 999);
                    }
                }
            } catch {
                return;
            }

            const result = await axiosCustom.post('/api/calender/crud/calenderGet', {
                page: 1,
                perPage: 1000,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                filterEventTypeTasks: true,
                filterEventTypeLifeEvents: true,
                filterEventTypeInfoVault: true,
                filterEventTypeDiary: false,
                filterEventTypeTaskSchedule: includeTaskSchedule,
            });

            const docs = result.data.docs as tsCalenderApiRes[];
            const mapped = mapCalenderDocsToRows(docs);
            const nowMs = Date.now();
            const sorted = mapped
                .filter((r) => {
                    return r.start.getTime() >= nowMs;
                })
                .sort((a, b) => {
                    return a.start.getTime() - b.start.getTime();
                });

            setBaseRows(sorted);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching upcoming calendar items:', error);
            setBaseRows([]);
            setErrorMsg('Failed to load upcoming items');
        } finally {
            setLoading(false);
        }
    }, [startDateStr, endDateStr, includeTaskSchedule, refreshKey]);

    useEffect(() => {
        writeStorage(scheduleStorageKey, String(includeTaskSchedule));
    }, [includeTaskSchedule]);

    useEffect(() => {
        writeStorage(dateStartStorageKey, startDateStr);
    }, [startDateStr]);

    useEffect(() => {
        writeStorage(dateEndStorageKey, endDateStr);
    }, [endDateStr]);

    useEffect(() => {
        void fetchUpcoming();
    }, [fetchUpcoming]);

    return (
        <div className={`${panel} border-l-4 border-l-cyan-400`}>
            <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className={panelTitle}>
                    <LucideCalendar className="h-3.5 w-3.5 shrink-0 text-cyan-400" strokeWidth={2} />
                    Up next
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => {
                            void fetchUpcoming();
                        }}
                        className="rounded-xl border-2 border-cyan-700/70 bg-zinc-800/80 p-1 text-cyan-300 shadow-sm transition hover:border-cyan-600 hover:bg-zinc-800 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        aria-label="Refresh upcoming calendar"
                        title="Refresh"
                    >
                        <LucideRefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <Link
                        to="/user/calender"
                        className="inline-flex shrink-0 items-center gap-0.5 rounded-xl border-2 border-cyan-700/80 bg-cyan-950/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100 shadow-sm transition hover:border-cyan-500 hover:bg-cyan-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        aria-label="Open calendar page"
                    >
                        Calendar
                        <LucideChevronRight className="h-3 w-3" strokeWidth={2} />
                    </Link>
                </div>
            </div>

            {lastUpdated && (
                <p className="mb-1 text-[10px] font-medium text-zinc-500">Updated {lastUpdated.toLocaleTimeString()}</p>
            )}

            <div className="mb-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'all')}
                    aria-label="Filter all upcoming"
                    onClick={() => {
                        setKindFilter('all');
                    }}
                >
                    All
                </button>
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'task')}
                    aria-label="Filter tasks only"
                    onClick={() => {
                        setKindFilter('task');
                    }}
                >
                    Task
                </button>
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'life')}
                    aria-label="Filter life events only"
                    onClick={() => {
                        setKindFilter('life');
                    }}
                >
                    Life event
                </button>
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'infoVault')}
                    aria-label="Filter Info Vault only"
                    onClick={() => {
                        setKindFilter('infoVault');
                    }}
                >
                    Info Vault
                </button>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <label className="flex items-center gap-1 text-[10px] font-semibold text-zinc-300">
                    <span>From</span>
                    <input
                        type="date"
                        value={startDateStr}
                        onChange={(event) => {
                            setStartDateStr(event.target.value);
                        }}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-[10px] text-zinc-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        aria-label="Upcoming start date"
                    />
                </label>
                <label className="flex items-center gap-1 text-[10px] font-semibold text-zinc-300">
                    <span>To</span>
                    <input
                        type="date"
                        value={endDateStr}
                        onChange={(event) => {
                            setEndDateStr(event.target.value);
                        }}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-[10px] text-zinc-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        aria-label="Upcoming end date"
                    />
                </label>
                <label className="ml-1 flex items-center gap-1 text-[10px] font-semibold text-zinc-300">
                    <input
                        type="checkbox"
                        checked={includeTaskSchedule}
                        onChange={(event) => {
                            setIncludeTaskSchedule(event.target.checked);
                        }}
                        className="h-3 w-3 rounded border-zinc-600 bg-zinc-900 text-cyan-600 focus:ring-cyan-500"
                        aria-label="Include task schedules"
                    />
                    Schedules
                </label>
            </div>

            {loading && (
                <div className="space-y-2">
                    <div className="h-12 animate-pulse rounded-xl bg-zinc-800/60" style={{ animationDelay: '0ms' }} />
                    <div className="h-12 animate-pulse rounded-xl bg-zinc-800/60" style={{ animationDelay: '120ms' }} />
                    <div className="h-12 animate-pulse rounded-xl bg-zinc-800/60" style={{ animationDelay: '240ms' }} />
                </div>
            )}

            {!loading && errorMsg && (
                <div className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-3 text-center">
                    <p className="text-xs font-semibold text-rose-200">{errorMsg}</p>
                    <button
                        type="button"
                        onClick={() => {
                            void fetchUpcoming();
                        }}
                        className="mt-2 rounded-lg border border-rose-700 bg-zinc-900 px-3 py-1 text-xs font-bold text-rose-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        aria-label="Retry loading upcoming calendar"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !errorMsg && displayRows.length === 0 && (
                <p className="text-[11px] font-medium text-sky-300/75">Nothing scheduled ahead in the next year.</p>
            )}

            {!loading && !errorMsg && displayRows.length > 0 && (
                <div>
                    <ul className="max-h-[min(70vh,28rem)] space-y-1.5 overflow-y-auto [scrollbar-width:thin]">
                        {visibleRows.map((row) => {
                            return (
                                <li key={`${row.moreInfoLink}-${row.start.getTime()}-${row.title}`}>
                                <Link
                                    to={row.moreInfoLink}
                                    className="block rounded-xl border border-zinc-800 bg-zinc-800/40 px-2 py-1.5 transition hover:border-cyan-700 hover:bg-cyan-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                                    aria-label={`${row.kindLabel} ${row.title} ${getRelativeChip(row.start)}`}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                                            {row.kindLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <span className="rounded-md bg-cyan-900/60 px-1 py-0.5 text-[10px] font-bold text-cyan-200">{getRelativeChip(row.start)}</span>
                                            <span className="shrink-0 text-[10px] font-medium text-sky-200/90">
                                                {row.start.toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-sky-100">{row.title}</p>
                                </Link>
                            </li>
                            );
                        })}
                    </ul>
                    {displayRows.length > INITIAL_VISIBLE && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowAll((prev) => {
                                    return !prev;
                                });
                            }}
                            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                            aria-label={showAll ? 'Show fewer upcoming items' : `Show ${displayRows.length - INITIAL_VISIBLE} more upcoming items`}
                        >
                            {showAll ? (
                                <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                            ) : (
                                <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                            )}
                            {showAll ? 'Show less' : `Show ${displayRows.length - INITIAL_VISIBLE} more`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComponentUpcomingCalendar;
