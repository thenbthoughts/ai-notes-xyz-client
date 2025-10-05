import { LucideBrain, LucideLightbulb, LucideLoader2, LucideRefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import axiosCustom from "../../../../config/axiosCustom";

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
    const [showDaily, setShowDaily] = useState(true);
    const [showYesterday, setShowYesterday] = useState(true);
    const [showWeekly, setShowWeekly] = useState(false);
    const [showMonthly, setShowMonthly] = useState(false);
    const [showLastWeek, setShowLastWeek] = useState(false);
    const [showLastMonth, setShowLastMonth] = useState(false);

    useEffect(() => {
        fetchDailyAiDiaryToday();
        fetchDailyAiDiaryYesterday();
    }, []);

    const fetchDailyAiDiaryToday = async () => {
        try {
            const response = await axiosCustom.get('/api/suggestions/crud/ai-daily-diary-get-today-summary');
            if (response.data && response.data.docs && response.data.docs.length > 0) {
                const todayDiary = response.data.docs[0];
                setDailyAiDiary({
                    content: todayDiary.aiSummary || todayDiary.description || '',
                    lifeEventId: todayDiary._id || '',
                });
            }
        } catch (error) {
            console.error('Error fetching daily AI diary:', error);
        }
    }

    const fetchDailyAiDiaryYesterday = async () => {
        try {
            const response = await axiosCustom.get('/api/suggestions/crud/ai-daily-diary-get-yesterday-summary');
            if (response.data && response.data.docs && response.data.docs.length > 0) {
                const yesterdayDiary = response.data.docs[0];
                setYesterdayAiDiary({
                    content: yesterdayDiary.aiSummary || yesterdayDiary.description || '',
                    lifeEventId: yesterdayDiary._id || '',
                });
            }
        } catch (error) {
            console.error('Error fetching daily AI diary:', error);
        }
    }

    const fetchRevailateAIAll = async () => {
        setStateRevailateAIAll({
            loading: true,
        });
        try {
            await fetchRevailateAIDiary({
                summaryDate: new Date().toISOString(),
                summaryType: 'daily',
            });
            await fetchDailyAiDiaryToday();
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf() - 1000 * 60 * 60 * 24
                ).toISOString(),
                summaryType: 'daily',
            });
            await fetchDailyAiDiaryYesterday();
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
                            className="w-4 h-4 text-gray-600 inline-block ml-1"
                            onClick={fetchRevailateAIAll}
                        />
                    )}
                </h2>
            </div>

            <div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {yesterdayAiDiary.content.length >= 1 && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showYesterday} onChange={e => setShowYesterday(e.target.checked)} />
                            Yesterday
                        </label>
                    )}
                    {dailyAiDiary.content.length >= 1 && (
                        <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={showDaily} onChange={e => setShowDaily(e.target.checked)} />
                            Today
                        </label>
                    )}
                    <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                        <input type="checkbox" checked={showLastWeek} onChange={e => setShowLastWeek(e.target.checked)} />
                        Last week
                    </label>
                    <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                        <input type="checkbox" checked={showWeekly} onChange={e => setShowWeekly(e.target.checked)} />
                        This week
                    </label>
                    <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                        <input type="checkbox" checked={showLastMonth} onChange={e => setShowLastMonth(e.target.checked)} />
                        Last month
                    </label>
                    <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                        <input type="checkbox" checked={showMonthly} onChange={e => setShowMonthly(e.target.checked)} />
                        This month
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {/* Daily Diary - Yesterday */}
                    {showYesterday && yesterdayAiDiary.content.length >= 1 && (
                        <div className="p-2 rounded border border-cyan-200 bg-cyan-50">
                            <p className="text-xs text-gray-600">
                                {new Date(
                                    new Date().valueOf() - 1000 * 60 * 60 * 24
                                ).toLocaleDateString()}
                            </p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                Yesterday
                            </h3>
                            <div className="whitespace-pre-wrap"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{yesterdayAiDiary.content}</div>
                        </div>
                    )}

                    {/* Daily Diary - Today */}
                    {showDaily && dailyAiDiary.content.length >= 1 && (
                        <div className="p-2 rounded border border-cyan-200 bg-cyan-50">
                            <p className="text-xs text-gray-600">
                                {new Date().toLocaleDateString()}
                            </p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                                Today
                            </h3>
                            <div className="whitespace-pre-wrap"
                                style={{
                                    overflowY: 'auto',
                                    maxHeight: '250px',
                                }}
                            >{dailyAiDiary.content}</div>
                        </div>
                    )}

                    {/* {showWeekly && (
                        <div className="p-2 rounded border border-blue-200 bg-blue-50">
                            <p className="text-xs text-gray-600">This Week</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">AI Weekly Diary</h3>
                            <ul className="text-xs md:text-sm text-gray-700 space-y-1 list-disc ml-4">
                                <li>Productivity: Pomodoro x5 days, time-block daily</li>
                                <li>Learning: 3 active-recall sessions</li>
                                <li>Finance: Friday spending review</li>
                            </ul>
                        </div>
                    )}
                    {showMonthly && (
                        <div className="p-2 rounded border border-purple-200 bg-purple-50">
                            <p className="text-xs text-gray-600">This Month</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">AI Monthly Diary</h3>
                            <ul className="text-xs md:text-sm text-gray-700 space-y-1 list-disc ml-4">
                                <li>Habits: solidify morning routine</li>
                                <li>Goal: save $500 toward emergency fund</li>
                                <li>Learning: finish 2 books</li>
                            </ul>
                        </div>
                    )}
                    {showLastWeek && (
                        <div className="p-2 rounded border border-amber-200 bg-amber-50">
                            <p className="text-xs text-gray-600">Last Week</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">AI Last Week Diary</h3>
                            <ul className="text-xs md:text-sm text-gray-700 space-y-1 list-disc ml-4">
                                <li>Completed: 18 tasks, 7 notes</li>
                                <li>Focus: 15 Pomodoros, 80% adherence</li>
                                <li>Next-up: improve planning accuracy</li>
                            </ul>
                        </div>
                    )}
                    {showLastMonth && (
                        <div className="p-2 rounded border border-indigo-200 bg-indigo-50">
                            <p className="text-xs text-gray-600">Last Month</p>
                            <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">AI Last Month Diary</h3>
                            <ul className="text-xs md:text-sm text-gray-700 space-y-1 list-disc ml-4">
                                <li>Achievements: completed 3 major projects</li>
                                <li>Habits: 85% consistency with morning routine</li>
                                <li>Growth: improved time estimation skills</li>
                            </ul>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    )
}

export default AiSuggestions;