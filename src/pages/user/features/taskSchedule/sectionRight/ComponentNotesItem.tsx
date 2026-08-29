import { LucideCalendar, LucideClock, LucideEdit, LucideMail, LucideSend, LucideTrash2, LucideZap, LucideStickyNote, LucideGlobe, LucideCopy, LucideToggleLeft, LucidePlay, LucideHistory, LucideTestTube } from 'lucide-react';
import { ITaskSchedule } from '../../../../../types/pages/tsTaskSchedule';
import { Link } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom';
import { Fragment, useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import toast from 'react-hot-toast';
import ComponentConfirmModal from './ComponentConfirmModal.tsx';

const typeIcon = (t: string) => {
    if (t === 'sendMyselfEmail') {
        return <LucideMail className="h-3 w-3" strokeWidth={2} />;
    }
    if (t === 'taskAdd') {
        return <LucideStickyNote className="h-3 w-3" strokeWidth={2} />;
    }
    if (t.includes('Ai') || t.includes('AI')) {
        return <LucideZap className="h-3 w-3" strokeWidth={2} />;
    }
    return <LucideClock className="h-3 w-3" strokeWidth={2} />;
};

const tzAbbr = (name: string) => {
    try {
        const fmt = new Intl.DateTimeFormat('en', { timeZone: name, timeZoneName: 'short' });
        const p = fmt.formatToParts(new Date()).find((x) => x.type === 'timeZoneName');
        return p ? p.value : name;
    } catch {
        return name;
    }
};

const cronExplainLocal = (expr: string): string => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) {
        return 'Invalid cron';
    }
    if (expr === '0 9 * * *') {
        return 'Daily at 09:00';
    }
    if (expr === '0 9 * * 1-5') {
        return 'Weekdays at 09:00';
    }
    if (expr.startsWith('0 */')) {
        return `Every ${parts[1].replace('*/', '')} hours`;
    }
    return expr;
};

const ComponentNotesItem = ({
    taskScheduleObj,
    onDuplicate,
    onToggleActive,
    onRunNow,
    onHistory,
    onTestSend,
}: {
    taskScheduleObj: ITaskSchedule;
    onDuplicate?: (id: string) => void;
    onToggleActive?: (obj: ITaskSchedule) => void;
    onRunNow?: (id: string) => void;
    onHistory?: (id: string) => void;
    onTestSend?: (id: string) => void;
}) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = window.setInterval(() => { setTick((n) => n + 1); }, 60000);
        return () => window.clearInterval(id);
    }, []);
    void tick;

    const deleteItem = async () => {
        try {
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
            setIsDeleted(true);
            toast.success('Deleted');
        } catch (error) {
            console.error(error);
            toast.error('Delete failed');
        }
    };

    const chip =
        'inline-flex max-w-full items-center truncate rounded-sm border px-1.5 py-0.5 text-[10px] font-medium';

    const renderItem = () => {
        return (
            <Fragment>
                <h3 className="text-sm font-semibold leading-snug text-zinc-100">{taskScheduleObj.title}</h3>

                <div className="mt-1.5 flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-1">
                        <span
                            className={`${chip} ${
                                taskScheduleObj.isActive
                                    ? 'border-emerald-700 bg-emerald-950 text-emerald-200'
                                    : 'border-zinc-700 bg-zinc-100 text-zinc-700'
                            }`}
                        >
                            {taskScheduleObj.isActive ? 'Active' : 'Inactive'}
                        </span>

                        <span className={`${chip} border-zinc-700 bg-zinc-900 text-zinc-200 gap-1`}>
                            {typeIcon(taskScheduleObj.taskType)}
                            {taskScheduleObj.taskType}
                        </span>

                        {taskScheduleObj.shouldSendEmail && (
                            <span className={`${chip} border-indigo-700 bg-indigo-950 text-indigo-200`}>Email</span>
                        )}
                        {(taskScheduleObj as unknown as { sendMyselfEmailArr?: { sendTelegramEnabled?: boolean }[] }).sendMyselfEmailArr?.[0]?.sendTelegramEnabled && (
                            <span className={`${chip} border-sky-700 bg-sky-950 text-sky-200 gap-1`}><LucideSend className="h-3 w-3" />Telegram</span>
                        )}
                    </div>

                    {taskScheduleObj.description && (
                        <p className="line-clamp-2 text-xs text-zinc-400">{taskScheduleObj.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] md:grid-cols-4">
                        <div className="flex min-w-0 items-center gap-1">
                            <span className="shrink-0 text-zinc-500">TZ</span>
                            <span className="truncate text-zinc-200 flex items-center gap-1"><LucideGlobe className="h-3 w-3" />{tzAbbr(taskScheduleObj.timezoneName)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Exec</span>
                            <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-200">{taskScheduleObj.executedTimes || 0}×</span>
                        </div>
                        {taskScheduleObj.scheduleTimeArr && taskScheduleObj.scheduleTimeArr.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-zinc-500">Times</span>
                                <span className="text-zinc-200">{taskScheduleObj.scheduleTimeArr.length}</span>
                            </div>
                        )}
                        {taskScheduleObj.cronExpressionArr && taskScheduleObj.cronExpressionArr.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-zinc-500">Cron</span>
                                <span className="text-zinc-200">{taskScheduleObj.cronExpressionArr.length}</span>
                            </div>
                        )}
                    </div>

                    {taskScheduleObj.scheduleExecutionTimeArr &&
                        taskScheduleObj.scheduleExecutionTimeArr.length > 0 && (() => {
                            const rel = DateTime.fromJSDate(new Date(taskScheduleObj.scheduleExecutionTimeArr[0])).toRelative() || '';
                            return (
                                <div className="rounded-sm border border-indigo-800 bg-indigo-950/60 px-2 py-1 text-[11px] text-indigo-200 flex items-center gap-1">
                                    <LucideCalendar className="h-3 w-3" /><span className="font-medium text-indigo-300">Next {rel}</span> {new Date(taskScheduleObj.scheduleExecutionTimeArr[0]).toLocaleString()}
                                </div>
                            );
                        })()}
                    {taskScheduleObj.scheduleExecutedTimeArr && taskScheduleObj.scheduleExecutedTimeArr.length > 0 && (() => {
                        const last = taskScheduleObj.scheduleExecutedTimeArr[taskScheduleObj.scheduleExecutedTimeArr.length - 1];
                        const rel = DateTime.fromISO(last).toRelative() || DateTime.fromJSDate(new Date(last)).toRelative() || '';
                        return <span className={`${chip} border-zinc-700 bg-zinc-800 text-zinc-300`}>Last {rel}</span>;
                    })()}
                    {taskScheduleObj.dueDateReminderComputedTimes &&
                        taskScheduleObj.dueDateReminderComputedTimes.length > 0 && (
                            <div className="rounded-sm border border-amber-100 bg-amber-950/60 px-2 py-1 text-[11px] text-amber-200">
                                <span className="font-medium text-amber-800">Due reminder</span>{' '}
                                {new Date(taskScheduleObj.dueDateReminderComputedTimes[0]).toLocaleString()}
                            </div>
                        )}
                    {taskScheduleObj.scheduleExecutionTimeArr && taskScheduleObj.scheduleExecutionTimeArr.length > 1 && (
                        <div className="rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300">
                            <span className="font-medium text-zinc-200">Next runs:</span> {taskScheduleObj.scheduleExecutionTimeArr.slice(0, 3).map((t) => new Date(t).toLocaleString()).join(' • ')}
                        </div>
                    )}
                    {taskScheduleObj.cronExpressionArr && taskScheduleObj.cronExpressionArr.length > 0 && (
                        <div className="text-[10px] text-zinc-500">{taskScheduleObj.cronExpressionArr.map((c) => cronExplainLocal(c)).join(' • ')}</div>
                    )}
                </div>

                <div className="action-buttons mt-2 flex flex-wrap justify-end gap-1">
                    <button type="button" aria-label="Run now" onClick={() => { if (onRunNow) { onRunNow(taskScheduleObj._id); } }} className="inline-flex items-center gap-1 rounded-sm border border-emerald-700 bg-emerald-950 px-2 py-0.5 text-[11px] text-emerald-200 hover:bg-emerald-900"><LucidePlay className="h-3 w-3" />Run</button>
                    <button type="button" aria-label="History" onClick={() => { if (onHistory) { onHistory(taskScheduleObj._id); } }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-700"><LucideHistory className="h-3 w-3" />History</button>
                    <button type="button" aria-label="Test send" onClick={() => { if (onTestSend) { onTestSend(taskScheduleObj._id); } }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-800"><LucideTestTube className="h-3 w-3" />Test</button>
                    <button type="button" aria-label="Toggle active" onClick={() => { if (onToggleActive) { onToggleActive(taskScheduleObj); } }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-700"><LucideToggleLeft className="h-3 w-3" />{taskScheduleObj.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button type="button" aria-label="Duplicate schedule" onClick={() => { if (onDuplicate) { onDuplicate(taskScheduleObj._id); } }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-800"><LucideCopy className="h-3 w-3" />Copy</button>
                    <Link
                        to={`/user/task-schedule?action=edit&id=${taskScheduleObj._id}`}
                        aria-label="Edit schedule"
                        className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                        <LucideEdit className="h-3 w-3" strokeWidth={2} />
                        Edit
                    </Link>
                    <button
                        type="button"
                        aria-label="Delete schedule"
                        className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800 hover:bg-red-100"
                        onClick={() => { setConfirmOpen(true); }}
                    >
                        <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                        Delete
                    </button>
                </div>
                <ComponentConfirmModal isOpen={confirmOpen} title="Delete schedule?" body="This cannot be undone." confirmLabel="Delete" onConfirm={() => { setConfirmOpen(false); void deleteItem(); }} onCancel={() => setConfirmOpen(false)} />
            </Fragment>
        );
    };

    return (
        <div className="rounded-sm border border-zinc-700 bg-zinc-900 px-2.5 py-2 shadow-sm">
            {isDeleted && (
                <div className="rounded-sm border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-700">
                    This item has been deleted.
                </div>
            )}
            {!isDeleted && <Fragment>{renderItem()}</Fragment>}
        </div>
    );
};

export default ComponentNotesItem;
