import { LucideEdit, LucideTrash2 } from "lucide-react";
import { ITaskSchedule } from "../../../../../types/pages/tsTaskSchedule";
import { Link } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import { Fragment, useState } from "react";

const ComponentNotesItem = ({
    taskScheduleObj,
}: {
    taskScheduleObj: ITaskSchedule
}) => {
    const [isDeleted, setIsDeleted] = useState(false);

    const deleteItem = async () => {
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

            setIsDeleted(true);
        } catch (error) {
            console.error(error);
        }
    }

    const renderItem = () => {
        return (
            <Fragment>
                {/* title */}
                <h3>{taskScheduleObj.title}</h3>

                <div className="flex flex-col gap-1">
                    {/* Status indicators */}
                    <div className="flex items-center gap-1 mb-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            taskScheduleObj.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {taskScheduleObj.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {taskScheduleObj.taskType}
                        </span>
                        
                        {taskScheduleObj.shouldSendEmail && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Send Email
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {taskScheduleObj.description && (
                        <p className="text-xs text-gray-600 mb-1">{taskScheduleObj.description}</p>
                    )}

                    {/* Schedule info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs">
                        {/* Timezone */}
                        <div className="flex items-center">
                            <span className="text-gray-500 font-medium mr-1">TZ:</span>
                            <span className="text-gray-700 truncate">{taskScheduleObj.timezoneName}</span>
                        </div>

                        {/* Executed times */}
                        <div className="flex items-center">
                            <span className="text-gray-500 font-medium mr-1">Exec:</span>
                            <span className="text-gray-700">{taskScheduleObj.executedTimes || 0}x</span>
                        </div>

                        {/* Schedule times count */}
                        {taskScheduleObj.scheduleTimeArr && taskScheduleObj.scheduleTimeArr.length > 0 && (
                            <div className="flex items-center">
                                <span className="text-gray-500 font-medium mr-1">Times:</span>
                                <span className="text-gray-700">{taskScheduleObj.scheduleTimeArr.length}</span>
                            </div>
                        )}

                        {/* Cron expressions count */}
                        {taskScheduleObj.cronExpressionArr && taskScheduleObj.cronExpressionArr.length > 0 && (
                            <div className="flex items-center">
                                <span className="text-gray-500 font-medium mr-1">Cron:</span>
                                <span className="text-gray-700">{taskScheduleObj.cronExpressionArr.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Next execution time */}
                    {taskScheduleObj.scheduleExecutionTimeArr && taskScheduleObj.scheduleExecutionTimeArr.length > 0 && (
                        <div className="mt-1 p-1 bg-blue-50 rounded text-xs">
                            <span className="text-blue-600 font-medium">Next:</span>
                            <span className="text-blue-800 ml-1">
                                {new Date(taskScheduleObj.scheduleExecutionTimeArr[0]).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* actions */}
                <div className="flex justify-end">
                    <div className="action-buttons my-4">
                        <Link
                            to={`/user/task-schedule?action=edit&id=${taskScheduleObj._id}`}
                            className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 mr-1"
                        >
                            <LucideEdit
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Edit
                        </Link>
                        <button
                            className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 mr-1"
                            onClick={deleteItem}
                        >
                            <LucideTrash2
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Delete
                        </button>
                    </div>
                </div>
            </Fragment>
        )
    }

    return (
        <div
            className="py-1 bg-white rounded px-2"
            style={{ borderBottom: '1px solid #ccc' }}
        >
            {isDeleted && (
                <div className="text-red-500 text-sm border border-red-500 p-2 rounded">This item has been deleted.</div>
            )}
            {!isDeleted && (
                <Fragment>
                    {renderItem()}
                </Fragment>
            )}
        </div>
    );
}

export default ComponentNotesItem;