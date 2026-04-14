import { useState, useEffect, Fragment } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideArrowLeft, LucidePlus, LucideSave, LucideTrash } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllTimezones } from 'countries-and-timezones';

import { ITaskSchedule, ITaskScheduleTaskAdd, ISendMyselfEmailForm } from '../../../../../../types/pages/tsTaskSchedule.ts';
import ComponentScheduleTaskAdd from './scheduleTaskAdd/ComponentScheduleTaskAdd.tsx';
import ComponentScheduleSendMyselfEmail from './scheduleSendMyselfEmail/ComponentScheduleSendMyselfEmail.tsx';
import ComponentComputedReminderDates from './ComponentComputedReminderDates.tsx';
import getDateTimeForInputTypeDateTimeLocal from '../../../../../../utils/getDateTimeForInputTypeDateTimeLocal.ts';
import { REMINDER_LABEL_TO_MS } from '../../../../../../constants/reminderLabelToMsArr.ts';

const timeZoneArr = getAllTimezones();

const DUE_DATE_PRESET_OPTIONS = REMINDER_LABEL_TO_MS;

/** ISO UTC string → user’s local date/time (e.g. 04/14/2026, 5:27:00 PM) */
const formatScheduleTimeLocalDisplay = (isoUtc: string): string => {
    const d = new Date(isoUtc);
    if (Number.isNaN(d.getTime())) {
        return isoUtc;
    }
    return d.toLocaleString();
};

const ScheduleTimeArr = ({
    scheduleTimeArr,
    setScheduleTimeArr,
}: {
    scheduleTimeArr: string[];
    setScheduleTimeArr: React.Dispatch<React.SetStateAction<string[]>>;
}) => {

    const [
        scheduleTimeInput,
        setScheduleTimeInput,
    ] = useState('');


    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800 sm:mb-3">Schedule Times</label>

            {/* Display existing schedule times */}
            <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
                {scheduleTimeArr.map((scheduleTime, idx) => (
                    <span key={idx} className="inline-flex max-w-full items-center gap-0.5 rounded-lg border border-indigo-200/70 bg-indigo-50/90 px-2 py-0.5 text-xs font-medium text-indigo-950 shadow-sm sm:px-2.5 sm:py-1">
                        <span className="min-w-0 truncate">{formatScheduleTimeLocalDisplay(scheduleTime)}</span>
                        <button
                            type="button"
                            className="ml-0.5 shrink-0 rounded px-1 text-base leading-none text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400/40 sm:ml-1"
                            onClick={() => {
                                setScheduleTimeArr(scheduleTimeArr.filter((_, i) => i !== idx));
                            }}
                            aria-label={`Remove schedule time ${formatScheduleTimeLocalDisplay(scheduleTime)}`}
                        >
                            X
                        </button>
                    </span>
                ))}
            </div>

            {/* Date, Time, Timezone selector */}
            <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-3 sm:space-y-4 sm:p-4">
                {/* Date and Time */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 sm:mb-2">Date & Time</label>
                    <input
                        type='datetime-local'
                        value={scheduleTimeInput || ''}
                        className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        onChange={e => setScheduleTimeInput(e.target.value)}
                    />
                </div>

                {/* Add Schedule Button */}
                <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:py-2.5"
                    onClick={() => {
                        if (scheduleTimeInput && scheduleTimeInput.trim() !== '') {
                            // datetime-local is interpreted as local wall time; store UTC ISO on the server
                            const newScheduleTime = new Date(scheduleTimeInput);

                            if (!isNaN(newScheduleTime.getTime())) {
                                const utcTime = newScheduleTime.toISOString();
                                setScheduleTimeArr([...scheduleTimeArr, utcTime]);
                                setScheduleTimeInput('');
                                toast.success('Schedule time added successfully!');
                            }
                        } else {
                            toast.error('Please select date and time');
                        }
                    }}
                    aria-label="Add schedule time"
                >
                    <LucidePlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                    Schedule Time
                </button>
            </div>
        </div>
    )
}

const CronExpressionArr = ({
    cronExpressionArr,
    setCronExpressionArr,
}: {
    cronExpressionArr: string[];
    setCronExpressionArr: React.Dispatch<React.SetStateAction<string[]>>;
}) => {

    const [
        cronExpressionInput,
        setCronExpressionInput,
    ] = useState('');

    const [
        showCronBuilder,
        setShowCronBuilder,
    ] = useState<boolean>(false);

    // Cron Builder State
    const [cronBuilder, setCronBuilder] = useState({
        type: 'daily', // hour, daily, weekly, monthly
        hourInterval: 1,
        dailyTime: '09:00',
        weeklyTime: '09:00',
        weeklyType: 'all', // 'all' or 'specific'
        specificWeekdays: [] as number[], // Array of weekday numbers (0-6)
        monthlyDay: 1,
        monthlyTime: '09:00',
        monthlyType: 'all', // 'all' or 'specific'
        specificMonths: [] as number[] // Array of month numbers (1-12)
    });

    // Generate cron expression from builder state
    const generateCronExpression = () => {
        const { type, hourInterval, dailyTime, weeklyTime, weeklyType, specificWeekdays, monthlyDay, monthlyTime, monthlyType, specificMonths } = cronBuilder;

        switch (type) {
            case 'hour':
                return `0 */${hourInterval} * * *`;

            case 'daily':
                const [dailyHour, dailyMin] = dailyTime.split(':');
                return `${parseInt(dailyMin)} ${parseInt(dailyHour)} * * *`;

            case 'weekly':
                const [weeklyHour, weeklyMin] = weeklyTime.split(':');
                // If no specific weekdays selected or weeklyType is 'all', use '*' for all days
                const weekdaysStr = (weeklyType === 'all' || specificWeekdays.length === 0) ? '*' : specificWeekdays.join(',');
                return `${parseInt(weeklyMin)} ${parseInt(weeklyHour)} * * ${weekdaysStr}`;

            case 'monthly':
                const [monthlyHour, monthlyMin] = monthlyTime.split(':');
                // If no specific months selected or monthlyType is 'all', use '*' for all months
                const monthsStr = (monthlyType === 'all' || specificMonths.length === 0) ? '*' : specificMonths.join(',');
                return `${parseInt(monthlyMin)} ${parseInt(monthlyHour)} ${monthlyDay} ${monthsStr} *`;

            default:
                return '0 9 * * *';
        }
    };

    // Get cron description
    const getCronDescription = () => {
        const { type, hourInterval, dailyTime, weeklyTime, weeklyType, specificWeekdays, monthlyDay, monthlyTime, monthlyType, specificMonths } = cronBuilder;
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        switch (type) {
            case 'hour':
                return `Every ${hourInterval} hour${hourInterval > 1 ? 's' : ''}`;

            case 'daily':
                return `Daily at ${dailyTime}`;

            case 'weekly':
                // If no specific weekdays selected or weeklyType is 'all', default to all days
                const weekdaysDesc = (weeklyType === 'all' || specificWeekdays.length === 0)
                    ? 'every day' 
                    : `on ${specificWeekdays.map(d => dayNames[d]).join(', ')}`;
                return `Weekly ${weekdaysDesc} at ${weeklyTime}`;

            case 'monthly':
                // If no specific months selected or monthlyType is 'all', default to all months
                const monthsDesc = (monthlyType === 'all' || specificMonths.length === 0)
                    ? 'every month' 
                    : `in ${specificMonths.map(m => monthNames[m - 1]).join(', ')}`;
                return `On day ${monthlyDay} at ${monthlyTime} ${monthsDesc}`;

            default:
                return 'Custom expression';
        }
    };

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800 sm:mb-3">Cron Expressions</label>

            {/* Display existing cron expressions */}
            <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
                {cronExpressionArr.map((cronExpr, idx) => (
                    <span key={idx} className="inline-flex max-w-full items-center gap-0.5 rounded-lg border border-zinc-200/80 bg-white px-2 py-0.5 font-mono text-xs font-medium text-zinc-800 shadow-sm sm:px-2.5 sm:py-1">
                        <span className="min-w-0 break-all">{cronExpr}</span>
                        <button
                            type="button"
                            className="ml-0.5 shrink-0 rounded px-1 text-base leading-none text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400/40 sm:ml-1"
                            onClick={() => {
                                setCronExpressionArr(cronExpressionArr.filter((_, i) => i !== idx));
                            }}
                            aria-label={`Remove cron expression ${cronExpr}`}
                        >
                            X
                        </button>
                    </span>
                ))}
            </div>

            {/* Cron expression input with builder */}
            <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-3 sm:space-y-4 sm:p-4">
                {/* Manual Cron Expression Input */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 sm:mb-2">Manual Cron Expression</label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                        <input
                            type="text"
                            value={cronExpressionInput || ''}
                            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            onChange={e => setCronExpressionInput(e.target.value)}
                            placeholder="Enter cron expression (e.g., 0 9 * * 1-5)"
                        />
                        <button
                            type="button"
                            className="w-full shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-auto"
                            onClick={() => {
                                if (cronExpressionInput && cronExpressionInput.trim() !== '') {
                                    const newCronExpr = cronExpressionInput.trim();
                                    if (!cronExpressionArr.includes(newCronExpr)) {
                                        setCronExpressionArr([...cronExpressionArr, newCronExpr]);
                                        setCronExpressionInput('');
                                        toast.success('Cron expression added successfully!');
                                    } else {
                                        toast.error('This cron expression already exists');
                                        setCronExpressionInput('');
                                    }
                                } else {
                                    toast.error('Please enter a cron expression');
                                }
                            }}
                        >
                            Add
                        </button>
                    </div>
                    <div className="mt-1 text-[11px] leading-snug text-zinc-500 sm:text-xs">
                        Examples: "0 9 * * 1-5" (weekdays at 9am), "0 0 * * 0" (Sundays at midnight)
                    </div>
                </div>

                {/* OR Divider */}
                <div className="flex items-center">
                    <div className="flex-1 border-t border-zinc-200/80"></div>
                    <div className="bg-zinc-50/90 px-2 text-xs text-zinc-500 sm:px-3 sm:text-sm">OR</div>
                    <div className="flex-1 border-t border-zinc-200/80"></div>
                </div>

                {/* Cron Builder Toggle */}
                <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-inset ring-zinc-200/80 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    onClick={() => setShowCronBuilder(!showCronBuilder)}
                >
                    <LucidePlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {showCronBuilder ? 'Hide' : 'Use'} Dynamic Cron Builder
                </button>

                {/* Dynamic Cron Builder */}
                {showCronBuilder && (
                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3 sm:p-4">
                        <h4 className="mb-3 text-sm font-semibold text-zinc-900 sm:mb-4 sm:text-base">Dynamic Cron Expression Builder</h4>

                        {/* Type Selector */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 sm:mb-2">Schedule Type</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {['hour', 'daily', 'weekly', 'monthly'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setCronBuilder({ ...cronBuilder, type })}
                                        className={`rounded-lg border px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${cronBuilder.type === type
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Options Based on Type */}
                        <div className="mb-4">
                            {cronBuilder.type === 'hour' && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Every N Hours</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="23"
                                            value={cronBuilder.hourInterval}
                                            onChange={(e) => setCronBuilder({ ...cronBuilder, hourInterval: parseInt(e.target.value) || 1 })}
                                            className="w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:px-3 sm:py-2"
                                        />
                                        <span className="text-sm text-zinc-600">hour(s)</span>
                                    </div>
                                </div>
                            )}

                            {cronBuilder.type === 'daily' && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={cronBuilder.dailyTime}
                                        onChange={(e) => setCronBuilder({ ...cronBuilder, dailyTime: e.target.value })}
                                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:px-3 sm:py-2"
                                    />
                                </div>
                            )}

                            {cronBuilder.type === 'weekly' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={cronBuilder.weeklyTime}
                                            onChange={(e) => setCronBuilder({ ...cronBuilder, weeklyTime: e.target.value })}
                                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:px-3 sm:py-2"
                                        />
                                    </div>
                                    
                                    {/* Weekday Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Days of Week</label>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, weeklyType: 'all', specificWeekdays: [] })}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${cronBuilder.weeklyType === 'all'
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                        }`}
                                                >
                                                    All Days
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, weeklyType: 'specific' })}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${cronBuilder.weeklyType === 'specific'
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                        }`}
                                                >
                                                    Specific Days
                                                </button>
                                            </div>
                                            
                                            {cronBuilder.weeklyType === 'specific' && (
                                                <div>
                                                    <div className="mt-2 grid grid-cols-4 gap-1 sm:gap-2">
                                                        {[
                                                            { num: 0, name: 'Sun' }, { num: 1, name: 'Mon' }, { num: 2, name: 'Tue' }, { num: 3, name: 'Wed' },
                                                            { num: 4, name: 'Thu' }, { num: 5, name: 'Fri' }, { num: 6, name: 'Sat' }
                                                        ].map((day) => (
                                                            <button
                                                                key={day.num}
                                                                type="button"
                                                                onClick={() => {
                                                                    const isSelected = cronBuilder.specificWeekdays.includes(day.num);
                                                                    const newWeekdays = isSelected
                                                                        ? cronBuilder.specificWeekdays.filter(d => d !== day.num)
                                                                        : [...cronBuilder.specificWeekdays, day.num].sort((a, b) => a - b);
                                                                    setCronBuilder({ ...cronBuilder, specificWeekdays: newWeekdays });
                                                                }}
                                                                className={`px-2 py-1 text-xs rounded-lg border ${cronBuilder.specificWeekdays.includes(day.num)
                                                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                                                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                                    }`}
                                                            >
                                                                {day.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {cronBuilder.specificWeekdays.length === 0 && (
                                                        <div className="mt-2 rounded-lg border border-zinc-200/80 bg-zinc-50 p-2 text-xs text-zinc-600">
                                                            No days selected. Will default to all days when added.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {cronBuilder.type === 'monthly' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Day of Month</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={cronBuilder.monthlyDay}
                                                onChange={(e) => setCronBuilder({ ...cronBuilder, monthlyDay: parseInt(e.target.value) || 1 })}
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:px-3 sm:py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Time</label>
                                            <input
                                                type="time"
                                                value={cronBuilder.monthlyTime}
                                                onChange={(e) => setCronBuilder({ ...cronBuilder, monthlyTime: e.target.value })}
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:px-3 sm:py-2"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Month Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Months</label>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, monthlyType: 'all', specificMonths: [] })}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${cronBuilder.monthlyType === 'all'
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                        }`}
                                                >
                                                    All Months
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, monthlyType: 'specific' })}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${cronBuilder.monthlyType === 'specific'
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                        }`}
                                                >
                                                    Specific Months
                                                </button>
                                            </div>
                                            
                                            {cronBuilder.monthlyType === 'specific' && (
                                                <div>
                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        {[
                                                            { num: 1, name: 'Jan' }, { num: 2, name: 'Feb' }, { num: 3, name: 'Mar' },
                                                            { num: 4, name: 'Apr' }, { num: 5, name: 'May' }, { num: 6, name: 'Jun' },
                                                            { num: 7, name: 'Jul' }, { num: 8, name: 'Aug' }, { num: 9, name: 'Sep' },
                                                            { num: 10, name: 'Oct' }, { num: 11, name: 'Nov' }, { num: 12, name: 'Dec' }
                                                        ].map((month) => (
                                                            <button
                                                                key={month.num}
                                                                type="button"
                                                                onClick={() => {
                                                                    const isSelected = cronBuilder.specificMonths.includes(month.num);
                                                                    const newMonths = isSelected
                                                                        ? cronBuilder.specificMonths.filter(m => m !== month.num)
                                                                        : [...cronBuilder.specificMonths, month.num].sort((a, b) => a - b);
                                                                    setCronBuilder({ ...cronBuilder, specificMonths: newMonths });
                                                                }}
                                                                className={`px-2 py-1 text-xs rounded-lg border ${cronBuilder.specificMonths.includes(month.num)
                                                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                                                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                                                    }`}
                                                            >
                                                                {month.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {cronBuilder.specificMonths.length === 0 && (
                                                        <div className="mt-2 rounded-lg border border-zinc-200/80 bg-zinc-50 p-2 text-xs text-zinc-600">
                                                            No months selected. Will default to all months when added.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Preview</label>
                            <div className="rounded-lg bg-zinc-100/80 p-2 sm:p-3">
                                <div className="mb-1 font-mono text-xs text-zinc-900 sm:text-sm">{generateCronExpression()}</div>
                                <div className="text-[11px] text-zinc-600 sm:text-xs">{getCronDescription()}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => {
                                    const newCronExpr = generateCronExpression();
                                    setCronExpressionArr([...cronExpressionArr, newCronExpr]);
                                    setShowCronBuilder(false);
                                    toast.success('Cron expression added successfully!');
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                            >
                                <LucidePlus className="h-4 w-4" />
                                Add Expression
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCronBuilder(false)}
                                className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const ComponentNotesEdit = ({
    taskScheduleObj,
    parentFormDataTaskAdd,
    parentFormDataSendMyselfEmail,
}: {
    taskScheduleObj: ITaskSchedule;
    parentFormDataTaskAdd: ITaskScheduleTaskAdd;
    parentFormDataSendMyselfEmail: ISendMyselfEmailForm;
}) => {
    const navigate = useNavigate();

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    })

    const [
        scheduleTimeArr,
        setScheduleTimeArr,
    ] = useState<string[]>(taskScheduleObj.scheduleTimeArr || []);

    const [
        cronExpressionArr,
        setCronExpressionArr,
    ] = useState<string[]>(taskScheduleObj.cronExpressionArr || []);
    const [dueDateInput, setDueDateInput] = useState<string>(
        getDateTimeForInputTypeDateTimeLocal(taskScheduleObj.dueDate || ''),
    );
    const [dueDateReminderPresetLabels, setDueDateReminderPresetLabels] = useState<string[]>(
        taskScheduleObj.dueDateReminderPresetLabels || [],
    );

    const [formDataTaskAdd, setFormDataTaskAdd] = useState(parentFormDataTaskAdd);

    const [formDataSendMyselfEmail, setFormDataSendMyselfEmail] = useState(parentFormDataSendMyselfEmail as ISendMyselfEmailForm);

    const [formData, setFormData] = useState({
        // Core task schedule fields
        isActive: taskScheduleObj.isActive,
        taskType: taskScheduleObj.taskType,
        shouldSendEmail: taskScheduleObj.shouldSendEmail,

        title: taskScheduleObj.title,

        // Schedule fields
        timezoneName: taskScheduleObj.timezoneName,
        timezoneOffset: taskScheduleObj.timezoneOffset,

        // Due date fields
        dueDate: taskScheduleObj.dueDate,
        dueDateReminderPresetLabels: taskScheduleObj.dueDateReminderPresetLabels,

        // UI helper fields
        tagsInput: '', // Temporary field for tag input
        scheduleTimeInput: '', // Temporary field for schedule time input
        cronExpressionInput: '', // Temporary field for cron expression input
    } as {
        // Core task schedule fields
        isActive: boolean;
        taskType: string;
        shouldSendEmail: boolean;
        title: string;

        // Schedule fields
        timezoneName: string;
        timezoneOffset: number;
        scheduleTimeArr: string[];
        cronExpressionArr: string[];

        // Due date fields
        dueDate: string | null;
        dueDateReminderPresetLabels: string[];

        // Notes fields
        isStar: boolean;
        tags: string[];
        aiTags: string[];
        aiSummary: string;
        aiSuggestions: string;

        // UI helper fields
        tagsInput: string;
        scheduleTimeInput: string;
        cronExpressionInput: string;
    });

    const editRecord = async () => {
        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    // Core task schedule fields
                    isActive: formData.isActive,
                    taskType: formData.taskType,
                    shouldSendEmail: formData.shouldSendEmail,
                    title: formData.title,

                    // schedule time
                    timezoneName: formData.timezoneName,
                    timezoneOffset: formData.timezoneOffset,

                    // Schedule fields
                    scheduleTimeArr: scheduleTimeArr,
                    cronExpressionArr: cronExpressionArr,
                    dueDate:
                        dueDateInput && dueDateInput.trim() !== '' && !Number.isNaN(new Date(dueDateInput).getTime())
                            ? new Date(dueDateInput).toISOString()
                            : null,
                    dueDateReminderPresetLabels,

                    // Notes fields
                    isStar: formData.isStar,
                    tags: formData.tags,
                    aiTags: formData.aiTags,
                    aiSummary: formData.aiSummary,
                    aiSuggestions: formData.aiSuggestions,

                    // ID for update
                    "_id": taskScheduleObj._id,

                    // schedule type -> taskAdd
                    taskAddObj: formDataTaskAdd,

                    // schedule type -> sendMyselfEmail
                    sendMyselfEmailObj: formDataSendMyselfEmail,
                },
            } as AxiosRequestConfig;
            await axiosCustom.request(config);
            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Note updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the note. Please try again later.')
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the note. Please try again later.',
            });
        }
    }

    const deleteRecord = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                return;
            }

            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: taskScheduleObj._id,
                },
            };

            await axiosCustom.request(config);

            toast.success('Note deleted successfully!');
            navigate('/user/task-schedule');
        } catch (error) {
            console.error(error);
        }
    }

    const renderEditFields = () => {
        return (
            <div className="space-y-3 sm:space-y-4">
                {/* field -> is active */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800 sm:mb-3">Is Active</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-zinc-600">
                            Is active
                        </label>
                    </div>
                </div>

                {/* field -> task type */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Task Type *</label>
                    <select
                        value={formData.taskType}
                        className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        onChange={(e) => {
                            setFormData({ ...formData, taskType: e.target.value });
                            if (e.target.value === 'taskAdd' || e.target.value === 'notesAdd') {
                                // do nothing
                            } else {
                                setScheduleTimeArr([]);
                                setCronExpressionArr(['0 9 * * *']);
                            }
                        }}
                    >
                        <option value="taskAdd">Task Add</option>
                        <option value="sendMyselfEmail">Send Myself Email</option>
                        <option value="generatedDailySummaryByAi">Generated User Daily Summary (AI)</option>
                        <option value="suggestDailyTasksByAi">Suggest Daily Tasks (AI)</option>
                    </select>
                </div>

                {/* field -> title */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* field -> should send email */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800 sm:mb-3">Send Email Notifications</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="shouldSendEmail"
                            checked={formData.shouldSendEmail}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                            onChange={(e) => setFormData({ ...formData, shouldSendEmail: e.target.checked })}
                        />
                        <label htmlFor="shouldSendEmail" className="ml-2 text-sm text-zinc-600">
                            Send email notifications when task is executed
                        </label>
                    </div>
                </div>

                {/* selected -> task add */}
                {formData.taskType === 'taskAdd' && (
                    <div>
                        <ComponentScheduleTaskAdd
                            formDataTaskAdd={formDataTaskAdd}
                            setFormDataTaskAdd={setFormDataTaskAdd}
                        />
                    </div>
                )}
                {formData.taskType === 'sendMyselfEmail' && (
                    <div>
                        <ComponentScheduleSendMyselfEmail
                            formDataSendMyselfEmail={formDataSendMyselfEmail}
                            setFormDataSendMyselfEmail={setFormDataSendMyselfEmail}
                        />
                    </div>
                )}

                {/* heading -> schedule */}
                <h2 className="my-3 border-b border-zinc-100 pb-2 text-lg font-semibold tracking-tight text-zinc-900 sm:my-4 sm:text-xl">
                    Schedule
                </h2>

                {/* field -> scheduleTimeArrTimezone */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Schedule Timezone</label>
                    <select
                        value={formData.timezoneName}
                        className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        onChange={(e) => {
                            const tempTimezoneName = e.target.value;
                            let timezoneName = 'Asia/Kolkata';
                            let timezoneOffset = 330;
                            Object.values(timeZoneArr).forEach(tz => {
                                if (tz.name === tempTimezoneName) {
                                    timezoneName = tz.name;
                                    timezoneOffset = tz.utcOffset;
                                }
                            });
                            setFormData({
                                ...formData,
                                timezoneName: timezoneName,
                                timezoneOffset: timezoneOffset
                            });
                        }}
                    >
                        {Object.values(timeZoneArr).map((tz) => (
                            <option key={tz.name} value={tz.name}>
                                {tz.name} (UTC{tz.utcOffsetStr})
                            </option>
                        ))}
                    </select>
                </div>

                {/* field -> due date and due-date reminders */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-2.5 sm:p-3">
                    <label className="block text-sm font-medium text-zinc-800">Due Date</label>
                    <input
                        type="datetime-local"
                        value={dueDateInput}
                        className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        onChange={(e) => setDueDateInput(e.target.value)}
                    />
                    <div className="mt-3">
                        <div className="mb-2 text-sm font-medium text-zinc-800">Before due date reminders</div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {DUE_DATE_PRESET_OPTIONS.map((option) => {
                                const checked = dueDateReminderPresetLabels.includes(option.labelName);
                                return (
                                    <label
                                        key={option.labelName}
                                        className="inline-flex items-center gap-2 text-xs text-zinc-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setDueDateReminderPresetLabels((prev) =>
                                                        [...new Set([...prev, option.labelName])],
                                                    );
                                                    return;
                                                }
                                                setDueDateReminderPresetLabels((prev) =>
                                                    prev.filter((x) => x !== option.labelName),
                                                );
                                            }}
                                        />
                                        <span>{option.labelNameStr}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <ComponentComputedReminderDates dueDateInput={dueDateInput} />
                </div>

                {/* field -> schedule times */}
                <Fragment>
                    <ScheduleTimeArr
                        scheduleTimeArr={scheduleTimeArr}
                        setScheduleTimeArr={setScheduleTimeArr}
                    />
                </Fragment>

                {/* field -> cron expressions */}
                <CronExpressionArr
                    cronExpressionArr={cronExpressionArr}
                    setCronExpressionArr={setCronExpressionArr}
                />

                {/* field -> schedule execution times */}
                <div className="py-1.5 sm:py-2">
                    <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:mb-2">Schedule Execution Times</label>
                    <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-2 sm:p-3 [scrollbar-width:thin]">
                        {taskScheduleObj.scheduleExecutionTimeArr.length === 0 ? (
                            <div className="text-sm italic text-zinc-500">No execution times scheduled</div>
                        ) : (
                            <div className="space-y-1.5 sm:space-y-2">
                                {taskScheduleObj.scheduleExecutionTimeArr.map((time, index) => (
                                    <div key={index} className="rounded-lg border border-zinc-200/80 bg-white p-2 text-xs text-zinc-700 sm:text-sm">
                                        {index + 1}: {new Date(time).toLocaleString()}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* field -> schedule executed times */}
                <div className="py-1.5 sm:py-2">
                    <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:mb-2">Schedule Executed Times</label>
                    <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-2 sm:p-3 [scrollbar-width:thin]">
                        {taskScheduleObj.scheduleExecutedTimeArr.length === 0 ? (
                            <div className="text-sm italic text-zinc-500">No executions completed yet</div>
                        ) : (
                            <div className="space-y-1.5 sm:space-y-2">
                                {taskScheduleObj.scheduleExecutedTimeArr.map((time, index) => (
                                    <div key={index} className="rounded-lg border border-zinc-200/80 bg-white p-2 text-xs text-zinc-700 sm:text-sm">
                                        {index + 1}: {new Date(time).toLocaleString()}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* field -> executed times count */}
                <div className="py-1.5 sm:py-2">
                    <label className="block text-sm font-medium text-zinc-800">Total Executed Times</label>
                    <div className="mt-1 text-lg font-semibold text-indigo-600 tabular-nums">
                        {taskScheduleObj.executedTimes}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm sm:p-3 md:p-4">
            {requestEdit.loading && (
                <div className="mb-3 flex justify-between border-b border-zinc-100 pb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
                        <LucideArrowLeft className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                        Saving…
                    </span>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                    <Link
                        to="/user/task-schedule"
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                        <LucideArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                        Back
                    </Link>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
                            onClick={() => {
                                deleteRecord();
                            }}
                        >
                            <LucideTrash className="h-3.5 w-3.5" strokeWidth={2} />
                            Delete
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-600/20 bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                            onClick={() => {
                                editRecord();
                            }}
                            aria-label="Save"
                        >
                            <LucideSave className="h-3.5 w-3.5" strokeWidth={2} />
                            Save
                        </button>
                    </div>
                </div>
            )}

            {renderEditFields()}
        </div>
    );
}

const ComponentNotesEditWrapper = ({
    recordId
}: {
    recordId: string;
}) => {
    const navigate = useNavigate();
    const [list, setList] = useState([] as ITaskSchedule[]);
    const [formDataTaskAdd, setFormDataTaskAdd] = useState<ITaskScheduleTaskAdd>({
        // task fields
        taskTitle: '',
        taskDatePrefix: true,
        taskDateTimePrefix: false,

        // deadline enabled
        taskDeadlineEnabled: false,
        taskDeadlineDays: 1,

        // task ai fields
        taskAiSummary: false,
        taskAiContext: '',

        // identification
        taskWorkspaceId: '',
        taskStatusId: '',

        // subtask list
        subtaskArr: [],
    });
    const [formDataSendMyselfEmail, setFormDataSendMyselfEmail] = useState<ISendMyselfEmailForm>({
        username: '',
        taskScheduleId: '',
        emailSubject: '',
        emailContent: '',
        sendMailEnabled: true,
        sendTelegramEnabled: false,
        telegramChatId: '',
        telegramMessageThreadId: null,
        aiEnabled: false,
        passAiContextEnabled: false,
        systemPrompt: '',
        userPrompt: '',
        aiModelName: 'openrouter',
        aiModelProvider: 'openrouter/auto',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchList();
    }, [
        recordId,
    ])

    const fetchList = async () => {
        setLoading(true); // Set loading to true before the fetch
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    recordId: recordId
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            console.log(response.data);
            console.log(response.data.docs);

            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }

            if (tempArr.length === 1) {
                if (tempArr[0]?.taskAddArr?.length === 1) {
                    let tempTask = tempArr[0].taskAddArr[0]
                    setFormDataTaskAdd({
                        ...tempTask,
                        subtaskArr: tempTask.subtaskArr || [],
                    });
                }
                if (tempArr[0]?.sendMyselfEmailArr?.length === 1) {
                    const tempSendMyselfEmail = tempArr[0].sendMyselfEmailArr[0];
                    setFormDataSendMyselfEmail({
                        ...tempSendMyselfEmail,
                        sendMailEnabled: tempSendMyselfEmail.sendMailEnabled !== false,
                        sendTelegramEnabled: tempSendMyselfEmail.sendTelegramEnabled === true,
                        telegramChatId:
                            typeof tempSendMyselfEmail.telegramChatId === 'string' ? tempSendMyselfEmail.telegramChatId : '',
                        telegramMessageThreadId:
                            typeof tempSendMyselfEmail.telegramMessageThreadId === 'number' &&
                            tempSendMyselfEmail.telegramMessageThreadId > 0
                                ? tempSendMyselfEmail.telegramMessageThreadId
                                : null,
                    });
                }
            }

            setLoading(false);
            setList(tempArr);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // Set loading to false after the fetch is complete
        }
    }

    return (
        <div>
            {loading && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-10 shadow-sm">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
                    <p className="text-xs text-zinc-600">Loading…</p>
                </div>
            )}
            {!loading && list.length === 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-700">Record does not exist.</p>
                    <button
                        type="button"
                        className="mt-3 inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                        onClick={() => navigate('/user/task-schedule')}
                    >
                        Back to list
                    </button>
                </div>
            )}
            {!loading && list.length === 1 && (
                <ComponentNotesEdit
                    taskScheduleObj={list[0]}
                    parentFormDataTaskAdd={formDataTaskAdd}
                    parentFormDataSendMyselfEmail={formDataSendMyselfEmail}
                />
            )}
        </div>
    );
};

export default ComponentNotesEditWrapper;