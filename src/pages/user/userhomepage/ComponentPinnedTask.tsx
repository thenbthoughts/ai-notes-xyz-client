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
    LucideRefreshCw,
    LucideInbox,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import axiosCustom from '../../../config/axiosCustom';
import { tsPageTask } from '../../../types/pages/tsPageTaskList';
import { panel, panelTitle, panelIconBtn, mutedText } from './homepagePanelStyles';

const ComponentPinnedTask = ({ refreshKey }: { refreshKey?: number }) => {
    const [taskArr, setTaskArr] = useState([] as tsPageTask[]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchHomepageTask = async () => {
        setIsLoading(true);
        try {
            const response = await axiosCustom.get(`/api/dashboard/suggest-tasks/task-get-suggestions`);
            const arr = response.data.docs;
            setTaskArr(arr as tsPageTask[]);
            setLastUpdated(new Date());
            setCurrentTaskIndex((prev) => {
                if (prev >= (arr as tsPageTask[]).length) {
                    return 0;
                }
                return prev;
            });
        } catch (error) {
            console.error('Error fetching homepage task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchHomepageTask();
    }, [refreshKey]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
            setCurrentTaskIndex((prev) => {
                if (prev <= 0) {
                    return prev;
                }
                return prev - 1;
            });
        }
        if (event.key === 'ArrowRight') {
            setCurrentTaskIndex((prev) => {
                if (prev >= taskArr.length - 1) {
                    return prev;
                }
                return prev + 1;
            });
        }
    };

    const handlePrev = () => {
        setCurrentTaskIndex((prev) => {
            if (prev <= 0) {
                return prev;
            }
            return prev - 1;
        });
    };

    const handleNext = () => {
        setCurrentTaskIndex((prev) => {
            if (prev >= taskArr.length - 1) {
                return prev;
            }
            return prev + 1;
        });
    };

    if (isLoading) {
        return (
            <div className={`${panel} border-l-4 border-l-indigo-400`}>
                <h2 className={`${panelTitle} mb-1.5`}>
                    <LucideList className="h-3.5 w-3.5 text-indigo-400" strokeWidth={2} />
                    Pinned tasks
                </h2>
                <div className="space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800/60" style={{ animationDelay: '0ms' }} />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/60" style={{ animationDelay: '120ms' }} />
                    <div className="h-16 animate-pulse rounded-xl bg-zinc-800/50" style={{ animationDelay: '240ms' }} />
                </div>
            </div>
        );
    }

    if (taskArr.length === 0) {
        return (
            <div className={`${panel} border-l-4 border-l-indigo-400`}>
                <div className="mb-1.5 flex items-center justify-between gap-1">
                    <h2 className={panelTitle}>
                        <Link to="/user/task" className="flex items-center gap-1.5 hover:text-indigo-300">
                            <LucideList className="h-3.5 w-3.5 text-indigo-400" strokeWidth={2} />
                            Pinned tasks
                        </Link>
                    </h2>
                    <button
                        type="button"
                        onClick={() => {
                            void fetchHomepageTask();
                        }}
                        className={panelIconBtn}
                        aria-label="Refresh pinned tasks"
                        title="Refresh"
                    >
                        <LucideRefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                </div>
                {lastUpdated && (
                    <p className="mb-2 text-[10px] font-medium text-zinc-500">Updated {lastUpdated.toLocaleTimeString()}</p>
                )}
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-800/30 px-3 py-6 text-center">
                    <LucideInbox className="h-6 w-6 text-zinc-500" strokeWidth={2} />
                    <p className="text-xs font-semibold text-zinc-300">No pinned tasks yet</p>
                    <p className={mutedText}>Pin a task to keep it here for quick access.</p>
                    <Link
                        to="/user/task?add-task-dialog=yes"
                        className="mt-1 inline-flex items-center gap-1 rounded-xl border-2 border-indigo-700 bg-indigo-950/50 px-2 py-1 text-[11px] font-bold text-indigo-200 transition hover:bg-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <LucidePlus className="h-3 w-3" strokeWidth={2} />
                        Add task
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`${panel} border-l-4 border-l-indigo-400`} tabIndex={0} onKeyDown={handleKeyDown} aria-label="Pinned tasks carousel">
            <h2 className={`${panelTitle} mb-1.5`}>
                <Link to="/user/task" className="flex items-center gap-1.5 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                    <LucideList className="h-3.5 w-3.5 text-indigo-400" strokeWidth={2} />
                    Pinned tasks
                </Link>
            </h2>
            <div className="mb-2 flex flex-wrap items-center gap-1">
                <Link
                    className={`${panelIconBtn} focus-visible:ring-indigo-500`}
                    title="Add task"
                    aria-label="Add task"
                    to="/user/task?add-task-dialog=yes"
                >
                    <LucidePlus className="h-3.5 w-3.5 text-indigo-400" strokeWidth={2} />
                </Link>
                <button
                    type="button"
                    className={panelIconBtn}
                    aria-label="Previous pinned task"
                    title="Previous"
                    disabled={currentTaskIndex <= 0}
                    onClick={handlePrev}
                >
                    <LucideChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <span className="rounded-lg border-2 border-indigo-700 bg-indigo-950/50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-200" title={`${currentTaskIndex + 1} of ${taskArr.length} pinned tasks`}>
                    {currentTaskIndex + 1} / {taskArr.length}
                </span>
                <button
                    type="button"
                    className={panelIconBtn}
                    aria-label="Next pinned task"
                    title="Next"
                    disabled={currentTaskIndex >= taskArr.length - 1}
                    onClick={handleNext}
                >
                    <LucideChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                    type="button"
                    className={panelIconBtn}
                    aria-label="Refresh pinned tasks"
                    title="Refresh"
                    onClick={() => {
                        void fetchHomepageTask();
                    }}
                >
                    <LucideRefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>
            {lastUpdated && (
                <p className="mb-2 text-[10px] font-medium text-zinc-500">Updated {lastUpdated.toLocaleTimeString()}</p>
            )}
            <div>
                <p className="mb-1 flex items-start gap-1.5 text-xs font-bold text-sky-100">
                    {taskArr[currentTaskIndex]?.isTaskPinned && (
                        <LucidePin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />
                    )}
                    {taskArr[currentTaskIndex]?.title}
                </p>
                {taskArr[currentTaskIndex]?.subTaskArr.length > 0 && (
                    <p className={`${mutedText} mb-1`} title={`${taskArr[currentTaskIndex]?.subTaskArr.filter((s) => {
                        return s.taskCompletedStatus;
                    }).length} of ${taskArr[currentTaskIndex]?.subTaskArr.length} subtasks completed`}>
                        {taskArr[currentTaskIndex]?.subTaskArr.filter((s) => {
                            return s.taskCompletedStatus;
                        }).length} / {taskArr[currentTaskIndex]?.subTaskArr.length} subtasks
                    </p>
                )}
                <ul className="space-y-1">
                    {taskArr[currentTaskIndex]?.subTaskArr.map((subTask) => {
                        return (
                            <li
                                key={subTask._id}
                            className={`flex items-center gap-1.5 text-[11px] ${
                                subTask.taskCompletedStatus ? 'text-sky-500 line-through' : 'text-sky-200'
                            }`}
                        >
                            {subTask.taskCompletedStatus ? (
                                <LucideSquareCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />
                            ) : (
                                <LucideSquare className="h-3.5 w-3.5 shrink-0 text-sky-500" strokeWidth={2} />
                            )}
                            {subTask.title}
                        </li>
                        );
                    })}
                </ul>
                <div className="mt-2">
                    <Link
                        to={`/user/task?workspace=${taskArr[currentTaskIndex]?.taskWorkspaceId}&edit-task-id=${taskArr[currentTaskIndex]?._id}`}
                        className="inline-flex items-center gap-1 rounded-xl border-2 border-indigo-700 bg-indigo-950/50 px-2 py-1 text-[10px] font-bold text-indigo-200 transition hover:bg-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label={`Edit task ${taskArr[currentTaskIndex]?.title}`}
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
