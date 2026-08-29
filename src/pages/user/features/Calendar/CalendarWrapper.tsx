import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
    LucideCalendar,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideCopy,
    LucideDownload,
    LucideLink,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSearch,
    LucideSettings,
    LucideX,
} from 'lucide-react';
import axiosCustom from '../../../../config/axiosCustom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { DateTime } from 'luxon';
import calendarScss from './scss/calendarWrapper.module.scss';

interface Event {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    allDay: boolean;
    extendedProps?: {
        recordId: string;
        fromCollection:
            | 'tasks'
            | 'taskRemainders'
            | 'taskDueDateRemainders'
            | 'lifeEvents'
            | 'infoVaultSignificantDate'
            | 'infoVaultSignificantDateRepeat'
            | 'taskSchedules';
        moreInfoLink: string;
    };
}

interface tsCalenderApiRes {
    _id: string;
    fromCollection:
        | 'tasks'
        | 'taskRemainders'
        | 'taskDueDateRemainders'
        | 'lifeEvents'
        | 'infoVaultSignificantDate'
        | 'infoVaultSignificantDateRepeat'
        | 'taskSchedules';
    taskInfo?: { _id: string; title: string; dueDate: Date };
    lifeEventInfo?: { _id: string; title: string; eventDateUtc: Date };
    infoVaultSignificantDate?: { _id: string; infoVaultId: string; label: string; date: Date };
    infoVaultSignificantDateRepeat?: { _id: string; infoVaultId: string; label: string; date: Date; normalizedDate: Date };
    taskScheduleInfo?: { _id: string; title: string; scheduleExecutionTime: Date };
    taskReminderInfo?: { _id: string; title: string; dueDate: Date; reminderTime: Date };
}

const railBtn = 'flex w-full items-center justify-center rounded-none border-0 py-1.5 text-zinc-200 transition-colors';
const VIEW_KEY = 'calendar-view-mode';
const VIEW_OPTIONS = ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'] as const;

const sourceColor: Record<string, string> = {
    tasks: 'border-indigo-600 bg-indigo-600 text-white',
    taskRemainders: 'border-amber-600 bg-amber-600 text-white',
    taskDueDateRemainders: 'border-cyan-600 bg-cyan-700 text-white',
    lifeEvents: 'border-violet-600 bg-violet-600 text-white',
    infoVaultSignificantDate: 'border-sky-600 bg-sky-700 text-white',
    infoVaultSignificantDateRepeat: 'border-emerald-600 bg-emerald-600 text-white',
    taskSchedules: 'border-orange-600 bg-orange-600 text-white',
};

const sourceDot: Record<string, string> = {
    tasks: 'bg-indigo-500',
    taskRemainders: 'bg-amber-500',
    taskDueDateRemainders: 'bg-cyan-500',
    lifeEvents: 'bg-violet-500',
    infoVaultSignificantDate: 'bg-sky-500',
    infoVaultSignificantDateRepeat: 'bg-emerald-500',
    taskSchedules: 'bg-orange-500',
};

const editableCollections = new Set(['tasks', 'lifeEvents', 'infoVaultSignificantDate', 'infoVaultSignificantDateRepeat']);

const CalendarWrapper = () => {
    const calendarRef = useRef<FullCalendar | null>(null);
    const getInitialView = () => {
        try {
            const v = localStorage.getItem(VIEW_KEY);
            if (v && (VIEW_OPTIONS as readonly string[]).includes(v)) {
                return v;
            }
        } catch (_e) {
            void 0;
        }
        return 'dayGridMonth';
    };
    const [currentView, setCurrentView] = useState<string>(() => getInitialView());
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [monthJump, setMonthJump] = useState<string>('');
    const [popoverEvent, setPopoverEvent] = useState<Event | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');
    const [miniDate, setMiniDate] = useState<Date>(() => new Date());
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [createDate, setCreateDate] = useState<Date | null>(null);
    const [createTitle, setCreateTitle] = useState<string>('');
    const [createSaving, setCreateSaving] = useState<boolean>(false);
    const [dragConflict, setDragConflict] = useState<string>('');

    const [filterEventTypeTasks, setFilterEventTypeTasks] = useState<boolean>(true);
    const [filterEventTypeLifeEvents, setFilterEventTypeLifeEvents] = useState<boolean>(true);
    const [filterEventTypeInfoVault, setFilterEventTypeInfoVault] = useState<boolean>(true);
    const [filterEventTypeTaskSchedule, setFilterEventTypeTaskSchedule] = useState<boolean>(false);

    const tzBadge = (() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const offset = DateTime.now().toFormat('ZZ');
            return `${tz} ${offset}`;
        } catch (_e) {
            return 'UTC';
        }
    })();

    const persistView = (v: string) => {
        try {
            localStorage.setItem(VIEW_KEY, v);
        } catch (_e) {
            void 0;
        }
    };

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            let startDateDynamic = '';
            let endDateDynamic = '';
            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi();
                startDateDynamic = calendarApi.view.activeStart.toISOString();
                endDateDynamic = calendarApi.view.activeEnd.toISOString();
            }
            const result = await axiosCustom.post('/api/calender/crud/calenderGet', {
                page: 1,
                perPage: 1000,
                startDate: startDateDynamic,
                endDate: endDateDynamic,
                filterEventTypeTasks,
                filterEventTypeLifeEvents,
                filterEventTypeInfoVault,
                filterEventTypeTaskSchedule,
                searchText: searchText.trim(),
            });
            let resDocs = result.data.docs as tsCalenderApiRes[];
            let tempArr = [] as Event[];
            if (Array.isArray(resDocs)) {
                for (const doc of resDocs) {
                    if (doc.fromCollection === 'tasks' && doc.taskInfo) {
                        const d = new Date(doc.taskInfo.dueDate);
                        tempArr.push({ id: `${doc.taskInfo._id}-${d.getTime()}`, title: doc.taskInfo.title, start: d, allDay: false, extendedProps: { recordId: doc.taskInfo._id, fromCollection: 'tasks', moreInfoLink: `/user/task/?edit-task-id=${doc.taskInfo._id}` } });
                    } else if (doc.fromCollection === 'lifeEvents' && doc.lifeEventInfo) {
                        const d = new Date(doc.lifeEventInfo.eventDateUtc);
                        tempArr.push({ id: `${doc.lifeEventInfo._id}-${d.getTime()}`, title: doc.lifeEventInfo.title, start: d, allDay: false, extendedProps: { recordId: doc.lifeEventInfo._id, fromCollection: 'lifeEvents', moreInfoLink: `/user/life-events?action=edit&id=${doc.lifeEventInfo._id}` } });
                    } else if (doc.fromCollection === 'infoVaultSignificantDate' && doc.infoVaultSignificantDate) {
                        const d = new Date(doc.infoVaultSignificantDate.date);
                        tempArr.push({ id: `${doc.infoVaultSignificantDate._id}-${d.getTime()}`, title: doc.infoVaultSignificantDate.label, start: d, allDay: false, extendedProps: { recordId: doc.infoVaultSignificantDate._id, fromCollection: 'infoVaultSignificantDate', moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDate.infoVaultId}` } });
                    } else if (doc.fromCollection === 'infoVaultSignificantDateRepeat' && doc.infoVaultSignificantDateRepeat) {
                        let shouldInsert = true;
                        for (let i = 0; i < tempArr.length; i++) {
                            if (tempArr[i].extendedProps?.recordId === doc.infoVaultSignificantDateRepeat._id) {
                                shouldInsert = false;
                                break;
                            }
                        }
                        if (shouldInsert) {
                            const d = new Date(doc.infoVaultSignificantDateRepeat.normalizedDate || doc.infoVaultSignificantDateRepeat.date);
                            tempArr.push({ id: `${doc.infoVaultSignificantDateRepeat._id}-${d.getTime()}`, title: doc.infoVaultSignificantDateRepeat.label, start: d, allDay: false, extendedProps: { recordId: doc.infoVaultSignificantDateRepeat._id, fromCollection: 'infoVaultSignificantDateRepeat', moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDateRepeat.infoVaultId}` } });
                        }
                    } else if (doc.fromCollection === 'taskSchedules' && doc.taskScheduleInfo) {
                        const d = new Date(doc.taskScheduleInfo.scheduleExecutionTime);
                        tempArr.push({ id: `${doc.taskScheduleInfo._id}-${d.getTime()}`, title: doc.taskScheduleInfo.title, start: d, allDay: false, extendedProps: { recordId: doc.taskScheduleInfo._id, fromCollection: 'taskSchedules', moreInfoLink: `/user/task-schedule?action=edit&id=${doc.taskScheduleInfo._id}` } });
                    } else if (doc.fromCollection === 'taskRemainders' && doc.taskReminderInfo) {
                        const d = new Date(doc.taskReminderInfo.reminderTime);
                        tempArr.push({ id: `${doc.taskReminderInfo._id}-${d.getTime()}-rem`, title: `Task reminder: ${doc.taskReminderInfo.title}`, start: d, allDay: false, extendedProps: { recordId: doc.taskReminderInfo._id, fromCollection: 'taskRemainders', moreInfoLink: `/user/task/?edit-task-id=${doc.taskReminderInfo._id}` } });
                    } else if (doc.fromCollection === 'taskDueDateRemainders' && doc.taskReminderInfo) {
                        const d = new Date(doc.taskReminderInfo.reminderTime);
                        tempArr.push({ id: `${doc.taskReminderInfo._id}-${d.getTime()}-due`, title: `Due reminder: ${doc.taskReminderInfo.title}`, start: d, allDay: false, extendedProps: { recordId: doc.taskReminderInfo._id, fromCollection: 'taskDueDateRemainders', moreInfoLink: `/user/task/?edit-task-id=${doc.taskReminderInfo._id}` } });
                    }
                }
            }
            const sorted = tempArr.sort((a, b) => a.start.getTime() - b.start.getTime());
            setEvents(sorted);
            setLastUpdated(new Date().toLocaleTimeString());
            if (sorted.length > 1) {
                const conflicts: string[] = [];
                for (let i = 1; i < sorted.length; i++) {
                    const diff = Math.abs(sorted[i].start.getTime() - sorted[i - 1].start.getTime());
                    if (diff < 60 * 60 * 1000) {
                        conflicts.push(`${sorted[i - 1].title} ↔ ${sorted[i].title}`);
                    }
                }
                if (conflicts.length > 0) {
                    setDragConflict(`${conflicts.length} potential overlap(s) within 1h`);
                } else {
                    setDragConflict('');
                }
            } else {
                setDragConflict('');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    }, [filterEventTypeTasks, filterEventTypeLifeEvents, filterEventTypeInfoVault, filterEventTypeTaskSchedule, searchText]);

    useEffect(() => {
        void fetchEvents();
    }, [fetchEvents, startDate, endDate, currentView]);

    const filterChip = (on: boolean) => `inline-flex cursor-pointer items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${on ? 'border-indigo-300 bg-indigo-950 text-indigo-200' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`;
    const viewBtn = (active: boolean) => `rounded-sm border px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'}`;

    const handleExportCsv = () => {
        try {
            const rows = [['Title', 'Date', 'Source', 'Link'], ...events.map((e) => [e.title, e.start.toISOString(), e.extendedProps?.fromCollection || '', e.extendedProps?.moreInfoLink || ''])];
            const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'calendar-export.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV exported');
        } catch (_e) {
            toast.error('Export failed');
        }
    };

    const handleCopyDate = async (d: Date) => {
        try {
            await navigator.clipboard.writeText(d.toISOString());
            toast.success('Date copied');
        } catch (_e) {
            toast.error('Copy failed');
        }
    };

    const handleDrag = async (info: { event: { id: string; title: string; start: Date | null; end: Date | null; extendedProps: { recordId: string; fromCollection: string } }; revert: () => void }) => {
        const fromCollection = info.event.extendedProps.fromCollection;
        if (!editableCollections.has(fromCollection)) {
            toast.error('This event cannot be moved');
            info.revert();
            return;
        }
        const newStart = info.event.start;
        if (!newStart) {
            info.revert();
            return;
        }
        const recordId = info.event.extendedProps.recordId;
        const oldEvents = [...events];
        setEvents((prev) => prev.map((ev) => {
            if (ev.extendedProps?.recordId === recordId) {
                return { ...ev, start: newStart, end: info.event.end || ev.end };
            }
            return ev;
        }));
        try {
            await axiosCustom.post('/api/calender/crud/calenderEdit', { recordId, fromCollection, start: newStart.toISOString(), end: info.event.end ? info.event.end.toISOString() : undefined });
            toast.success('Event moved');
            const check = events.filter((ev) => Math.abs(ev.start.getTime() - newStart.getTime()) < 3600000 && ev.extendedProps?.recordId !== recordId);
            if (check.length > 0) {
                toast(`⚠ Overlaps ${check.length} event(s)`, { icon: '⚠️' });
            }
        } catch (e) {
            console.error(e);
            setEvents(oldEvents);
            info.revert();
            toast.error('Move failed, reverted');
        }
    };

    const handleResize = async (info: { event: { id: string; title: string; start: Date | null; end: Date | null; extendedProps: { recordId: string; fromCollection: string } }; revert: () => void }) => {
        const fromCollection = info.event.extendedProps.fromCollection;
        if (!editableCollections.has(fromCollection)) {
            toast.error('This event cannot be resized');
            info.revert();
            return;
        }
        const newEnd = info.event.end;
        const newStart = info.event.start;
        if (!newStart || !newEnd) {
            info.revert();
            return;
        }
        const recordId = info.event.extendedProps.recordId;
        const oldEvents = [...events];
        setEvents((prev) => prev.map((ev) => {
            if (ev.extendedProps?.recordId === recordId) {
                return { ...ev, start: newStart, end: newEnd };
            }
            return ev;
        }));
        try {
            await axiosCustom.post('/api/calender/crud/calenderEdit', { recordId, fromCollection, start: newStart.toISOString(), end: newEnd.toISOString() });
            toast.success('Event resized');
        } catch (e) {
            console.error(e);
            setEvents(oldEvents);
            info.revert();
            toast.error('Resize failed');
        }
    };

    const handleCreateInline = async () => {
        if (!createTitle.trim() || !createDate) {
            toast.error('Title required');
            return;
        }
        setCreateSaving(true);
        try {
            const wsRes = await axiosCustom.post('/api/task-workspace/crud/taskWorkspaceGet', {});
            const wsList = (wsRes.data.docs || wsRes.data.workspaces || []) as { _id: string }[];
            let workspaceId = wsList[0]?._id;
            if (!workspaceId) {
                const addRes = await axiosCustom.post('/api/task-workspace/crud/taskWorkspaceAddDefault', {});
                workspaceId = addRes.data._id || addRes.data.doc?._id;
            }
            if (!workspaceId) {
                const fallback = await axiosCustom.post('/api/task-workspace/crud/taskWorkspaceAdd', { title: 'General' });
                workspaceId = fallback.data._id || fallback.data.doc?._id;
            }
            if (!workspaceId) {
                toast.error('No workspace found');
                return;
            }
            const newTask = await axiosCustom.post('/api/task/crud/taskAdd', { title: createTitle.trim(), description: '', taskWorkspaceId: workspaceId });
            const taskId = newTask.data._id || newTask.data.doc?._id;
            if (taskId) {
                await axiosCustom.post('/api/task/crud/taskEdit', { id: taskId, title: createTitle.trim(), dueDate: createDate.toISOString(), taskWorkspaceId: workspaceId });
            }
            toast.success('Task created');
            setShowCreate(false);
            setCreateTitle('');
            setCreateDate(null);
            void fetchEvents();
        } catch (e) {
            console.error(e);
            toast.error('Create failed');
        } finally {
            setCreateSaving(false);
        }
    };

    const counts = {
        tasks: events.filter((e) => e.extendedProps?.fromCollection === 'tasks').length,
        taskRemainders: events.filter((e) => e.extendedProps?.fromCollection === 'taskRemainders').length,
        taskDueDateRemainders: events.filter((e) => e.extendedProps?.fromCollection === 'taskDueDateRemainders').length,
        lifeEvents: events.filter((e) => e.extendedProps?.fromCollection === 'lifeEvents').length,
        staticDate: events.filter((e) => e.extendedProps?.fromCollection === 'infoVaultSignificantDate').length,
        repeating: events.filter((e) => e.extendedProps?.fromCollection === 'infoVaultSignificantDateRepeat').length,
        schedules: events.filter((e) => e.extendedProps?.fromCollection === 'taskSchedules').length,
    };

    const legendChipClass = 'mr-1.5 mb-1 inline-flex cursor-pointer items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium transition-colors';

    const renderMiniCalendar = () => {
        const year = miniDate.getFullYear();
        const month = miniDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startWeekday = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const cells: { d: number; date: Date; isToday: boolean; isWeekend: boolean }[] = [];
        for (let i = 0; i < startWeekday; i++) {
            cells.push({ d: -1, date: new Date(year, month, 1), isToday: false, isWeekend: false });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isToday = date.toDateString() === today.toDateString();
            const wd = date.getDay();
            cells.push({ d, date, isToday, isWeekend: wd === 0 || wd === 6 });
        }
        return (
            <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <button type="button" aria-label="Previous month mini" onClick={() => setMiniDate(new Date(year, month - 1, 1))} className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"><LucideChevronLeft className="h-4 w-4" /></button>
                    <span className="text-xs font-semibold text-zinc-100">{DateTime.fromJSDate(miniDate).toFormat('LLLL yyyy')}</span>
                    <button type="button" aria-label="Next month mini" onClick={() => setMiniDate(new Date(year, month + 1, 1))} className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"><LucideChevronRight className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-zinc-500">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div className="mt-1 grid grid-cols-7 gap-0.5">
                    {cells.map((c, idx) => {
                        if (c.d === -1) {
                            return <span key={`empty-${idx}`} className="h-7" />;
                        }
                        const hasEvent = events.some((ev) => ev.start.toDateString() === c.date.toDateString());
                        return (
                            <button key={`day-${c.d}`} type="button" aria-label={`Go to ${c.date.toDateString()}`} onClick={() => calendarRef.current?.getApi().gotoDate(c.date)} className={`flex h-7 w-full flex-col items-center justify-center rounded-sm border text-[11px] ${c.isToday ? 'border-indigo-600 bg-indigo-600 text-white' : hasEvent ? 'border-zinc-600 bg-zinc-800 text-zinc-100' : c.isWeekend ? 'border-zinc-800 bg-zinc-950 text-zinc-500' : 'border-zinc-800 bg-zinc-950 text-zinc-300'} hover:bg-zinc-700`}>
                                <span>{c.d}</span>
                                {hasEvent && !c.isToday && <span className="h-1 w-1 rounded-full bg-indigo-500" />}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500">
                    <LucideClock className="h-3 w-3" />
                    <span>{tzBadge}</span>
                </div>
                {dragConflict && <div className="mt-1 rounded-sm border border-amber-700 bg-amber-950 px-2 py-1 text-[11px] text-amber-200">{dragConflict}</div>}
            </div>
        );
    };

    const renderSearchBox = () => (
        <div className="mb-3 rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-zinc-700 bg-zinc-950">
                        <LucideCalendar className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold tracking-tight text-zinc-100 md:text-base">Calendar</h1>
                        <p className="text-[11px] text-zinc-500 md:text-xs">Tasks, life events, Info Vault dates and schedules</p>
                        {startDate && <p className="mt-1 text-[10px] text-zinc-400">Range anchor: {new Date(startDate).toLocaleString()}</p>}
                        {lastUpdated && <p className="text-[10px] text-zinc-500">Last updated: {lastUpdated}</p>}
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] font-medium text-zinc-400"><LucideClock className="h-3 w-3" /> {tzBadge}</span>
                    <button type="button" aria-label="Refresh events" onClick={() => { toast.success('Refreshing…'); void fetchEvents(); }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700">
                        <LucideRefreshCcw className="h-3.5 w-3.5" /> Refresh
                    </button>
                    <button type="button" aria-label="Export calendar CSV" onClick={() => handleExportCsv()} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700">
                        <LucideDownload className="h-3.5 w-3.5" /> CSV
                    </button>
                    <div className="flex items-center gap-1">
                        <input aria-label="Jump to month" type="month" value={monthJump} onChange={(e) => setMonthJump(e.target.value)} className="rounded-sm border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-xs text-zinc-200" />
                        <button type="button" aria-label="Go to month" className="rounded-sm border border-indigo-600 bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700" onClick={() => {
                            if (!monthJump) { return; }
                            const d = new Date(monthJump + '-01');
                            if (isNaN(d.getTime())) { toast.error('Invalid date'); return; }
                            calendarRef.current?.getApi().gotoDate(d);
                            setMiniDate(d);
                        }}>Go</button>
                    </div>
                    <Link to="/user/life-events" aria-label="Add event" className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                        <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} /> Add event
                    </Link>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1">
                    <LucideSearch className="h-3.5 w-3.5 text-zinc-500" />
                    <input aria-label="Search events" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setSearchText(searchInput); } }} placeholder="Search title..." className="w-40 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none sm:w-64" />
                    {searchInput && <button type="button" aria-label="Clear search" onClick={() => { setSearchInput(''); setSearchText(''); }} className="text-zinc-400 hover:text-zinc-200"><LucideX className="h-3.5 w-3.5" /></button>}
                </div>
                <button type="button" aria-label="Search events" onClick={() => setSearchText(searchInput)} className="rounded-sm border border-indigo-600 bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700">Search</button>
                {searchText && <span className="text-[11px] text-zinc-400">Filtering: "{searchText}"</span>}
            </div>
        </div>
    );

    const renderFilters = () => (
        <div className="mb-3 flex flex-wrap gap-1.5 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-2 shadow-sm">
            <label className={filterChip(filterEventTypeTasks)}><input aria-label="Filter Tasks" type="checkbox" className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600" checked={filterEventTypeTasks} onChange={(e) => setFilterEventTypeTasks(e.target.checked)} /> Tasks {counts.tasks > 0 ? `(${counts.tasks})` : ''}</label>
            <label className={filterChip(filterEventTypeLifeEvents)}><input aria-label="Filter Life events" type="checkbox" className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600" checked={filterEventTypeLifeEvents} onChange={(e) => setFilterEventTypeLifeEvents(e.target.checked)} /> Life events {counts.lifeEvents > 0 ? `(${counts.lifeEvents})` : ''}</label>
            <label className={filterChip(filterEventTypeInfoVault)}><input aria-label="Filter Info Vault" type="checkbox" className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600" checked={filterEventTypeInfoVault} onChange={(e) => setFilterEventTypeInfoVault(e.target.checked)} /> Info Vault {(counts.staticDate + counts.repeating) > 0 ? `(${counts.staticDate + counts.repeating})` : ''}</label>
            <label className={filterChip(filterEventTypeTaskSchedule)}><input aria-label="Filter Task schedule" type="checkbox" className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600" checked={filterEventTypeTaskSchedule} onChange={(e) => setFilterEventTypeTaskSchedule(e.target.checked)} /> Task schedule {counts.schedules > 0 ? `(${counts.schedules})` : ''}</label>
        </div>
    );

    const renderButtons = () => (
        <div className="sticky top-0 z-10 mb-3 flex flex-col gap-2 border border-zinc-700 bg-zinc-900 px-2 py-2 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap items-center gap-1">
                <button type="button" aria-label="Month view" className={`${viewBtn(currentView === 'dayGridMonth')} rounded-r-none border-r-0`} onClick={() => { calendarRef.current?.getApi().changeView('dayGridMonth'); setCurrentView('dayGridMonth'); persistView('dayGridMonth'); }}>Month</button>
                <button type="button" aria-label="Week view" className={`${viewBtn(currentView === 'timeGridWeek')} rounded-none border-x-0`} onClick={() => { calendarRef.current?.getApi().changeView('timeGridWeek'); setCurrentView('timeGridWeek'); persistView('timeGridWeek'); }}>Week</button>
                <button type="button" aria-label="Day view" className={`${viewBtn(currentView === 'timeGridDay')} rounded-none border-x-0`} onClick={() => { calendarRef.current?.getApi().changeView('timeGridDay'); setCurrentView('timeGridDay'); persistView('timeGridDay'); }}>Day</button>
                <button type="button" aria-label="List view" className={`${viewBtn(currentView === 'listWeek')} rounded-l-none border-l-0`} onClick={() => { calendarRef.current?.getApi().changeView('listWeek'); setCurrentView('listWeek'); persistView('listWeek'); }}>List</button>
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <button type="button" aria-label="Previous period" className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800" onClick={() => calendarRef.current?.getApi().prev()}><LucideChevronLeft className="h-4 w-4" strokeWidth={2} /> Prev</button>
                <button type="button" aria-label="Next period" className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800" onClick={() => calendarRef.current?.getApi().next()}>Next <LucideChevronRight className="h-4 w-4" strokeWidth={2} /></button>
                <button type="button" aria-label="Go to today" className="rounded-sm border border-emerald-700 bg-emerald-950 px-2 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900" onClick={() => calendarRef.current?.getApi().today()}>Today</button>
            </div>
            {searchText && <span className="text-xs text-zinc-400">"{searchText}" in {events.length} result(s)</span>}
        </div>
    );

    const renderRightList = () => {
        const chip = legendChipClass;
        return (
            <div className="space-y-3">
                {renderMiniCalendar()}
                <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm md:p-2.5">
                    <h2 className="text-sm font-semibold text-zinc-100">In view</h2>
                    <div className="mt-2 flex flex-wrap">
                        <span className={`${chip} border-zinc-700 bg-zinc-950 text-zinc-200`}>All {events.length}</span>
                        <button type="button" aria-label="Toggle Tasks filter" onClick={() => setFilterEventTypeTasks((v) => !v)} className={`${chip} ${filterEventTypeTasks ? 'border-indigo-700 bg-indigo-950 text-indigo-200' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>Tasks {counts.tasks}</button>
                        <button type="button" aria-label="Toggle Life events filter" onClick={() => setFilterEventTypeLifeEvents((v) => !v)} className={`${chip} ${filterEventTypeLifeEvents ? 'border-violet-700 bg-violet-950 text-violet-200' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>Events {counts.lifeEvents}</button>
                        <button type="button" aria-label="Toggle Info Vault filter" onClick={() => setFilterEventTypeInfoVault((v) => !v)} className={`${chip} ${filterEventTypeInfoVault ? 'border-sky-700 bg-sky-950 text-sky-200' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>Vault {counts.staticDate + counts.repeating}</button>
                        <button type="button" aria-label="Toggle Task schedule filter" onClick={() => setFilterEventTypeTaskSchedule((v) => !v)} className={`${chip} ${filterEventTypeTaskSchedule ? 'border-amber-700 bg-amber-950 text-amber-200' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>Schedules {counts.schedules}</button>
                    </div>
                    {events.length === 0 ? (
                        <div className="mt-4 rounded-sm border border-dashed border-zinc-700 bg-zinc-950 px-3 py-6 text-center">
                            <p className="text-xs font-medium text-zinc-300">No events in this range</p>
                            <p className="mt-1 text-[11px] text-zinc-500">Try adjusting filters or search, or navigate to another month.</p>
                        </div>
                    ) : (
                        <div className="mt-2 max-h-[60vh] space-y-1.5 overflow-y-auto">
                            {events.map((event) => {
                                const key = `${event.extendedProps?.recordId ?? 'x'}-${event.start.getTime()}-${event.title}`;
                                return (
                                    <button type="button" aria-label={`Go to ${event.title}`} key={key} onClick={() => calendarRef.current?.getApi().gotoDate(event.start)} className="flex w-full items-center gap-2 rounded-sm border border-zinc-700 bg-zinc-950/80 px-2 py-1.5 text-left hover:bg-zinc-800">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-zinc-700 bg-zinc-900 text-sm">
                                            {event.extendedProps?.fromCollection === 'tasks' && '📝'}
                                            {event.extendedProps?.fromCollection === 'taskRemainders' && '🔔'}
                                            {event.extendedProps?.fromCollection === 'taskDueDateRemainders' && '⏳'}
                                            {event.extendedProps?.fromCollection === 'lifeEvents' && '🎉'}
                                            {event.extendedProps?.fromCollection === 'infoVaultSignificantDate' && '📌'}
                                            {event.extendedProps?.fromCollection === 'infoVaultSignificantDateRepeat' && '⭐'}
                                            {event.extendedProps?.fromCollection === 'taskSchedules' && '⏰'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-medium text-zinc-100">{event.title}</div>
                                            <div className="text-[10px] text-zinc-500">{event.start.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex w-full bg-zinc-950">
            <Helmet><title>Calendar</title></Helmet>
            <div className="min-w-0 w-[calc(100vw-50px)]">
                <div id="messagesScrollUp" />
                <div className="min-h-[calc(100vh-60px)] px-2 py-2 md:px-3">
                    {renderSearchBox()}
                    {renderFilters()}
                    {renderButtons()}
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative w-full min-w-0 lg:w-3/4">
                            {loading && <div className="absolute inset-0 z-20 flex items-center justify-center rounded-sm bg-zinc-950/60 backdrop-blur-[1px]"><div className="rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200">Loading events…</div></div>}
                            <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm md:p-3">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                    initialView={currentView}
                                    weekends={true}
                                    weekNumbers={true}
                                    fixedWeekCount={true}
                                    events={events.map((e) => ({ id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay, extendedProps: e.extendedProps, backgroundColor: 'transparent', borderColor: 'transparent' }))}
                                    eventContent={renderEventContent}
                                    editable={true}
                                    droppable={true}
                                    eventDurationEditable={true}
                                    eventStartEditable={true}
                                    selectable={true}
                                    selectMirror={true}
                                    eventClick={(info) => {
                                        info.jsEvent.preventDefault();
                                        const ev: Event = { id: info.event.id, title: info.event.title, start: info.event.start as Date, end: info.event.end || undefined, allDay: info.event.allDay, extendedProps: info.event.extendedProps as Event['extendedProps'] };
                                        setPopoverEvent(ev);
                                    }}
                                    dateClick={(info) => {
                                        setCreateDate(info.date);
                                        setShowCreate(true);
                                    }}
                                    select={(info) => {
                                        setCreateDate(info.start);
                                        setShowCreate(true);
                                    }}
                                    eventDrop={(info) => { void handleDrag({ event: { id: info.event.id, title: info.event.title, start: info.event.start, end: info.event.end, extendedProps: info.event.extendedProps as { recordId: string; fromCollection: string } }, revert: info.revert }); }}
                                    eventResize={(info) => { void handleResize({ event: { id: info.event.id, title: info.event.title, start: info.event.start, end: info.event.end, extendedProps: info.event.extendedProps as { recordId: string; fromCollection: string } }, revert: info.revert }); }}
                                    dayCellClassNames={(arg) => {
                                        const classes: string[] = [];
                                        if (arg.isToday) { classes.push('calendar-today-cell'); }
                                        const d = arg.date.getDay();
                                        if (d === 0 || d === 6) { classes.push('calendar-weekend-cell'); }
                                        return classes;
                                    }}
                                    datesSet={(arg) => {
                                        const d = arg.view.calendar.getDate();
                                        setStartDate(d.toISOString());
                                        setEndDate(arg.end.toISOString());
                                        setCurrentView(arg.view.type);
                                        setMiniDate(d);
                                    }}
                                    height="auto"
                                    contentHeight="auto"
                                    expandRows={true}
                                    nowIndicator={true}
                                    slotMinTime="06:00:00"
                                    slotMaxTime="22:00:00"
                                    headerToolbar={false}
                                />
                            </div>
                        </div>
                        <div className="w-full shrink-0 lg:w-1/4">{renderRightList()}</div>
                    </div>
                </div>
                <div id="messagesScrollDown" />
            </div>
            <div className="flex w-[50px] shrink-0 flex-col items-stretch border-l border-zinc-800 bg-zinc-900 py-1">
                <Link to="/user/setting" aria-label="Go to settings" className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`} title="Settings"><LucideSettings className="h-4 w-4" strokeWidth={1.75} /></Link>
                <button type="button" aria-label="Scroll up" className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`} title="Scroll up" onClick={() => document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' })}><LucideMoveUp className="h-4 w-4" strokeWidth={1.75} /></button>
                <button type="button" aria-label="Scroll down" className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`} title="Scroll down" onClick={() => document.getElementById('messagesScrollDown')?.scrollIntoView({ behavior: 'smooth' })}><LucideMoveDown className="h-4 w-4" strokeWidth={1.75} /></button>
                <button type="button" aria-label="Refresh calendar" className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`} title="Refresh events" onClick={() => { toast.success('Refreshing…'); void fetchEvents(); }}><LucideRefreshCcw className="h-4 w-4" strokeWidth={1.75} /></button>
            </div>
            {popoverEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPopoverEvent(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-sm border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${sourceDot[popoverEvent.extendedProps?.fromCollection || ''] || 'bg-zinc-500'}`} />
                                <h3 className="text-sm font-semibold text-zinc-100">{popoverEvent.title}</h3>
                            </div>
                            <button type="button" aria-label="Close popover" onClick={() => setPopoverEvent(null)} className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"><LucideX className="h-4 w-4" /></button>
                        </div>
                        <p className="mt-2 text-xs text-zinc-400">{popoverEvent.start.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} <span className="ml-1 rounded-sm border border-zinc-700 bg-zinc-950 px-1 py-0.5 text-[10px] text-zinc-400">{tzBadge}</span></p>
                        <p className="mt-1 text-[11px] text-zinc-500">Source: {popoverEvent.extendedProps?.fromCollection}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {popoverEvent.extendedProps?.moreInfoLink && <Link to={popoverEvent.extendedProps.moreInfoLink} className="inline-flex items-center gap-1 rounded-sm border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"><LucideLink className="h-3 w-3" /> Edit / View</Link>}
                            <button type="button" aria-label="Copy event date" onClick={() => void handleCopyDate(popoverEvent.start)} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"><LucideCopy className="h-3 w-3" /> Copy date</button>
                        </div>
                    </div>
                </div>
            )}
            {showCreate && createDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-sm border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-100">Quick create</h3>
                            <button type="button" aria-label="Close create" onClick={() => setShowCreate(false)} className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800"><LucideX className="h-4 w-4" /></button>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">{createDate.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} <span className="ml-1 text-[10px] text-zinc-500">{tzBadge}</span></p>
                        <input aria-label="New task title" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { void handleCreateInline(); } }} placeholder="Task title..." className="mt-3 w-full rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-600" />
                        <div className="mt-3 flex justify-end gap-2">
                            <button type="button" aria-label="Cancel create" onClick={() => setShowCreate(false)} className="rounded-sm border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700">Cancel</button>
                            <button type="button" aria-label="Create task" disabled={createSaving} onClick={() => void handleCreateInline()} className="rounded-sm border border-emerald-700 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{createSaving ? 'Creating…' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function renderEventContent(eventInfo: { timeText: string; event: { title: string; start: Date | null; extendedProps: { recordId: string; fromCollection: string; moreInfoLink: string } } }) {
    const fallbackTime = eventInfo.event.start instanceof Date ? eventInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const timeLabel = eventInfo.timeText || fallbackTime;
    const colorCls = sourceColor[eventInfo.event.extendedProps.fromCollection] || 'border-zinc-600 bg-zinc-700 text-white';
    const isDraggable = editableCollections.has(eventInfo.event.extendedProps.fromCollection);
    return (
        <div className={`rounded-sm border px-1 py-0.5 ${colorCls} ${isDraggable ? 'cursor-move' : ''}`}>
            <b className="text-[10px] opacity-80">{timeLabel}</b>
            <i className={`block text-[11px] font-medium ${calendarScss.calendarTitleLink}`} title={eventInfo.event.title}>{eventInfo.event.title}</i>
        </div>
    );
}

export default CalendarWrapper;
