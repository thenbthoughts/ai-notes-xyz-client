import { useState, useEffect } from 'react';
import {
    LucideList,
    LucidePlus,
    LucideChevronRight,
    LucideChevronLeft,
    LucidePin,
    LucideEdit,
    LucideSquare,
    LucideSquareCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import axiosCustom from '../../../config/axiosCustom';
import { tsPageTask } from '../../../types/pages/tsPageTaskList';

const panel =
    'rounded-lg border border-zinc-200/90 bg-white p-2.5 shadow-sm transition hover:shadow';
const panelTitle = 'flex items-center gap-1.5 text-xs font-semibold text-zinc-800';
const panelIconBtn =
    'rounded-md border border-zinc-200 bg-white p-1 text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40';
const mutedText = 'text-[11px] leading-snug text-zinc-500';

const ComponentPinnedTask = () => {
    const [taskArr, setTaskArr] = useState([] as tsPageTask[]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    useEffect(() => {
        void fetchHomepageTask();
    }, []);

    const fetchHomepageTask = async () => {
        try {
            const response = await axiosCustom.get(`/api/dashboard/suggest-tasks/task-get-suggestions`);
            const arr = response.data.docs;
            setTaskArr(arr as tsPageTask[]);
        } catch (error) {
            console.error('Error fetching homepage task:', error);
        }
    };

    if (taskArr.length === 0) {
        return null;
    }

    return (
        <div className={`${panel} border-l-[3px] border-l-violet-500`}>
            <h2 className={`${panelTitle} mb-1.5`}>
                <Link to="/user/task" className="flex items-center gap-1.5 hover:text-violet-700">
                    <LucideList className="h-3.5 w-3.5 text-violet-600" strokeWidth={2} />
                    Pinned tasks
                </Link>
            </h2>
            <div className="mb-2 flex flex-wrap items-center gap-1">
                <Link
                    className={panelIconBtn}
                    title="Add task"
                    to="/user/task?add-task-dialog=yes"
                >
                    <LucidePlus className="h-3.5 w-3.5 text-violet-600" strokeWidth={2} />
                </Link>
                <button
                    type="button"
                    className={panelIconBtn}
                    title="Previous"
                    disabled={currentTaskIndex <= 0}
                    onClick={() => setCurrentTaskIndex(currentTaskIndex - 1)}
                >
                    <LucideChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <span className="rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-800">
                    {currentTaskIndex + 1} / {taskArr.length}
                </span>
                <button
                    type="button"
                    className={panelIconBtn}
                    title="Next"
                    disabled={currentTaskIndex >= taskArr.length - 1}
                    onClick={() => setCurrentTaskIndex(currentTaskIndex + 1)}
                >
                    <LucideChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>
            <div>
                <p className="mb-1 flex items-start gap-1.5 text-xs font-semibold text-zinc-900">
                    {taskArr[currentTaskIndex]?.isTaskPinned && (
                        <LucidePin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" strokeWidth={2} />
                    )}
                    {taskArr[currentTaskIndex]?.title}
                </p>
                {taskArr[currentTaskIndex]?.subTaskArr.length > 0 && (
                    <p className={`${mutedText} mb-1`}>
                        {taskArr[currentTaskIndex]?.subTaskArr.filter((s) => s.taskCompletedStatus).length}{' '}
                        / {taskArr[currentTaskIndex]?.subTaskArr.length} subtasks
                    </p>
                )}
                <ul className="space-y-1">
                    {taskArr[currentTaskIndex]?.subTaskArr.map((subTask) => (
                        <li
                            key={subTask._id}
                            className={`flex items-center gap-1.5 text-[11px] ${
                                subTask.taskCompletedStatus
                                    ? 'text-zinc-400 line-through'
                                    : 'text-zinc-700'
                            }`}
                        >
                            {subTask.taskCompletedStatus ? (
                                <LucideSquareCheck className="h-3.5 w-3.5 shrink-0 text-violet-500" strokeWidth={2} />
                            ) : (
                                <LucideSquare className="h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={2} />
                            )}
                            {subTask.title}
                        </li>
                    ))}
                </ul>
                <div className="mt-2">
                    <Link
                        to={`/user/task?workspace=${taskArr[currentTaskIndex]?.taskWorkspaceId}&edit-task-id=${taskArr[currentTaskIndex]?._id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-800 transition hover:bg-violet-100"
                    >
                        <LucideEdit className="h-3 w-3" strokeWidth={2} />
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ComponentPinnedTask;
