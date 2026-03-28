import { LucideEdit, LucideTrash2 } from 'lucide-react';
import { ITaskSchedule } from '../../../../../types/pages/tsTaskSchedule';
import { Link } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom';
import { Fragment, useState } from 'react';

const ComponentNotesItem = ({
    taskScheduleObj,
}: {
    taskScheduleObj: ITaskSchedule;
}) => {
    const [isDeleted, setIsDeleted] = useState(false);

    const deleteItem = async () => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this item?');
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

            setIsDeleted(true);
        } catch (error) {
            console.error(error);
        }
    };

    const chip =
        'inline-flex max-w-full items-center truncate rounded-sm border px-1.5 py-0.5 text-[10px] font-medium';

    const renderItem = () => {
        return (
            <Fragment>
                <h3 className="text-sm font-semibold leading-snug text-zinc-900">{taskScheduleObj.title}</h3>

                <div className="mt-1.5 flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-1">
                        <span
                            className={`${chip} ${
                                taskScheduleObj.isActive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                    : 'border-zinc-200 bg-zinc-100 text-zinc-700'
                            }`}
                        >
                            {taskScheduleObj.isActive ? 'Active' : 'Inactive'}
                        </span>

                        <span className={`${chip} border-zinc-200 bg-white text-zinc-800`}>
                            {taskScheduleObj.taskType}
                        </span>

                        {taskScheduleObj.shouldSendEmail && (
                            <span className={`${chip} border-indigo-200 bg-indigo-50 text-indigo-900`}>
                                Email
                            </span>
                        )}
                    </div>

                    {taskScheduleObj.description && (
                        <p className="line-clamp-2 text-xs text-zinc-600">{taskScheduleObj.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] md:grid-cols-4">
                        <div className="flex min-w-0 items-center gap-1">
                            <span className="shrink-0 text-zinc-500">TZ</span>
                            <span className="truncate text-zinc-800">{taskScheduleObj.timezoneName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Exec</span>
                            <span className="text-zinc-800">{taskScheduleObj.executedTimes || 0}×</span>
                        </div>
                        {taskScheduleObj.scheduleTimeArr && taskScheduleObj.scheduleTimeArr.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-zinc-500">Times</span>
                                <span className="text-zinc-800">{taskScheduleObj.scheduleTimeArr.length}</span>
                            </div>
                        )}
                        {taskScheduleObj.cronExpressionArr && taskScheduleObj.cronExpressionArr.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-zinc-500">Cron</span>
                                <span className="text-zinc-800">{taskScheduleObj.cronExpressionArr.length}</span>
                            </div>
                        )}
                    </div>

                    {taskScheduleObj.scheduleExecutionTimeArr &&
                        taskScheduleObj.scheduleExecutionTimeArr.length > 0 && (
                            <div className="rounded-sm border border-indigo-100 bg-indigo-50/60 px-2 py-1 text-[11px] text-indigo-950">
                                <span className="font-medium text-indigo-800">Next</span>{' '}
                                {new Date(taskScheduleObj.scheduleExecutionTimeArr[0]).toLocaleString()}
                            </div>
                        )}
                </div>

                <div className="action-buttons mt-2 flex justify-end gap-1">
                    <Link
                        to={`/user/task-schedule?action=edit&id=${taskScheduleObj._id}`}
                        className="inline-flex items-center gap-1 rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                        <LucideEdit className="h-3 w-3" strokeWidth={2} />
                        Edit
                    </Link>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800 hover:bg-red-100"
                        onClick={() => void deleteItem()}
                    >
                        <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                        Delete
                    </button>
                </div>
            </Fragment>
        );
    };

    return (
        <div className="rounded-sm border border-zinc-200 bg-white px-2.5 py-2 shadow-sm">
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
