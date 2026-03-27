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
    'rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2.5 shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:shadow-lg hover:shadow-sky-200/40';
const panelTitle = 'flex items-center gap-1.5 text-xs font-bold text-sky-900';
const panelIconBtn =
    'rounded-xl border-2 border-sky-200/70 bg-sky-50/80 p-1 text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 disabled:opacity-40';
const mutedText = 'text-[11px] leading-snug font-medium text-sky-700/75';

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
        <div className={`${panel} border-l-4 border-l-indigo-400`}>
            <h2 className={`${panelTitle} mb-1.5`}>
                <Link to="/user/task" className="flex items-center gap-1.5 hover:text-indigo-700">
                    <LucideList className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2} />
                    Pinned tasks
                </Link>
            </h2>
            <div className="mb-2 flex flex-wrap items-center gap-1">
                <Link
                    className={panelIconBtn}
                    title="Add task"
                    to="/user/task?add-task-dialog=yes"
                >
                    <LucidePlus className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2} />
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
                <span className="rounded-lg border-2 border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
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
                <p className="mb-1 flex items-start gap-1.5 text-xs font-bold text-sky-950">
                    {taskArr[currentTaskIndex]?.isTaskPinned && (
                        <LucidePin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />
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
                                    ? 'text-sky-400 line-through'
                                    : 'text-sky-800'
                            }`}
                        >
                            {subTask.taskCompletedStatus ? (
                                <LucideSquareCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />
                            ) : (
                                <LucideSquare className="h-3.5 w-3.5 shrink-0 text-sky-300" strokeWidth={2} />
                            )}
                            {subTask.title}
                        </li>
                    ))}
                </ul>
                <div className="mt-2">
                    <Link
                        to={`/user/task?workspace=${taskArr[currentTaskIndex]?.taskWorkspaceId}&edit-task-id=${taskArr[currentTaskIndex]?._id}`}
                        className="inline-flex items-center gap-1 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-800 transition hover:bg-indigo-100"
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
