import { LucideLightbulb, LucideLoader2, LucideRefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
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
        <div className="mb-2 rounded-sm border border-zinc-200 bg-white p-2 shadow-sm md:p-3">
            <div className="mb-2 flex items-center gap-2">
                <LucideLightbulb className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />
                <h2 className="text-sm font-semibold text-zinc-900">AI diaries</h2>
                {stateRevailateAIAll.loading && (
                    <LucideLoader2 className="ml-auto h-4 w-4 animate-spin text-zinc-500" strokeWidth={2} />
                )}
                {!stateRevailateAIAll.loading && (
                    <button
                        type="button"
                        title="Regenerate diaries"
                        className="ml-auto rounded-sm border border-zinc-200 bg-white p-1 text-zinc-600 hover:bg-zinc-50"
                        onClick={() => void fetchRevailateAIAll()}
                    >
                        <LucideRefreshCcw className="h-4 w-4" strokeWidth={2} />
                    </button>
                )}
            </div>

            <div>
                <div className="mb-2 flex flex-wrap gap-1">
                    {dailyAiDiary.content && (
                        <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-800">
                            <input
                                type="checkbox"
                                checked={showDaily}
                                onChange={(e) => setShowDaily(e.target.checked)}
                                className="rounded-sm border-zinc-300 text-indigo-600"
                            />
                            Today
                        </label>
                    )}
                    {yesterdayAiDiary.content && (
                        <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-800">
                            <input
                                type="checkbox"
                                checked={showYesterday}
                                onChange={(e) => setShowYesterday(e.target.checked)}
                                className="rounded-sm border-zinc-300 text-indigo-600"
                            />
                            Yesterday
                        </label>
                    )}
                    {currentWeekAiDiary.content && (
                        <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-800">
                            <input
                                type="checkbox"
                                checked={showWeekly}
                                onChange={(e) => setShowWeekly(e.target.checked)}
                                className="rounded-sm border-zinc-300 text-indigo-600"
                            />
                            This week
                        </label>
                    )}
                    {lastWeekAiDiary.content && (
                        <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-800">
                            <input
                                type="checkbox"
                                checked={showLastWeek}
                                onChange={(e) => setShowLastWeek(e.target.checked)}
                                className="rounded-sm border-zinc-300 text-indigo-600"
                            />
                            Last week
                        </label>
                    )}
                    {currentMonthAiDiary.content && (
                        <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-800">
                            <input
                                type="checkbox"
                                checked={showMonthly}
                                onChange={(e) => setShowMonthly(e.target.checked)}
                                className="rounded-sm border-zinc-300 text-indigo-600"
                            />
                            This month
                        </label>
                    )}
                    {lastMonthAiDiary.content && (
                        <label className="flex cursor-pointer items-center gap-1 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-800">
                            <input
                                type="checkbox"
                                checked={showLastMonth}
                                onChange={(e) => setShowLastMonth(e.target.checked)}
                                className="rounded-sm border-zinc-300 text-indigo-600"
                            />
                            Last month
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {/* Daily Diary - Today */}
                    {showDaily && dailyAiDiary.content && (
                        <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                            <p className="text-xs text-zinc-500">
                                {new Date().toLocaleDateString()}
                            </p>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                                Today
                                {dailyAiDiary.lifeEventId && (
                                    <Link
                                        to={`/user/life-events?action=edit&id=${dailyAiDiary.lifeEventId}`}
                                        className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs text-zinc-800"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{dailyAiDiary.content}</div>
                        </div>
                    )}

                    {/* Daily Diary - Yesterday */}
                    {showYesterday && yesterdayAiDiary.content && (
                        <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                            <p className="text-xs text-zinc-500">
                                {new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toLocaleDateString()}
                            </p>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                                Yesterday
                                {yesterdayAiDiary.lifeEventId && (
                                    <Link
                                        to={`/user/life-events?action=edit&id=${yesterdayAiDiary.lifeEventId}`}
                                        className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs text-zinc-800"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{yesterdayAiDiary.content}</div>
                        </div>
                    )}

                    {/* Weekly Diary - This Week */}
                    {showWeekly && currentWeekAiDiary.content && (
                        <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                            <p className="text-xs text-zinc-500">This Week</p>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                                AI Weekly Diary
                                {currentWeekAiDiary.lifeEventId && (
                                    <Link
                                        to={`/user/life-events?action=edit&id=${currentWeekAiDiary.lifeEventId}`}
                                        className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs text-zinc-800"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{currentWeekAiDiary.content}</div>
                        </div>
                    )}

                    {/* Weekly Diary - Last Week */}
                    {showLastWeek && lastWeekAiDiary.content && (
                        <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                            <p className="text-xs text-zinc-500">Last Week</p>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                                AI Last Week Diary
                                {lastWeekAiDiary.lifeEventId && (
                                    <Link
                                        to={`/user/life-events?action=edit&id=${lastWeekAiDiary.lifeEventId}`}
                                        className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs text-zinc-800"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{lastWeekAiDiary.content}</div>
                        </div>
                    )}

                    {/* Monthly Diary - This Month */}
                    {showMonthly && currentMonthAiDiary.content && (
                        <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                            <p className="text-xs text-zinc-500">This Month</p>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                                AI Monthly Diary
                                {currentMonthAiDiary.lifeEventId && (
                                    <Link
                                        to={`/user/life-events?action=edit&id=${currentMonthAiDiary.lifeEventId}`}
                                        className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs text-zinc-800"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{currentMonthAiDiary.content}</div>
                        </div>
                    )}

                    {/* Monthly Diary - Last Month */}
                    {showLastMonth && lastMonthAiDiary.content && (
                        <div className="rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                            <p className="text-xs text-zinc-500">Last Month</p>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                                AI Last Month Diary
                                {lastMonthAiDiary.lifeEventId && (
                                    <Link
                                        to={`/user/life-events?action=edit&id=${lastMonthAiDiary.lifeEventId}`}
                                        className="ml-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                )}
                            </h3>
                            <div className="whitespace-pre-wrap text-xs text-zinc-800"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{lastMonthAiDiary.content}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AiSuggestionsDiary;