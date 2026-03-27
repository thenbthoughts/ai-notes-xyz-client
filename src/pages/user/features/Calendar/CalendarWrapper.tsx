import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRef, useState, useEffect } from 'react';
import {
    LucideCalendar,
    LucideChevronLeft,
    LucideChevronRight,
    LucideLink,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings,
} from 'lucide-react';
import axiosCustom from '../../../../config/axiosCustom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import calendarScss from './scss/calendarWrapper.module.scss';

interface Event {
    title: string;
    start: Date;
    end?: Date;
    allDay: true;
    extendedProps?: {
        recordId: string;
        fromCollection:
            | 'tasks'
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
        | 'lifeEvents'
        | 'infoVaultSignificantDate'
        | 'infoVaultSignificantDateRepeat'
        | 'taskSchedules';
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
}

const railBtn =
    'flex w-full items-center justify-center rounded-none border-0 py-1.5 text-zinc-200 transition-colors';

const CalendarWrapper = () => {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [currentView, setCurrentView] = useState<string>('dayGridMonth');

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [events, setEvents] = useState<Event[]>([]);

    const [filterEventTypeTasks, setFilterEventTypeTasks] = useState<boolean>(true);
    const [filterEventTypeLifeEvents, setFilterEventTypeLifeEvents] = useState<boolean>(true);
    const [filterEventTypeInfoVault, setFilterEventTypeInfoVault] = useState<boolean>(true);
    const [filterEventTypeDiary, setFilterEventTypeDiary] = useState<boolean>(true);
    const [filterEventTypeTaskSchedule, setFilterEventTypeTaskSchedule] = useState<boolean>(false);

    const fetchEvents = async () => {
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
                filterEventTypeDiary,
                filterEventTypeTaskSchedule,
            });

            let resDocs = result.data.docs as tsCalenderApiRes[];

            let tempArr = [] as Event[];
            if (Array.isArray(resDocs)) {
                for (const doc of resDocs) {
                    if (doc.fromCollection === 'tasks' && doc.taskInfo) {
                        tempArr.push({
                            title: doc.taskInfo.title,
                            start: new Date(doc.taskInfo.dueDate),
                            allDay: true,
                            extendedProps: {
                                recordId: doc.taskInfo._id,
                                fromCollection: 'tasks',
                                moreInfoLink: `/user/task/?edit-task-id=${doc.taskInfo._id}`,
                            },
                        });
                    } else if (doc.fromCollection === 'lifeEvents' && doc.lifeEventInfo) {
                        tempArr.push({
                            title: doc.lifeEventInfo.title,
                            start: new Date(doc.lifeEventInfo.eventDateUtc),
                            allDay: true,
                            extendedProps: {
                                recordId: doc.lifeEventInfo._id,
                                fromCollection: 'lifeEvents',
                                moreInfoLink: `/user/life-events?action=edit&id=${doc.lifeEventInfo._id}`,
                            },
                        });
                    } else if (doc.fromCollection === 'infoVaultSignificantDate' && doc.infoVaultSignificantDate) {
                        tempArr.push({
                            title: doc.infoVaultSignificantDate.label,
                            start: new Date(doc.infoVaultSignificantDate.date),
                            allDay: true,
                            extendedProps: {
                                recordId: doc.infoVaultSignificantDate._id,
                                fromCollection: 'infoVaultSignificantDate',
                                moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDate.infoVaultId}`,
                            },
                        });
                    } else if (
                        doc.fromCollection === 'infoVaultSignificantDateRepeat' &&
                        doc.infoVaultSignificantDateRepeat
                    ) {
                        let shouldInsert = true;

                        for (let indexRepeated = 0; indexRepeated < tempArr.length; indexRepeated++) {
                            const element = tempArr[indexRepeated];
                            if (element.extendedProps?.recordId === doc.infoVaultSignificantDateRepeat._id) {
                                shouldInsert = false;
                                break;
                            }
                        }

                        if (shouldInsert) {
                            tempArr.push({
                                title: doc.infoVaultSignificantDateRepeat.label,
                                start: new Date(
                                    doc.infoVaultSignificantDateRepeat.normalizedDate ||
                                        doc.infoVaultSignificantDateRepeat.date
                                ),
                                allDay: true,
                                extendedProps: {
                                    recordId: doc.infoVaultSignificantDateRepeat._id,
                                    fromCollection: 'infoVaultSignificantDateRepeat',
                                    moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDateRepeat.infoVaultId}`,
                                },
                            });
                        }
                    } else if (doc.fromCollection === 'taskSchedules' && doc.taskScheduleInfo) {
                        tempArr.push({
                            title: doc.taskScheduleInfo.title,
                            start: new Date(doc.taskScheduleInfo.scheduleExecutionTime),
                            allDay: true,
                            extendedProps: {
                                recordId: doc.taskScheduleInfo._id,
                                fromCollection: 'taskSchedules',
                                moreInfoLink: `/user/task-schedule?action=edit&id=${doc.taskScheduleInfo._id}`,
                            },
                        });
                    }
                }
            }

            const tempArrSorted = tempArr.sort((a, b) => a.start.getTime() - b.start.getTime());

            setEvents(tempArrSorted);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        void fetchEvents();
    }, [
        startDate,
        endDate,
        currentView,
        filterEventTypeTasks,
        filterEventTypeLifeEvents,
        filterEventTypeInfoVault,
        filterEventTypeDiary,
        filterEventTypeTaskSchedule,
    ]);

    const filterChip = (on: boolean) =>
        `inline-flex cursor-pointer items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
            on
                ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                : 'border-zinc-200 bg-white text-zinc-500'
        }`;

    const viewBtn = (active: boolean) =>
        `rounded-sm border px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
            active
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
        }`;

    const renderSearchBox = () => (
        <div className="mb-3 rounded-sm border border-zinc-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-zinc-50">
                        <LucideCalendar className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">Calendar</h1>
                        <p className="text-[11px] text-zinc-500 md:text-xs">
                            Tasks, life events, Info Vault dates, diaries, and schedules
                        </p>
                        {startDate && (
                            <p className="mt-1 text-[10px] text-zinc-400">
                                Range anchor: {new Date(startDate).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
                <Link
                    to="/user/life-events"
                    className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                    <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add event
                </Link>
            </div>
        </div>
    );

    const renderFilters = () => (
        <div className="mb-3 flex flex-wrap gap-1.5 rounded-sm border border-zinc-200 bg-white px-2 py-2 shadow-sm">
            <label className={filterChip(filterEventTypeTasks)}>
                <input
                    type="checkbox"
                    className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600"
                    checked={filterEventTypeTasks}
                    onChange={(e) => setFilterEventTypeTasks(e.target.checked)}
                />
                Tasks
            </label>
            <label className={filterChip(filterEventTypeLifeEvents)}>
                <input
                    type="checkbox"
                    className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600"
                    checked={filterEventTypeLifeEvents}
                    onChange={(e) => setFilterEventTypeLifeEvents(e.target.checked)}
                />
                Life events
            </label>
            <label className={filterChip(filterEventTypeInfoVault)}>
                <input
                    type="checkbox"
                    className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600"
                    checked={filterEventTypeInfoVault}
                    onChange={(e) => setFilterEventTypeInfoVault(e.target.checked)}
                />
                Info Vault
            </label>
            <label className={filterChip(filterEventTypeDiary)}>
                <input
                    type="checkbox"
                    className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600"
                    checked={filterEventTypeDiary}
                    onChange={(e) => setFilterEventTypeDiary(e.target.checked)}
                />
                Diary
            </label>
            <label className={filterChip(filterEventTypeTaskSchedule)}>
                <input
                    type="checkbox"
                    className="h-3 w-3 rounded-sm border-zinc-300 text-indigo-600"
                    checked={filterEventTypeTaskSchedule}
                    onChange={(e) => setFilterEventTypeTaskSchedule(e.target.checked)}
                />
                Task schedule
            </label>
        </div>
    );

    const renderButtons = () => (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap items-center gap-1">
                <button
                    type="button"
                    className={`${viewBtn(currentView === 'dayGridMonth')} rounded-r-none border-r-0`}
                    onClick={() => {
                        calendarRef.current?.getApi().changeView('dayGridMonth');
                        setCurrentView('dayGridMonth');
                    }}
                >
                    Month
                </button>
                <button
                    type="button"
                    className={`${viewBtn(currentView === 'dayGridWeek')} rounded-none border-x-0`}
                    onClick={() => {
                        calendarRef.current?.getApi().changeView('dayGridWeek');
                        setCurrentView('dayGridWeek');
                    }}
                >
                    Week
                </button>
                <button
                    type="button"
                    className={`${viewBtn(currentView === 'dayGridDay')} rounded-l-none border-l-0`}
                    onClick={() => {
                        calendarRef.current?.getApi().changeView('dayGridDay');
                        setCurrentView('dayGridDay');
                    }}
                >
                    Day
                </button>
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-sm border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                    onClick={() => calendarRef.current?.getApi().prev()}
                >
                    <LucideChevronLeft className="h-4 w-4" strokeWidth={2} />
                    Prev
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-sm border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                    onClick={() => calendarRef.current?.getApi().next()}
                >
                    Next
                    <LucideChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                    type="button"
                    className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                    onClick={() => calendarRef.current?.getApi().today()}
                >
                    Today
                </button>
            </div>
        </div>
    );

    const renderRightList = () => {
        const taskCount = events.filter((e) => e.extendedProps?.fromCollection === 'tasks').length;
        const lifeEventCount = events.filter((e) => e.extendedProps?.fromCollection === 'lifeEvents').length;
        const staticDateCount = events.filter(
            (e) => e.extendedProps?.fromCollection === 'infoVaultSignificantDate'
        ).length;
        const significantDateCount = events.filter(
            (e) => e.extendedProps?.fromCollection === 'infoVaultSignificantDateRepeat'
        ).length;
        const taskScheduleCount = events.filter((e) => e.extendedProps?.fromCollection === 'taskSchedules').length;

        const chip =
            'mr-1.5 mb-1 inline-flex items-center gap-0.5 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium';

        return (
            <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm md:p-2.5">
                <h2 className="text-sm font-semibold text-zinc-900">In view</h2>

                {events.length === 0 && <p className="mt-2 text-xs text-zinc-500">No events in this range.</p>}

                {events.length > 0 && (
                    <div className="mt-2 flex flex-wrap">
                        <span className={`${chip} border-zinc-200 bg-zinc-50 text-zinc-800`}>
                            All {events.length}
                        </span>
                        {taskCount > 0 && (
                            <span className={`${chip} border-indigo-200 bg-indigo-50 text-indigo-900`}>
                                Tasks {taskCount}
                            </span>
                        )}
                        {lifeEventCount > 0 && (
                            <span className={`${chip} border-violet-200 bg-violet-50 text-violet-900`}>
                                Events {lifeEventCount}
                            </span>
                        )}
                        {staticDateCount > 0 && (
                            <span className={`${chip} border-sky-200 bg-sky-50 text-sky-900`}>
                                Dates {staticDateCount}
                            </span>
                        )}
                        {significantDateCount > 0 && (
                            <span className={`${chip} border-emerald-200 bg-emerald-50 text-emerald-900`}>
                                Repeating {significantDateCount}
                            </span>
                        )}
                        {taskScheduleCount > 0 && (
                            <span className={`${chip} border-amber-200 bg-amber-50 text-amber-900`}>
                                Schedules {taskScheduleCount}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-2 max-h-[60vh] space-y-1.5 overflow-y-auto">
                    {events.map((event) => {
                        const key = `${event.extendedProps?.recordId ?? 'x'}-${event.start.getTime()}-${event.title}`;
                        return (
                            <div
                                key={key}
                                className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-1.5"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-sm">
                                    {event.extendedProps?.fromCollection === 'tasks' && '📝'}
                                    {event.extendedProps?.fromCollection === 'lifeEvents' && '🎉'}
                                    {event.extendedProps?.fromCollection === 'infoVaultSignificantDate' && '📌'}
                                    {event.extendedProps?.fromCollection === 'infoVaultSignificantDateRepeat' && '⭐'}
                                    {event.extendedProps?.fromCollection === 'taskSchedules' && '⏰'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-zinc-900">
                                        {event.extendedProps?.moreInfoLink ? (
                                            <Link
                                                to={event.extendedProps.moreInfoLink}
                                                className="inline-flex items-center gap-1 hover:text-indigo-700 hover:underline"
                                            >
                                                {event.title}
                                                <LucideLink className="h-3 w-3 shrink-0 text-zinc-400" strokeWidth={2} />
                                            </Link>
                                        ) : (
                                            event.title
                                        )}
                                    </div>
                                    <div className="text-[10px] text-zinc-500">
                                        {event.start instanceof Date
                                            ? event.start.toLocaleDateString(undefined, {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex w-full bg-[#f4f4f5]">
            <div className="min-w-0 w-[calc(100vw-50px)]">
                <div id="messagesScrollUp" />
                <div className="min-h-[calc(100vh-60px)] px-2 py-2 md:px-3">
                    {renderSearchBox()}
                    {renderFilters()}
                    {renderButtons()}

                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="w-full min-w-0 lg:w-3/4">
                            <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm md:p-3">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin]}
                                    initialView="dayGridMonth"
                                    weekends={true}
                                    events={events}
                                    eventContent={renderEventContent}
                                    datesSet={(arg) => {
                                        const d = arg.view.calendar.getDate();
                                        setStartDate(d.toISOString());
                                        setEndDate(arg.end.toISOString());
                                    }}
                                    height="auto"
                                    contentHeight="auto"
                                    expandRows={true}
                                />
                            </div>
                        </div>
                        <div className="w-full shrink-0 lg:w-1/4">{renderRightList()}</div>
                    </div>
                </div>
                <div id="messagesScrollDown" />
            </div>

            <div className="flex w-[50px] shrink-0 flex-col items-stretch border-l border-zinc-800 bg-zinc-900 py-1">
                <Link
                    to="/user/setting"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Settings"
                >
                    <LucideSettings className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll up"
                    onClick={() =>
                        document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' })
                    }
                >
                    <LucideMoveUp className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll down"
                    onClick={() =>
                        document.getElementById('messagesScrollDown')?.scrollIntoView({ behavior: 'smooth' })
                    }
                >
                    <LucideMoveDown className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Refresh events"
                    onClick={() => {
                        toast.success('Refreshing…');
                        void fetchEvents();
                    }}
                >
                    <LucideRefreshCcw className="h-4 w-4" strokeWidth={1.75} />
                </button>
            </div>
        </div>
    );
};

function renderEventContent(eventInfo: {
    timeText: string;
    event: {
        title: string;
        extendedProps: {
            recordId: string;
            fromCollection:
                | 'tasks'
                | 'lifeEvents'
                | 'taskSchedules'
                | 'infoVaultSignificantDate'
                | 'infoVaultSignificantDateRepeat';
            moreInfoLink: string;
        };
    };
}) {
    return (
        <div className="p-0.5">
            <b className="text-[10px] text-zinc-600">{eventInfo.timeText}</b>
            <i className={`block text-[11px] font-medium text-zinc-900 ${calendarScss.calendarTitleLink}`} title={eventInfo.event.title}>
                {eventInfo.event.title}
            </i>
            <Link
                to={eventInfo.event.extendedProps.moreInfoLink || '#'}
                className="mt-0.5 flex items-center justify-center gap-0.5 rounded-sm border border-zinc-200 bg-zinc-50 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-zinc-100"
            >
                <LucideLink className="h-3 w-3" strokeWidth={2} />
                View
            </Link>
        </div>
    );
}

export default CalendarWrapper;
