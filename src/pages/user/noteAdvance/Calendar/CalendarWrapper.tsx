import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { useRef, useState, useEffect } from 'react';
import { LucideLink, LucidePlus } from 'lucide-react';
import axiosCustom from '../../../../config/axiosCustom';

interface Event {
    title: string;
    start: Date;
    end?: Date;
    extendedProps?: {
        recordId: string;
        fromCollection: 'tasks' | 'lifeEvents';
        moreInfoLink: string;
    };
}

interface tsCalenderApiRes {
    _id: string;
    fromCollection: 'tasks' | 'lifeEvents';
    taskInfo: {
        _id: string;
        title: string;
        dueDate: Date;
    };
    lifeEventInfo: {
        _id: string;
        title: string;
        eventDateUtc: Date;
    };
}

const CalendarWrapper = () => {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [currentView, setCurrentView] = useState<string>('dayGridMonth');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [events, setEvents] = useState<Event[]>([]);

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
            });

            let resDocs = result.data.docs as tsCalenderApiRes[];

            let tempArr = [] as Event[];
            if (Array.isArray(resDocs)) {
                for (const doc of resDocs) {
                    if (doc.fromCollection === 'tasks') {
                        tempArr.push({
                            title: doc.taskInfo.title,
                            start: new Date(doc.taskInfo.dueDate),
                            extendedProps: {
                                recordId: doc.taskInfo._id,
                                fromCollection: 'tasks',
                                moreInfoLink: `/user/task/?edit-task-id=${doc.taskInfo._id}`,
                            },
                        });
                    } else if (doc.fromCollection === 'lifeEvents') {
                        tempArr.push({
                            title: doc.lifeEventInfo.title,
                            start: new Date(doc.lifeEventInfo.eventDateUtc),
                            extendedProps: {
                                recordId: doc.lifeEventInfo._id,
                                fromCollection: 'lifeEvents',
                                moreInfoLink: `/user/life-events?action=edit&id=${doc.lifeEventInfo._id}`,
                            },
                        });
                    }
                }
            }
            console.log('tempArr: ', tempArr);
            setEvents(tempArr);
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
                        View your Tasks, Notes & Events
                    </span>
                </div>

                <div
                    className="text-white text-sm pt-2"
                >
                    {new Date(startDate).toString()}
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-0 pt-3">
                    {/* Search Box */}
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="
                            px-3 py-2 rounded-md border-none outline-none
                            text-base bg-gray-100 text-gray-800
                            min-w-[120px] w-full max-w-[200px]
                            shadow-sm mb-1 flex-1
                            focus:ring-2 focus:ring-indigo-300
                        "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* Add Event Button */}
                    <button
                        className="
                            bg-white text-indigo-500 border-none rounded-md
                            px-4 py-2 font-semibold text-base cursor-pointer
                            shadow-md transition hover:bg-indigo-50
                            whitespace-nowrap mb-1 flex-shrink-0
                        "
                        onClick={() => alert('Add Event feature coming soon!')}
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
                    </button>
                </div>
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
                        // Count tasks and lifeEvents
                        const taskCount = events.filter(event => event.extendedProps?.fromCollection === 'tasks').length;
                        const lifeEventCount = events.filter(event => event.extendedProps?.fromCollection === 'lifeEvents').length;
                        return (
                            <div className="mb-2">
                                {(taskCount > 0 || lifeEventCount > 0) && (
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
                                    <div className="inline-block align-middle mb-1 items-center gap-1 text-purple-600 font-medium bg-purple-50 rounded px-2 py-1">
                                        🎉 <span>Life Events:</span> <span>{lifeEventCount}</span>
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
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">
                                {event.extendedProps?.moreInfoLink ? (
                                    <a
                                        href={event.extendedProps.moreInfoLink}
                                        className="hover:underline flex items-center gap-1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {event.title}
                                        <LucideLink className="w-3 h-3 text-white opacity-80" />
                                    </a>
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
        <>
            <b>{eventInfo.timeText}</b>
            <div className='text-xs text-gray-500 ml-1'>
                <a
                    href={eventInfo.event.extendedProps.moreInfoLink || ''}
                    className='px-2'
                >
                    <LucideLink
                        size={12}
                        style={{
                            marginTop: '-3px',
                        }}
                        className='inline-block'
                    />
                </a>
            </div>
            <i
                onClick={() => {
                    console.log('eventInfo: ', eventInfo);
                }}
                className='pl-1'
            >{eventInfo.event.title}</i>
        </>
    )
}

export default CalendarWrapper;