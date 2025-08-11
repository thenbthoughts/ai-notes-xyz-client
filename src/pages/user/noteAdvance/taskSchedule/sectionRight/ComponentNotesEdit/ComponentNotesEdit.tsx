import { useState, useEffect, Fragment } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideArrowLeft, LucidePlus, LucideSave, LucideTrash } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllTimezones } from 'countries-and-timezones';

import { ITaskSchedule, ITaskScheduleTaskAdd } from '../../../../../../types/pages/tsTaskSchedule.ts';
import ComponentScheduleTaskAdd from './scheduleTaskAdd/ComponentScheduleTaskAdd.tsx';

const timeZoneArr = getAllTimezones();

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
            <label className="block text-sm font-medium text-gray-700 mb-3">Schedule Times</label>

            {/* Display existing schedule times */}
            <div className="flex flex-wrap gap-2 mb-4">
                {scheduleTimeArr.map((scheduleTime, idx) => (
                    <span key={idx} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow-sm border border-blue-200">
                        {new Date(scheduleTime).toISOString()}
                        <button
                            type="button"
                            className="ml-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1"
                            style={{ fontSize: '1rem', lineHeight: 1, marginLeft: 4 }}
                            onClick={() => {
                                setScheduleTimeArr(scheduleTimeArr.filter((_, i) => i !== idx));
                            }}
                            aria-label={`Remove schedule time ${new Date(scheduleTime).toISOString()}`}
                        >
                            X
                        </button>
                    </span>
                ))}
            </div>

            {/* Date, Time, Timezone selector */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Date and Time */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                    <div>{scheduleTimeInput}</div>
                    <input
                        type='datetime-local'
                        value={scheduleTimeInput || ''}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        onChange={e => setScheduleTimeInput(e.target.value)}
                    />
                </div>

                {/* Add Schedule Button */}
                <button
                    type="button"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition font-medium"
                    onClick={() => {
                        if (scheduleTimeInput && scheduleTimeInput.trim() !== '') {
                            const newScheduleTime = new Date(`${scheduleTimeInput}:00.000Z`);

                            if (!isNaN(newScheduleTime.getTime())) {
                                // Adjust for timezone offset (convert to UTC)
                                const utcTime = new Date(newScheduleTime.valueOf()).toISOString();
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
                    <LucidePlus className="w-4 h-4 inline-block mr-2" />
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
            <label className="block text-sm font-medium text-gray-700 mb-3">Cron Expressions</label>

            {/* Display existing cron expressions */}
            <div className="flex flex-wrap gap-2 mb-4">
                {cronExpressionArr.map((cronExpr, idx) => (
                    <span key={idx} className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow-sm border border-green-200">
                        {cronExpr}
                        <button
                            type="button"
                            className="ml-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1"
                            style={{ fontSize: '1rem', lineHeight: 1, marginLeft: 4 }}
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Manual Cron Expression Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manual Cron Expression</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={cronExpressionInput || ''}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                            onChange={e => setCronExpressionInput(e.target.value)}
                            placeholder="Enter cron expression (e.g., 0 9 * * 1-5)"
                        />
                        <button
                            type="button"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
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
                    <div className="text-xs text-gray-500 mt-1">
                        Examples: "0 9 * * 1-5" (weekdays at 9am), "0 0 * * 0" (Sundays at midnight)
                    </div>
                </div>

                {/* OR Divider */}
                <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="px-3 text-sm text-gray-500 bg-gray-50">OR</div>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Cron Builder Toggle */}
                <button
                    type="button"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition font-medium"
                    onClick={() => setShowCronBuilder(!showCronBuilder)}
                >
                    <LucidePlus className="w-4 h-4 inline-block mr-2" />
                    {showCronBuilder ? 'Hide' : 'Use'} Dynamic Cron Builder
                </button>

                {/* Dynamic Cron Builder */}
                {showCronBuilder && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h4 className="font-medium mb-4 text-gray-900">Dynamic Cron Expression Builder</h4>

                        {/* Type Selector */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['hour', 'daily', 'weekly', 'monthly'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setCronBuilder({ ...cronBuilder, type })}
                                        className={`px-3 py-2 text-sm rounded-md border ${cronBuilder.type === type
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Every N Hours</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="23"
                                            value={cronBuilder.hourInterval}
                                            onChange={(e) => setCronBuilder({ ...cronBuilder, hourInterval: parseInt(e.target.value) || 1 })}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600">hour(s)</span>
                                    </div>
                                </div>
                            )}

                            {cronBuilder.type === 'daily' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={cronBuilder.dailyTime}
                                        onChange={(e) => setCronBuilder({ ...cronBuilder, dailyTime: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {cronBuilder.type === 'weekly' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={cronBuilder.weeklyTime}
                                            onChange={(e) => setCronBuilder({ ...cronBuilder, weeklyTime: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    {/* Weekday Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, weeklyType: 'all', specificWeekdays: [] })}
                                                    className={`px-3 py-2 text-sm rounded-md border ${cronBuilder.weeklyType === 'all'
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    All Days
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, weeklyType: 'specific' })}
                                                    className={`px-3 py-2 text-sm rounded-md border ${cronBuilder.weeklyType === 'specific'
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Specific Days
                                                </button>
                                            </div>
                                            
                                            {cronBuilder.weeklyType === 'specific' && (
                                                <div>
                                                    <div className="grid grid-cols-4 gap-2 mt-2">
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
                                                                className={`px-2 py-1 text-xs rounded border ${cronBuilder.specificWeekdays.includes(day.num)
                                                                    ? 'bg-green-600 text-white border-green-600'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {day.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {cronBuilder.specificWeekdays.length === 0 && (
                                                        <div className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={cronBuilder.monthlyDay}
                                                onChange={(e) => setCronBuilder({ ...cronBuilder, monthlyDay: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                            <input
                                                type="time"
                                                value={cronBuilder.monthlyTime}
                                                onChange={(e) => setCronBuilder({ ...cronBuilder, monthlyTime: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Month Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Months</label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, monthlyType: 'all', specificMonths: [] })}
                                                    className={`px-3 py-2 text-sm rounded-md border ${cronBuilder.monthlyType === 'all'
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    All Months
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCronBuilder({ ...cronBuilder, monthlyType: 'specific' })}
                                                    className={`px-3 py-2 text-sm rounded-md border ${cronBuilder.monthlyType === 'specific'
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                                                                className={`px-2 py-1 text-xs rounded border ${cronBuilder.specificMonths.includes(month.num)
                                                                    ? 'bg-green-600 text-white border-green-600'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {month.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {cronBuilder.specificMonths.length === 0 && (
                                                        <div className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                            <div className="bg-gray-100 p-3 rounded-md">
                                <div className="font-mono text-sm mb-1 text-gray-900">{generateCronExpression()}</div>
                                <div className="text-xs text-gray-600">{getCronDescription()}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const newCronExpr = generateCronExpression();
                                    setCronExpressionArr([...cronExpressionArr, newCronExpr]);
                                    setShowCronBuilder(false);
                                    toast.success('Cron expression added successfully!');
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2"
                            >
                                <LucidePlus className="w-4 h-4" />
                                Add Expression
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCronBuilder(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
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
}: {
    taskScheduleObj: ITaskSchedule;
    parentFormDataTaskAdd: ITaskScheduleTaskAdd;
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

    const [formDataTaskAdd, setFormDataTaskAdd] = useState(parentFormDataTaskAdd);

    const [formData, setFormData] = useState({
        // Core task schedule fields
        isActive: taskScheduleObj.isActive,
        taskType: taskScheduleObj.taskType,
        shouldSendEmail: taskScheduleObj.shouldSendEmail,

        title: taskScheduleObj.title,

        // Schedule fields
        timezoneName: taskScheduleObj.timezoneName,
        timezoneOffset: taskScheduleObj.timezoneOffset,

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
            <div className="space-y-4">
                {/* field -> is active */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Is Active</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-600">
                            Is active
                        </label>
                    </div>
                </div>

                {/* field -> task type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Task Type *</label>
                    <select
                        value={formData.taskType}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                        <option value="notesAdd">Notes Add</option>
                        <option value="restApiCall">REST API Call</option>
                        <option value="generatedDailySummaryByAi">Generated Daily Summary (AI)</option>
                        <option value="suggestDailyTasksByAi">Suggest Daily Tasks (AI)</option>
                    </select>
                </div>

                {/* field -> title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* field -> should send email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Send Email Notifications</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="shouldSendEmail"
                            checked={formData.shouldSendEmail}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            onChange={(e) => setFormData({ ...formData, shouldSendEmail: e.target.checked })}
                        />
                        <label htmlFor="shouldSendEmail" className="ml-2 text-sm text-gray-600">
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

                {/* heading -> schedule */}
                <h1 className="text-2xl font-bold text-gray-800 my-4">Schedule</h1>

                {/* field -> scheduleTimeArrTimezone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Schedule Timezone</label>
                    <select
                        value={formData.timezoneName}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
            </div>
        )
    }

    return (
        <div>
            {requestEdit.loading && (
                <div className="flex justify-between my-4">
                    <button
                        className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                    >
                        <LucideArrowLeft className="w-4 h-4 inline-block mr-2" />
                        Saving...
                    </button>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="flex justify-between my-4">
                    <Link
                        to={'/user/task-schedule'}
                        className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                    >
                        <LucideArrowLeft className="w-4 h-4 inline-block mr-2" />
                        Back
                    </Link>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                            onClick={() => {
                                deleteRecord();
                            }}
                        >
                            <LucideTrash
                                className="w-4 h-4 inline-block mr-2"
                                style={{
                                    position: 'relative',
                                    top: '-2px',
                                }}
                            />
                            Delete
                        </button>
                        <button
                            className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200"
                            onClick={() => {
                                editRecord();
                            }}
                            aria-label="Save"
                        >
                            <LucideSave
                                className="w-4 h-4 inline-block mr-2"
                                style={{
                                    position: 'relative',
                                    top: '-2px',
                                }}
                            />
                            Save
                        </button>
                    </div>
                </div>
            )}

            {renderEditFields()}

        </div>
    )
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

        // deadline enabled
        taskDeadlineEnabled: false,
        taskDeadlineDays: 1,

        // task ai fields
        taskAiSummary: false,
        taskAiContext: '',

        // identification
        taskWorkspaceId: '',
        taskStatusId: '',
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
                    setFormDataTaskAdd(tempArr[0].taskAddArr[0]);
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
        <div className='bg-white rounded p-4'>
            <h1 className="text-3xl font-bold text-gray-800 my-4">Schedule {'->'} Edit</h1>
            {loading && (
                <div className="text-center">
                    <p className="text-lg text-blue-500">Loading...</p>
                    <div className="loader"></div>
                </div>
            )}
            {!loading && list.length === 0 && (
                <div>
                    <div className="text-center">
                        <p className="text-lg text-red-500">Record does not exist.</p>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                                navigate('/user/task-schedule');
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
            {!loading && list.length === 1 && (
                <div>
                    <ComponentNotesEdit
                        taskScheduleObj={list[0]}
                        parentFormDataTaskAdd={formDataTaskAdd}
                    />
                </div>
            )}
        </div>
    )
};

export default ComponentNotesEditWrapper;