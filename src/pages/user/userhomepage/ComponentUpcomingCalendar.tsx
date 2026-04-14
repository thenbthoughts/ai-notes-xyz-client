import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { LucideCalendar, LucideChevronRight } from 'lucide-react';

import axiosCustom from '../../../config/axiosCustom';

const panel =
    'rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2.5 shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:shadow-lg hover:shadow-sky-200/40';
const panelTitle = 'flex items-center gap-1.5 text-xs font-bold text-sky-900';

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

type UpcomingKindFilter = 'all' | 'task' | 'life' | 'infoVault';

function filterRowsByKind(rows: UpcomingRow[], filter: UpcomingKindFilter): UpcomingRow[] {
    if (filter === 'all') {
        return rows;
    }
    if (filter === 'task') {
        return rows.filter((r) => r.kindLabel === 'Task');
    }
    if (filter === 'life') {
        return rows.filter((r) => r.kindLabel === 'Event');
    }
    return rows.filter((r) => r.kindLabel === 'Info Vault' || r.kindLabel === 'Repeating');
}

function parseTaskIdFromRow(row: UpcomingRow): string | null {
    if (!row.moreInfoLink.startsWith(TASK_EDIT_PREFIX)) {
        return null;
    }
    const id = row.moreInfoLink.slice(TASK_EDIT_PREFIX.length).split('&')[0];
    return id || null;
}

/** Chronological order; for the same task id, only the earliest row is kept. Caps at `limit`. */
function pickUpcomingDedupedTasks(sorted: UpcomingRow[], limit: number): UpcomingRow[] {
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
}

/** Tasks, life events, and Info Vault only (no schedules, remainders, or diary). */
function mapCalenderDocsToRows(docs: tsCalenderApiRes[]): UpcomingRow[] {
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
        }
    }

    return rows;
}

const filterChipBtn = (active: boolean) =>
    `rounded-lg border px-1.5 py-0.5 text-[10px] font-semibold transition sm:text-[11px] ${
        active
            ? 'border-cyan-500 bg-cyan-100 text-cyan-950 shadow-sm'
            : 'border-sky-200/90 bg-white/80 text-sky-700 hover:border-cyan-300 hover:bg-cyan-50/60'
    }`;

const ComponentUpcomingCalendar = () => {
    const [baseRows, setBaseRows] = useState<UpcomingRow[]>([]);
    const [kindFilter, setKindFilter] = useState<UpcomingKindFilter>('all');
    const [loading, setLoading] = useState(true);

    const displayRows = useMemo(() => {
        const narrowed = filterRowsByKind(baseRows, kindFilter);
        return pickUpcomingDedupedTasks(narrowed, UPCOMING_LIMIT);
    }, [baseRows, kindFilter]);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const start = new Date();
                const end = new Date();
                end.setFullYear(end.getFullYear() + 1);

                const result = await axiosCustom.post('/api/calender/crud/calenderGet', {
                    page: 1,
                    perPage: 1000,
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                    filterEventTypeTasks: true,
                    filterEventTypeLifeEvents: true,
                    filterEventTypeInfoVault: true,
                    filterEventTypeDiary: false,
                    filterEventTypeTaskSchedule: false,
                });

                const docs = result.data.docs as tsCalenderApiRes[];
                const mapped = mapCalenderDocsToRows(docs);
                const nowMs = Date.now();
                const sorted = mapped
                    .filter((r) => r.start.getTime() >= nowMs)
                    .sort((a, b) => a.start.getTime() - b.start.getTime());

                setBaseRows(sorted);
            } catch (error) {
                console.error('Error fetching upcoming calendar items:', error);
                setBaseRows([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchUpcoming();
    }, []);

    return (
        <div className={`${panel} border-l-4 border-l-cyan-400`}>
            <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className={panelTitle}>
                    <LucideCalendar className="h-3.5 w-3.5 shrink-0 text-cyan-600" strokeWidth={2} />
                    Up next
                </h2>
                <Link
                    to="/user/calender"
                    className="inline-flex shrink-0 items-center gap-0.5 rounded-xl border-2 border-cyan-200/80 bg-cyan-50/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-900 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-100"
                >
                    Calendar
                    <LucideChevronRight className="h-3 w-3" strokeWidth={2} />
                </Link>
            </div>

            <div className="mb-2 flex flex-wrap gap-1">
                <button type="button" className={filterChipBtn(kindFilter === 'all')} onClick={() => setKindFilter('all')}>
                    All
                </button>
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'task')}
                    onClick={() => setKindFilter('task')}
                >
                    Task
                </button>
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'life')}
                    onClick={() => setKindFilter('life')}
                >
                    Life event
                </button>
                <button
                    type="button"
                    className={filterChipBtn(kindFilter === 'infoVault')}
                    onClick={() => setKindFilter('infoVault')}
                >
                    Info Vault
                </button>
            </div>

            {loading && (
                <p className="text-[11px] font-medium text-sky-700/75">Loading…</p>
            )}

            {!loading && displayRows.length === 0 && (
                <p className="text-[11px] font-medium text-sky-700/75">Nothing scheduled ahead in the next year.</p>
            )}

            {!loading && displayRows.length > 0 && (
                <ul className="max-h-[min(70vh,28rem)] space-y-1.5 overflow-y-auto [scrollbar-width:thin]">
                    {displayRows.map((row) => (
                        <li key={`${row.moreInfoLink}-${row.start.getTime()}-${row.title}`}>
                            <Link
                                to={row.moreInfoLink}
                                className="block rounded-xl border border-sky-100 bg-sky-50/40 px-2 py-1.5 transition hover:border-cyan-200 hover:bg-cyan-50/50"
                            >
                                <div className="flex items-center justify-between gap-1">
                                    <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-cyan-800">
                                        {row.kindLabel}
                                    </span>
                                    <span className="shrink-0 text-[10px] font-medium text-sky-800/90">
                                        {row.start.toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-sky-900">
                                    {row.title}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ComponentUpcomingCalendar;
