import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { useRef, useState, useEffect } from 'react';
import { LucideLink, LucidePlus } from 'lucide-react';
import axiosCustom from '../../../../config/axiosCustom';
import { Link } from 'react-router-dom';

import calendarScss from './scss/calendarWrapper.module.scss';

interface Event {
    title: string;
    start: Date;
    end?: Date;
    allDay: true,
    extendedProps?: {
        recordId: string;
        fromCollection: 'tasks' | 'lifeEvents' | 'infoVaultSignificantDate' | 'infoVaultSignificantDateRepeat';
        moreInfoLink: string;
    };
}

interface tsCalenderApiRes {
    _id: string;
    fromCollection: 'tasks' | 'lifeEvents' | 'infoVaultSignificantDate' | 'infoVaultSignificantDateRepeat';
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
}

const CalendarWrapper = () => {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [currentView, setCurrentView] = useState<string>('dayGridMonth');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [events, setEvents] = useState<Event[]>([]);
    
    const [filterEventTypeTasks, setFilterEventTypeTasks] = useState<boolean>(true);
    const [filterEventTypeLifeEvents, setFilterEventTypeLifeEvents] = useState<boolean>(true);
    const [filterEventTypeInfoVault, setFilterEventTypeInfoVault] = useState<boolean>(true);
    const [filterEventTypeDiary, setFilterEventTypeDiary] = useState<boolean>(true);

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

                // filter -> event type filters
                filterEventTypeTasks,
                filterEventTypeLifeEvents,
                filterEventTypeInfoVault,
                filterEventTypeDiary,
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
                    } else if (doc.fromCollection === 'infoVaultSignificantDateRepeat' && doc.infoVaultSignificantDateRepeat) {
                        let shouldInsert = true;

                        // should not insert if the recordId is already in the tempArr
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
                                start: new Date(doc.infoVaultSignificantDateRepeat.normalizedDate || doc.infoVaultSignificantDateRepeat.date),
                                allDay: true,
                                extendedProps: {
                                    recordId: doc.infoVaultSignificantDateRepeat._id,
                                    fromCollection: 'infoVaultSignificantDateRepeat',
                                    moreInfoLink: `/user/info-vault?action=edit&id=${doc.infoVaultSignificantDateRepeat.infoVaultId}`,
                                },
                            });
                        }
                    }
                }
            }
            console.log('tempArr: ', tempArr);

            let tempArrSorted = tempArr.sort((a, b) => {
                return a.start.getTime() - b.start.getTime();
            });

            setEvents(tempArrSorted);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchEvents();
    }, [
        startDate,
        endDate,
        currentView,

        // event type filters
        filterEventTypeTasks,
        filterEventTypeLifeEvents,
        filterEventTypeInfoVault,
        filterEventTypeDiary,
    ]);

    const renderSearchBox = () => {
        return (
            <div
                className="
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    rounded-xl px-6 py-4 my-6 shadow-lg
                    gap-4
                    calendar-header-responsive
                "
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Calendar Icon */}
                    <span
                        className="text-3xl text-white min-w-[2rem]"
                        role="img"
                        aria-label="calendar"
                    >
                        📅
                    </span>
                    <span
                        className="text-white font-semibold text-lg tracking-wide truncate"
                    >
                        View your Tasks, Events & Important Dates
                    </span>
                </div>

                <div
                    className="text-white text-sm pt-2"
                >
                    {new Date(startDate).toString()}
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-0 pt-3">
                    {/* Add Event Button */}
                    <Link
                        to="/user/life-events"
                        className="
                            bg-white text-indigo-500 border-none rounded-md
                            px-4 py-2 font-semibold text-base cursor-pointer
                            shadow-md transition hover:bg-indigo-50
                            whitespace-nowrap mb-1 flex-shrink-0
                        "
                    >
                        <span role="img" aria-label="add" className="mr-1">
                            <LucidePlus
                                className='inline-block'
                                size={18}
                                style={{
                                    marginTop: '-3px',
                                }}
                            />
                        </span>
                        Add Event
                    </Link>
                </div>
            </div>
        )
    }

    const renderFilters = () => {
        return (
            <div className="pb-3">
                <label 
                    className="inline-block text-white text-xs cursor-pointer mr-2 hover:opacity-80 transition-opacity bg-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm select-none"
                    onChange={() => setFilterEventTypeTasks((prev) => !prev)}
                >
                    <input
                        type="checkbox"
                        className="w-3 h-3 cursor-pointer align-middle mr-1"
                        checked={filterEventTypeTasks}
                    />
                    <span className="align-middle">Tasks</span>
                </label>
                <label 
                    className="inline-block text-white text-xs cursor-pointer mr-2 hover:opacity-80 transition-opacity bg-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm select-none"
                    onChange={() => setFilterEventTypeLifeEvents((prev) => !prev)}
                >
                    <input
                        type="checkbox"
                        className="w-3 h-3 cursor-pointer align-middle mr-1"
                        checked={filterEventTypeLifeEvents}
                    />
                    <span className="align-middle">Life Events</span>
                </label>
                <label 
                    className="inline-block text-white text-xs cursor-pointer mr-2 hover:opacity-80 transition-opacity bg-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm select-none"
                    onChange={() => setFilterEventTypeInfoVault((prev) => !prev)}
                >
                    <input
                        type="checkbox"
                        className="w-3 h-3 cursor-pointer align-middle mr-1"
                        checked={filterEventTypeInfoVault}
                    />
                    <span className="align-middle">Info Vault</span>
                </label>
                <label 
                    className="inline-block text-white text-xs cursor-pointer hover:opacity-80 transition-opacity bg-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm select-none"
                    onChange={() => setFilterEventTypeDiary((prev) => !prev)}
                >
                    <input
                        type="checkbox"
                        className="w-3 h-3 cursor-pointer align-middle mr-1"
                        checked={filterEventTypeDiary}
                    />
                    <span className="align-middle">Diary</span>
                </label>
            </div>
        )
    }

    const renderButtons = () => {
        return (
            <div>
                <div>
                    <div>
                        <button
                            style={{
                                background: currentView === 'dayGridMonth' ? '#fff' : 'rgba(255,255,255,0.25)',
                                color: currentView === 'dayGridMonth' ? '#764ba2' : '#fff',
                                border: 'none',
                                borderRadius: '6px 0 0 6px',
                                padding: '8px 18px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: currentView === 'dayGridMonth' ? '0 2px 8px rgba(102, 126, 234, 0.10)' : 'none',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => {
                                calendarRef.current?.getApi().changeView('dayGridMonth');
                                setCurrentView && setCurrentView('dayGridMonth');
                            }}
                        >
                            <span role="img" aria-label="month" style={{ marginRight: 6 }}>🗓️</span>
                            Month
                        </button>
                        <button
                            style={{
                                background: currentView === 'dayGridWeek' ? '#fff' : 'rgba(255,255,255,0.25)',
                                color: currentView === 'dayGridWeek' ? '#764ba2' : '#fff',
                                border: 'none',
                                borderRadius: 0,
                                padding: '8px 18px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: currentView === 'dayGridWeek' ? '0 2px 8px rgba(102, 126, 234, 0.10)' : 'none',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => {
                                calendarRef.current?.getApi().changeView('dayGridWeek');
                                setCurrentView && setCurrentView('dayGridWeek');
                            }}
                        >
                            <span role="img" aria-label="week" style={{ marginRight: 6 }}>📆</span>
                            Week
                        </button>
                        <button
                            style={{
                                background: currentView === 'dayGridDay' ? '#fff' : 'rgba(255,255,255,0.25)',
                                color: currentView === 'dayGridDay' ? '#764ba2' : '#fff',
                                border: 'none',
                                borderRadius: '0 6px 6px 0',
                                padding: '8px 18px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: currentView === 'dayGridDay' ? '0 2px 8px rgba(102, 126, 234, 0.10)' : 'none',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => {
                                calendarRef.current?.getApi().changeView('dayGridDay');
                                setCurrentView && setCurrentView('dayGridDay');
                            }}
                        >
                            <span role="img" aria-label="day" style={{ marginRight: 6 }}>📅</span>
                            Day
                        </button>

                        <button
                            style={{
                                background: 'rgba(255,255,255,0.25)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px 0 0 6px',
                                padding: '8px 14px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginLeft: 4,
                                transition: 'background 0.2s'
                            }}
                            onClick={() => {
                                calendarRef.current?.getApi().prev();
                            }}
                        >
                            <span role="img" aria-label="previous" style={{ marginRight: 6 }}>⬅️</span>
                            Prev
                        </button>

                        <button
                            style={{
                                background: 'rgba(255,255,255,0.25)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0 6px 6px 0',
                                padding: '8px 14px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                marginRight: 4,
                                transition: 'background 0.2s'
                            }}
                            onClick={() => {
                                calendarRef.current?.getApi().next();
                            }}
                        >
                            <span role="img" aria-label="next" style={{ marginRight: 6 }}>➡️</span>
                            Next
                        </button>
                        <button
                            style={{
                                background: currentView === 'today' ? '#fff' : 'rgba(255,255,255,0.25)',
                                color: currentView === 'today' ? '#764ba2' : '#fff',
                                border: 'none',
                                borderRadius: 0,
                                padding: '8px 18px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: currentView === 'today' ? '0 2px 8px rgba(102, 126, 234, 0.10)' : 'none',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => {
                                calendarRef.current?.getApi().today();
                                // Optionally, you can keep the currentView unchanged, or set it to the current view
                                // setCurrentView && setCurrentView(currentView);
                            }}
                        >
                            <span role="img" aria-label="today" style={{ marginRight: 6 }}>📍</span>
                            Today
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const renderRightList = () => {
        return (
            <div className='bg-white rounded-lg my-2 p-1 md:p-2'>
                {/* heading */}
                <h1 className='text-lg font-semibold text-gray-800'>Events</h1>

                {/* no events */}
                <div className='mt-2'>
                    {events.length === 0 && (
                        <div className='text-sm text-gray-500'>No events found</div>
                    )}
                </div>

                {/* count */}
                <div className='mt-2'>
                    {(() => {
                        // Count all types
                        const taskCount = events.filter(event => event.extendedProps?.fromCollection === 'tasks').length;
                        const lifeEventCount = events.filter(event => event.extendedProps?.fromCollection === 'lifeEvents').length;
                        const staticDateCount = events.filter(event => event.extendedProps?.fromCollection === 'infoVaultSignificantDate').length;
                        const significantDateCount = events.filter(event => event.extendedProps?.fromCollection === 'infoVaultSignificantDateRepeat').length;
                        return (
                            <div className="mb-2">
                                {events.length > 0 && (
                                    <div className="inline-block align-middle mr-4 mb-1 items-center gap-1 text-gray-600 font-medium bg-gray-50 rounded px-2 py-1">
                                        📅 <span>All:</span> <span>{events.length}</span>
                                    </div>
                                )}
                                {taskCount > 0 && (
                                    <div className="inline-block align-middle mr-4 mb-1 items-center gap-1 text-indigo-600 font-medium bg-indigo-50 rounded px-2 py-1">
                                        📝 <span>Tasks:</span> <span>{taskCount}</span>
                                    </div>
                                )}
                                {lifeEventCount > 0 && (
                                    <div className="inline-block align-middle mr-4 mb-1 items-center gap-1 text-purple-600 font-medium bg-purple-50 rounded px-2 py-1">
                                        🎉 <span>Life Events:</span> <span>{lifeEventCount}</span>
                                    </div>
                                )}
                                {staticDateCount > 0 && (
                                    <div className="inline-block align-middle mr-4 mb-1 items-center gap-1 text-blue-600 font-medium bg-blue-50 rounded px-2 py-1">
                                        📌 <span>Significant Dates:</span> <span>{staticDateCount}</span>
                                    </div>
                                )}
                                {significantDateCount > 0 && (
                                    <div className="inline-block align-middle mb-1 items-center gap-1 text-green-600 font-medium bg-green-50 rounded px-2 py-1">
                                        ⭐ <span>Significant Dates (Repeated):</span> <span>{significantDateCount}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* events */}
                {events.map((event) => (
                    <div
                        key={event.title}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-1 mb-2 flex items-center gap-2 hover:scale-[1.025] transition-transform duration-200"
                    >
                        <div className="flex-shrink-0 w-7 h-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg text-white shadow">
                            {event.extendedProps?.fromCollection === 'tasks' && '📝'}
                            {event.extendedProps?.fromCollection === 'lifeEvents' && '🎉'}
                            {event.extendedProps?.fromCollection === 'infoVaultSignificantDate' && '📌'}
                            {event.extendedProps?.fromCollection === 'infoVaultSignificantDateRepeat' && '⭐'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">
                                {event.extendedProps?.moreInfoLink ? (
                                    <Link
                                        to={event.extendedProps.moreInfoLink}
                                        className="hover:underline flex items-center gap-1"
                                    >
                                        {event.title}
                                        <LucideLink className="w-3 h-3 text-white opacity-80" />
                                    </Link>
                                ) : (
                                    event.title
                                )}
                            </div>
                            <div className="text-xs text-white text-opacity-80 mt-0.5">
                                {event.start instanceof Date
                                    ? event.start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                    : ''}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div
            className='container m-auto py-5 px-1'
            style={{
                maxWidth: '1280px',
            }}
        >
            {/* heading */}


            {/* search box */}
            {renderSearchBox()}

            {/* filters */}
            {renderFilters()}

            {/* buttons */}
            {renderButtons()}

            {/* Calendar */}
            <div className='flex flex-col lg:flex-row gap-4'>
                {/* left */}
                <div className='w-full lg:w-3/4'>
                    <div className='bg-white rounded-lg md:p-4 my-2'>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[
                                dayGridPlugin
                            ]}
                            initialView='dayGridMonth'
                            weekends={true}
                            events={events}
                            eventContent={renderEventContent}
                            datesSet={(arg) => {
                                const d = arg.view.calendar.getDate(); // current anchor date of the view
                                console.log('datesSet: ', d);
                                setStartDate(d.toISOString());
                                setEndDate(arg.end.toISOString());
                            }}

                            // height
                            height="auto"
                            contentHeight="auto"
                            expandRows={true}
                        />
                    </div>
                </div>

                {/* right */}
                <div className='w-full lg:w-1/4'>
                    <div className='bg-white rounded-lg'>
                        {renderRightList()}
                    </div>
                </div>
            </div>
        </div>
    )
}

function renderEventContent(eventInfo: {
    timeText: string;
    event: {
        title: string;
        extendedProps: {
            recordId: string;
            fromCollection: 'tasks' | 'lifeEvents';
            moreInfoLink: string;
        };
    };
}) {
    return (
        <div className='p-1'>
            <b>{eventInfo.timeText}</b>
            <i
                onClick={() => {
                    console.log('eventInfo: ', eventInfo);
                }}
                className={`text-xs ${calendarScss.calendarTitleLink}`}
                title={eventInfo.event.title}
            >{eventInfo.event.title}</i>
            <div className='text-xs text-gray-500'>
                <Link
                    to={eventInfo.event.extendedProps.moreInfoLink || ''}
                    className='p-1 text-center block bg-white rounded-md flex flex-col lg:flex-row items-center justify-center'
                >
                    <LucideLink
                        size={12}
                        style={{
                            marginTop: '-3px',
                        }}
                        className='inline-block mr-1'
                    /> View
                </Link>
            </div>
        </div>
    )
}

export default CalendarWrapper;