import { LucideBrain, LucideLightbulb, LucideLoader2, LucideRefreshCcw, LucideZap } from "lucide-react";
import { useEffect, useState } from "react";
import axiosCustom from "../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const fetchRevailateAIDiary = async ({
    summaryDate,
    summaryType,
}: {
    summaryDate: string;
    summaryType: 'daily' | 'weekly' | 'monthly';
}) => {
    try {
        await axiosCustom.post('/api/suggestions/crud/ai-daily-diary-revalidate', {
            summaryDate: summaryDate,
            summaryType: summaryType,
        });
    } catch (error) {
        console.error('Error fetching daily AI diary:', error);
    }
};

const AiSuggestions = () => {

    const renderHeading = () => {
        return (
            <div className="mb-2 p-2.5 md:p-3 rounded-lg shadow text-white bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideBrain className="w-6 h-6 md:w-7 md:h-7" />
                    <h1 className="text-xl md:text-2xl font-bold">AI Suggestions</h1>
                </div>
                <p className="text-xs md:text-sm opacity-95">
                    Personalized recommendations based on best practices and productivity insights
                </p>
            </div>
        )
    }

    return (
        <div
            className="container mx-auto py-4 px-1"
            style={{
                maxWidth: '1200px',
            }}
        >
            {renderHeading()}
            <AiSuggestionsDiary />
            <AiTaskSuggestions />
        </div>
    )
};

const AiSuggestionsDiary = () => {

    const [stateRevailateAIAll, setStateRevailateAIAll] = useState({
        loading: false,
    });
    const [dailyAiDiary, setDailyAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [yesterdayAiDiary, setYesterdayAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [currentWeekAiDiary, setCurrentWeekAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [lastWeekAiDiary, setLastWeekAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [currentMonthAiDiary, setCurrentMonthAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [lastMonthAiDiary, setLastMonthAiDiary] = useState({
        content: '',
        lifeEventId: '',
    });
    const [showDaily, setShowDaily] = useState(true);
    const [showYesterday, setShowYesterday] = useState(true);
    const [showWeekly, setShowWeekly] = useState(true);
    const [showMonthly, setShowMonthly] = useState(true);
    const [showLastWeek, setShowLastWeek] = useState(true);
    const [showLastMonth, setShowLastMonth] = useState(true);

    useEffect(() => {
        fetchAllSummaries();
    }, []);

    const fetchAllSummaries = async () => {
        try {
            const response = await axiosCustom.get('/api/suggestions/crud/ai-summary-get');
            if (response.data && response.data.data) {
                const data = response.data.data;
                
                if (data.summaryToday) {
                    setDailyAiDiary({
                        content: data.summaryToday.description || '',
                        lifeEventId: data.summaryToday._id || '',
                    });
                }
                
                if (data.summaryYesterday) {
                    setYesterdayAiDiary({
                        content: data.summaryYesterday.description || '',
                        lifeEventId: data.summaryYesterday._id || '',
                    });
                }
                
                if (data.summaryCurrentWeek) {
                    setCurrentWeekAiDiary({
                        content: data.summaryCurrentWeek.description || '',
                        lifeEventId: data.summaryCurrentWeek._id || '',
                    });
                }
                
                if (data.summaryLastWeek) {
                    setLastWeekAiDiary({
                        content: data.summaryLastWeek.description || '',
                        lifeEventId: data.summaryLastWeek._id || '',
                    });
                }
                
                if (data.summaryCurrentMonth) {
                    setCurrentMonthAiDiary({
                        content: data.summaryCurrentMonth.description || '',
                        lifeEventId: data.summaryCurrentMonth._id || '',
                    });
                }
                
                if (data.summaryLastMonth) {
                    setLastMonthAiDiary({
                        content: data.summaryLastMonth.description || '',
                        lifeEventId: data.summaryLastMonth._id || '',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching AI summaries:', error);
        }
    };

    const fetchRevailateAIAll = async () => {
        setStateRevailateAIAll({
            loading: true,
        });
        try {
            // today
            await fetchRevailateAIDiary({
                summaryDate: new Date().toISOString(),
                summaryType: 'daily',
            });
            // Refresh all summaries
            await fetchAllSummaries();

            // yesterday
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf() - 1000 * 60 * 60 * 24
                ).toISOString(),
                summaryType: 'daily',
            });
            // Refresh all summaries
            await fetchAllSummaries();

            // current week
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf()
                ).toISOString(),
                summaryType: 'weekly',
            });
            // Refresh all summaries
            await fetchAllSummaries();

            // past week
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf() - 1000 * 60 * 60 * 24 * 7
                ).toISOString(),
                summaryType: 'weekly',
            });
            // Refresh all summaries
            await fetchAllSummaries();

            // current month
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf()
                ).toISOString(),
                summaryType: 'monthly',
            });
            // Refresh all summaries
            await fetchAllSummaries();

            // past month
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf() - 1000 * 60 * 60 * 24 * 30
                ).toISOString(),
                summaryType: 'monthly',
            });

            // Refresh all summaries
            await fetchAllSummaries();
        } catch (error) {
            console.error('Error fetching daily AI diary:', error);
        } finally {
            setStateRevailateAIAll({
                loading: false,
            });
        }
    };

    return (
        <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <LucideLightbulb className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm md:text-base font-bold text-gray-800">
                    AI Diaries
                    {stateRevailateAIAll.loading && (
                        <LucideLoader2 className="w-4 h-4 text-gray-600 inline-block ml-1 animate-spin" />
                    )}
                    {!stateRevailateAIAll.loading && (
                        <LucideRefreshCcw
                            className="w-4 h-4 text-gray-600 inline-block ml-1 cursor-pointer hover:text-gray-800"
                            onClick={fetchRevailateAIAll}
                        />
                    )}
                </h2>
            </div>

            <div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {yesterdayAiDiary.content && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showYesterday} onChange={e => setShowYesterday(e.target.checked)} />
                            Yesterday
                        </label>
                    )}
                    {dailyAiDiary.content && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showDaily} onChange={e => setShowDaily(e.target.checked)} />
                            Today
                        </label>
                    )}
                    {lastWeekAiDiary.content && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showLastWeek} onChange={e => setShowLastWeek(e.target.checked)} />
                            Last week
                        </label>
                    )}
                    {currentWeekAiDiary.content && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showWeekly} onChange={e => setShowWeekly(e.target.checked)} />
                            This week
                        </label>
                    )}
                    {lastMonthAiDiary.content && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showLastMonth} onChange={e => setShowLastMonth(e.target.checked)} />
                            Last month
                        </label>
                    )}
                    {currentMonthAiDiary.content && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showMonthly} onChange={e => setShowMonthly(e.target.checked)} />
                            This month
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {/* Daily Diary - Yesterday */}
                    {showYesterday && yesterdayAiDiary.content && (
                        <div className="p-2 rounded border border-cyan-200 bg-cyan-50">
                            <p className="text-xs text-gray-600">
                                {new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toLocaleDateString()}
                            </p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                Yesterday
                                {yesterdayAiDiary.lifeEventId && (
                                    <Link 
                                        to={`/user/life-events?action=edit&id=${yesterdayAiDiary.lifeEventId}`}
                                        className="ml-2 text-cyan-600 hover:text-cyan-800 text-xs"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{yesterdayAiDiary.content}</div>
                        </div>
                    )}

                    {/* Daily Diary - Today */}
                    {showDaily && dailyAiDiary.content && (
                        <div className="p-2 rounded border border-cyan-200 bg-cyan-50">
                            <p className="text-xs text-gray-600">
                                {new Date().toLocaleDateString()}
                            </p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                Today
                                {dailyAiDiary.lifeEventId && (
                                    <Link 
                                        to={`/user/life-events?action=edit&id=${dailyAiDiary.lifeEventId}`}
                                        className="ml-2 text-cyan-600 hover:text-cyan-800 text-xs"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{dailyAiDiary.content}</div>
                        </div>
                    )}

                    {/* Weekly Diary - Last Week */}
                    {showLastWeek && lastWeekAiDiary.content && (
                        <div className="p-2 rounded border border-amber-200 bg-amber-50">
                            <p className="text-xs text-gray-600">Last Week</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                AI Last Week Diary
                                {lastWeekAiDiary.lifeEventId && (
                                    <Link 
                                        to={`/user/life-events?action=edit&id=${lastWeekAiDiary.lifeEventId}`}
                                        className="ml-2 text-amber-600 hover:text-amber-800 text-xs"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{lastWeekAiDiary.content}</div>
                        </div>
                    )}

                    {/* Weekly Diary - This Week */}
                    {showWeekly && currentWeekAiDiary.content && (
                        <div className="p-2 rounded border border-blue-200 bg-blue-50">
                            <p className="text-xs text-gray-600">This Week</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                AI Weekly Diary
                                {currentWeekAiDiary.lifeEventId && (
                                    <Link 
                                        to={`/user/life-events?action=edit&id=${currentWeekAiDiary.lifeEventId}`}
                                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{currentWeekAiDiary.content}</div>
                        </div>
                    )}

                    {/* Monthly Diary - Last Month */}
                    {showLastMonth && lastMonthAiDiary.content && (
                        <div className="p-2 rounded border border-indigo-200 bg-indigo-50">
                            <p className="text-xs text-gray-600">Last Month</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                AI Last Month Diary
                                {lastMonthAiDiary.lifeEventId && (
                                    <Link 
                                        to={`/user/life-events?action=edit&id=${lastMonthAiDiary.lifeEventId}`}
                                        className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{lastMonthAiDiary.content}</div>
                        </div>
                    )}

                    {/* Monthly Diary - This Month */}
                    {showMonthly && currentMonthAiDiary.content && (
                        <div className="p-2 rounded border border-purple-200 bg-purple-50">
                            <p className="text-xs text-gray-600">This Month</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                AI Monthly Diary
                                {currentMonthAiDiary.lifeEventId && (
                                    <Link 
                                        to={`/user/life-events?action=edit&id=${currentMonthAiDiary.lifeEventId}`}
                                        className="ml-2 text-purple-600 hover:text-purple-800 text-xs"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-gray-700"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{currentMonthAiDiary.content}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface TaskSuggestion {
    _id?: string;
    isTask: string;
    taskTitle: string;
    taskAiSuggestion: string;
    taskDescription: string;
    taskStatus: string;
    taskPriority: 'high' | 'medium' | 'low';
    taskDueDate: string;
    taskTags: string[];
    taskSubtasks: any[];

    taskWorkspaceId: string;
    taskWorkspaceName: string;

    isAdded: boolean;
}

const AiTaskSuggestions = () => {
    const [
        requestAiTaskSuggestions,
        setRequestAiTaskSuggestions
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });
    const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);

    const [
        randomNum,
        setRandomNum
    ] = useState(Math.random());

    useEffect(() => {
        const controller = new AbortController();
        fetchTaskSuggestions(controller.signal);

        return () => {
            controller.abort();
        };
    }, [randomNum]);

    const fetchTaskSuggestions = async (signal?: AbortSignal) => {
        setRequestAiTaskSuggestions({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const response = await axiosCustom.get('/api/suggestions/crud/get-ai-task-suggestions', {
                signal
            });
            if (response.data.data.docs.length > 0) {
                setTaskSuggestions(response.data.data.docs);
                setRequestAiTaskSuggestions({
                    loading: false,
                    success: 'Task suggestions fetched successfully',
                    error: '',
                });
            } else {
                setRequestAiTaskSuggestions({
                    loading: false,
                    success: '',
                    error: 'No task suggestions found',
                });
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
                // Request was cancelled, don't update state
                return;
            }
            console.error('Error fetching task suggestions:', error);

            setRequestAiTaskSuggestions({
                loading: false,
                success: '',
                error: 'Error fetching task suggestions',
            });
        }
    }

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'high':
                return 'bg-red-50 text-red-700 border border-red-300';
            case 'medium':
                return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
            case 'low':
                return 'bg-green-50 text-green-700 border border-green-300';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-300';
        }
    };

    const formatDueDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const addTask = async (task: TaskSuggestion) => {
        try {
            const newTask = {
                title: task.taskTitle,
                description: task.taskDescription,
                completed: false,
                list: 'To Do',
                comments: [],
                status: 'todo',
                dueDate: task.taskDueDate,
                labels: task.taskTags || [],
                priority: task.taskPriority,
                isArchived: false,
                isCompleted: false,
                taskWorkspaceId: task.taskWorkspaceId,
                taskStatusId: '',
                reminderPresetTimeLabel: 'before-1-day',
            };

            const config = {
                method: 'post',
                url: '/api/task/crud/taskAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(newTask)
            };

            const resTask = await axiosCustom.request(config);
            console.log('response', resTask);

            const docTask = resTask.data;
            console.log('docTask', docTask);
            console.log('typeof docTask._id', typeof docTask._id);
            console.log('docTask._id.length', docTask._id.length);

            if (typeof docTask._id === 'string' && docTask._id.length === 24) {
                console.log('docTask._id is valid');
                setTaskSuggestions(prevTaskSuggestions => {
                    return prevTaskSuggestions.map(task => {
                        if (task.taskTitle === docTask.title) {
                            return {
                                ...task,
                                isAdded: true,
                                _id: docTask._id,
                                taskWorkspaceId: docTask.taskWorkspaceId,
                            };
                        }
                        return task;
                    });
                });
            }

            // Optional: Show success message or redirect
            toast.success('Task added successfully!');
        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Failed to add task. Please try again.');
        }
    }

    return (
        <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <LucideZap className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm md:text-base font-bold text-gray-800">AI Task Suggestions</h2>
            </div>
            <button
                onClick={() => {
                    setRandomNum(Math.random());
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >Refresh</button>

            {requestAiTaskSuggestions.loading && (
                <div className="border border-gray-200 rounded p-2 my-2 text-center">
                    <p className="text-xs text-gray-600">
                        <LucideLoader2 className="w-4 h-4 text-gray-600 inline-block ml-1 animate-spin inline-block mr-1" 
                            style={{
                                marginTop: '-2.5px',
                            }}
                        />
                        Loading task suggestions...
                    </p>
                    <p>It may take a 10-15 seconds to load.</p>
                </div>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.success.length > 0 && (
                <p className="text-xs text-green-600 border border-green-200 rounded p-2 my-2 bg-green-50">{requestAiTaskSuggestions.success}</p>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.error.length > 0 && (
                <p className="text-xs text-red-600 border border-red-200 rounded p-2 my-2 bg-red-50">{requestAiTaskSuggestions.error}</p>
            )}

            {/* list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {taskSuggestions.map((task: TaskSuggestion, index: number) => {                    
                    return (
                        <div key={task._id || index} className="p-2 rounded border border-gray-200 bg-gray-50">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <p className={`text-xs md:text-sm text-gray-800 font-medium mb-1`}>
                                        {task.taskTitle}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                        {task.taskDescription}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 mb-2">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                            {task.taskWorkspaceName}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                            Due {formatDueDate(task.taskDueDate)}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPriorityColor(task.taskPriority)}`}>
                                            {task.taskPriority} priority
                                        </span>
                                        {task.taskTags && task.taskTags.length > 0 && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-300">
                                                {task.taskTags[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {task.isAdded}
                                {task.isAdded && (
                                    <div className="text-xs text-green-600 border border-green-200 rounded p-2 my-2 bg-green-50">
                                        <p className="mb-1">Task added successfully!</p>
                                        <a 
                                            href={`/user/task?workspace=${task.taskWorkspaceId}&edit-task-id=${task._id}`}
                                            className="text-blue-600 hover:text-blue-800 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Task
                                        </a>
                                    </div>
                                )}
                                {!task.isAdded && (
                                    <button
                                        onClick={() => addTask(task)}
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded w-full"
                                    >
                                        Add Task
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};

export default AiSuggestions;