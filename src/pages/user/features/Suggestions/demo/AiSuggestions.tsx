import { useState } from 'react';
import { useAtom } from 'jotai';
import { suggestionStateAtom, setSuggestionStateAtom } from './stateJotaiSuggestions';
import { useNavigate } from 'react-router-dom';
import {
    LucideLightbulb,
    LucideTrendingUp,
    LucideBrain,
    LucideZap,
    LucideRefreshCcw,
    LucideStar,
    LucideSparkles,
    LucideMessageSquare,
    LucideInfo,
} from 'lucide-react';
import { DateTime } from 'luxon';

interface Suggestion {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
}

const AiSuggestions = () => {
    const navigate = useNavigate();

    // Section 3 & 4 demo data
    const aiGeneralSuggestions: { id: string; text: string; tag: string; priority: 'high' | 'medium' | 'low' }[] = [
        { id: 's1', text: 'Schedule two deep-work blocks tomorrow', tag: 'productivity', priority: 'high' },
        { id: 's2', text: 'Document 3 lessons learned from this week', tag: 'learning', priority: 'medium' },
        { id: 's3', text: 'Create a project workspace for current goal', tag: 'notes', priority: 'medium' },
        { id: 's4', text: 'Do a 10-minute inbox cleanup', tag: 'time', priority: 'low' },
        { id: 's5', text: 'Review subscriptions for the month', tag: 'finance', priority: 'medium' },
        { id: 's6', text: 'Add a nightly shutdown checklist', tag: 'tasks', priority: 'high' },
    ];

    const aiTaskSuggestions: { id: string; title: string; eta: string; impact: 'High' | 'Medium' | 'Low' }[] = [
        { id: 't1', title: 'Plan week using time-blocking', eta: '15m', impact: 'High' },
        { id: 't2', title: 'Set recurring weekly review (Fri)', eta: '3m', impact: 'High' },
        { id: 't3', title: 'Create morning routine task list', eta: '5m', impact: 'Medium' },
        { id: 't4', title: 'Add expense logging reminder (10pm)', eta: '2m', impact: 'Medium' },
        { id: 't5', title: 'Make “Lessons Learned” note template', eta: '8m', impact: 'Low' },
    ];
    const [taskSuggestionDone, setTaskSuggestionDone] = useState<Record<string, boolean>>({});
    const toggleTaskSuggestion = (id: string) => setTaskSuggestionDone(prev => ({ ...prev, [id]: !prev[id] }));

    const suggestions: Suggestion[] = [
        // Task Suggestions
        {
            id: 't1',
            title: 'Review and update pending tasks',
            description: 'Check tasks from last week and update their status',
            category: 'tasks',
            priority: 'high',
            actionable: true,
        },
        {
            id: 't2',
            title: 'Create morning routine checklist',
            description: 'Build consistency with a daily morning routine',
            category: 'tasks',
            priority: 'medium',
            actionable: true,
        },

        // Note Suggestions
        {
            id: 'n1',
            title: 'Start a daily journal',
            description: 'Document thoughts and track personal growth',
            category: 'notes',
            priority: 'medium',
            actionable: true,
        },
        {
            id: 'n2',
            title: 'Organize notes by projects',
            description: 'Create project-based workspaces for better organization',
            category: 'notes',
            priority: 'low',
            actionable: true,
        },

        // Productivity Tips
        {
            id: 'p1',
            title: 'Apply Pomodoro Technique',
            description: '25-minute focused work sessions with 5-minute breaks',
            category: 'productivity',
            priority: 'high',
            actionable: true,
        },
        {
            id: 'p2',
            title: 'Use 2-Minute Rule',
            description: 'Do tasks immediately if they take less than 2 minutes',
            category: 'productivity',
            priority: 'high',
            actionable: true,
        },
        {
            id: 'p3',
            title: 'Schedule deep work blocks',
            description: 'Reserve 2-3 hour periods for focused work',
            category: 'productivity',
            priority: 'high',
            actionable: true,
        },

        // Learning Suggestions
        {
            id: 'l1',
            title: 'Read 30 minutes daily',
            description: 'Build knowledge through consistent reading habits',
            category: 'learning',
            priority: 'medium',
            actionable: true,
        },
        {
            id: 'l2',
            title: 'Practice active recall',
            description: 'Test yourself regularly to strengthen memory',
            category: 'learning',
            priority: 'high',
            actionable: true,
        },

        // Health & Wellness
        {
            id: 'h1',
            title: 'Take hourly breaks',
            description: 'Stand, stretch, and move every hour',
            category: 'health',
            priority: 'high',
            actionable: true,
        },
        {
            id: 'h2',
            title: 'Maintain sleep schedule',
            description: 'Consistent sleep times improve focus and mood',
            category: 'health',
            priority: 'high',
            actionable: true,
        },

        // Finance Tips
        {
            id: 'f1',
            title: 'Track all expenses',
            description: 'Log expenses to understand spending patterns',
            category: 'finance',
            priority: 'high',
            actionable: true,
        },
        {
            id: 'f2',
            title: 'Build emergency fund',
            description: 'Start saving for 3-6 months of expenses',
            category: 'finance',
            priority: 'high',
            actionable: true,
        },

        // Time Management
        {
            id: 'tm1',
            title: 'Time block your calendar',
            description: 'Assign specific time slots to tasks',
            category: 'time',
            priority: 'high',
            actionable: true,
        },
        {
            id: 'tm2',
            title: 'Batch similar tasks',
            description: 'Group similar activities to reduce context switching',
            category: 'time',
            priority: 'medium',
            actionable: true,
        },

        // Goal Setting
        {
            id: 'g1',
            title: 'Set SMART goals',
            description: 'Make goals Specific, Measurable, Achievable, Relevant, Time-bound',
            category: 'goals',
            priority: 'high',
            actionable: true,
        },
        {
            id: 'g2',
            title: 'Break down large goals',
            description: 'Divide big goals into smaller achievable milestones',
            category: 'goals',
            priority: 'high',
            actionable: true,
        },
    ];

    // Fully compact page; category filtering and per-item icons removed for density

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: 'calc(100vh - 60px)',
            }}
            className="p-1.5 md:p-2"
        >
            {/* Header Section */}
            <div className="mb-2 p-2.5 md:p-3 rounded-lg shadow text-white bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideBrain className="w-6 h-6 md:w-7 md:h-7" />
                    <h1 className="text-xl md:text-2xl font-bold">AI Suggestions</h1>
                </div>
                <p className="text-xs md:text-sm opacity-95">
                    Personalized recommendations based on best practices and productivity insights
                </p>
            </div>

            <div>
                {/* Current Week Number */}
                <div className="mb-2 p-2 md:p-2.5 rounded-lg shadow bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                        <LucideInfo className="w-4 h-4 text-emerald-600" />
                        <h2 className="text-sm md:text-base font-bold text-gray-800">Current Week</h2>
                        <span className="ml-auto text-lg md:text-xl font-bold text-emerald-700">
                            Week {DateTime.now().weekNumber}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* AI Summary Section */}
            <div className="mb-2 p-2.5 md:p-3 rounded-lg shadow bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-start gap-1.5 mb-1">
                    <LucideSparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Summary</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    We've curated <span className="font-semibold text-purple-600">{suggestions.filter(s => s.priority === 'high').length} high-priority</span> suggestions
                    to boost your productivity. Key focus areas: <span className="font-semibold">Pomodoro & time blocking</span> for productivity,
                    <span className="font-semibold"> regular breaks & sleep</span> for health, and <span className="font-semibold">expense tracking</span> for finances.
                    Start with 2-3 items this week for best results.
                </p>
            </div>

            {/* Section 2: AI Diaries (toggle by checkboxes) */}
            <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideLightbulb className="w-4 h-4 text-amber-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Diaries</h2>
                </div>

                <DiarySection />
            </div>

            {/* Section 3: AI Suggestions List */}
            <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideSparkles className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Suggestions List</h2>
                    <button onClick={() => window.location.reload()} className="ml-auto flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900">
                        <LucideRefreshCcw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>
                <ul className="divide-y divide-gray-100">
                    {aiGeneralSuggestions.map((s) => (
                        <li key={s.id} className="py-1.5 flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${s.priority === 'high' ? 'border-red-300 text-red-700 bg-red-50' : s.priority === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' : 'border-green-300 text-green-700 bg-green-50'}`}>{s.priority.toUpperCase()}</span>
                            <p className="text-xs md:text-sm text-gray-800 flex-1">{s.text}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{s.tag}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    <button onClick={() => navigate('/user/notes')} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded">New Note</button>
                    <button onClick={() => navigate('/user/chat')} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded">Open Chat</button>
                </div>
            </div>

            {/* Section 4: AI Task Suggestions */}
            <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideZap className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Task Suggestions</h2>
                </div>
                <ul className="divide-y divide-gray-100">
                    {aiTaskSuggestions.map(task => (
                        <li key={task.id} className="py-1.5 flex items-center gap-2">
                            <input type="checkbox" checked={!!taskSuggestionDone[task.id]} onChange={() => toggleTaskSuggestion(task.id)} />
                            <div className="flex-1">
                                <p className={`text-xs md:text-sm ${taskSuggestionDone[task.id] ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">ETA {task.eta}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${task.impact === 'High' ? 'bg-red-50 text-red-700 border border-red-300' : task.impact === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-300' : 'bg-green-50 text-green-700 border border-green-300'}`}>{task.impact} impact</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/user/task')} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Add Task</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Section 5: AI Ask To Chat (based on past chat) */}
            <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideMessageSquare className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">Ask to AI Chat</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-2">Suggested prompts based on your recent conversations:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {[
                        'Summarize yesterday’s decisions and next steps',
                        'Draft a weekly plan using my current tasks',
                        'Find blockers in my task list and propose fixes',
                        'Create a note outline for project kickoff',
                        'Generate daily journal prompts for reflection',
                        'Suggest ways to optimize my morning routine',
                    ].map((q, i) => (
                        <button
                            key={i}
                            onClick={() => navigate('/user/chat')}
                            className="text-left p-2 rounded border border-gray-200 hover:bg-gray-50 text-xs md:text-sm"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section 5b: Suggested Adds/Updates from Recent Chats */}
            <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideSparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">Suggested Adds/Updates (from recent chats)</h2>
                    <button onClick={() => navigate('/user/chat')} className="ml-auto text-xs text-emerald-700 hover:text-emerald-900">Review chat</button>
                </div>
                <p className="text-[11px] md:text-xs text-gray-600 mb-2">These recommendations are inferred from your latest conversations. Quick actions let you capture decisions while they’re fresh.</p>
                <SuggestedFromChat />
            </div>

            {/* Section 6: AI Random Context */}
            <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideInfo className="w-4 h-4 text-teal-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Random Context</h2>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-2">Useful context snippets to spark action:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {[
                        'Tip: Block notifications during deep work (90 mins max).',
                        'Memory: You complete more tasks before 11am—schedule hard work early.',
                        'Nudge: Last expense log was 2 days ago—capture small spends today.',
                        'Focus: Tasks with “No ETA” stall—assign quick estimates.',
                        'Health: 3-minute stretch every hour improves focus for the next block.',
                        'Learning: Turn meeting notes into flash cards for quick recall.',
                    ].map((c, i) => (
                        <li key={i} className="p-2 rounded border border-gray-200 bg-gray-50 text-xs md:text-sm text-gray-700">{c}</li>
                    ))}
                </ul>
            </div>

            {/* Cards Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mb-3">
                {/* Removed Cards */}
                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideBrain className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm md:text-base font-bold text-gray-800">Smart Insights</h3>
                    </div>
                    <ul className="space-y-0.5 ml-3">
                        <li className="text-xs md:text-sm text-gray-700 list-disc">
                            {`Focus: `}
                            <span className="font-semibold">Pomodoro</span> + <span className="font-semibold">Time Blocking</span>
                        </li>
                        <li className="text-xs md:text-sm text-gray-700 list-disc">
                            {`Health: `}
                            <span className="font-semibold">Hourly Breaks</span> & <span className="font-semibold">Sleep Schedule</span>
                        </li>
                        <li className="text-xs md:text-sm text-gray-700 list-disc">
                            {`Finance: `}
                            <span className="font-semibold">Track Expenses Today</span>
                        </li>
                    </ul>
                </div>
                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideTrendingUp className="w-4 h-4 text-red-600" />
                        <h3 className="text-sm md:text-base font-bold text-gray-800">Top Priorities</h3>
                    </div>
                    <div className="space-y-1">
                        {suggestions.filter(s => s.priority === 'high').slice(0, 3).map((suggestion, index) => (
                            <div key={suggestion.id} className="flex items-start gap-1.5">
                                <span className="text-xs font-bold text-red-600">{index + 1}.</span>
                                <p className="text-xs md:text-sm text-gray-700 font-medium">{suggestion.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideZap className="w-4 h-4 text-green-600" />
                        <h3 className="text-sm md:text-base font-bold text-gray-800">Quick Actions</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => navigate('/user/task')} className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors">
                            Create Task
                        </button>
                        <button onClick={() => navigate('/user/notes')} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors">
                            New Note
                        </button>
                        <button onClick={() => navigate('/user/task-workspace')} className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors">
                            Set Goal
                        </button>
                        <button onClick={() => navigate('/user/finance')} className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors">
                            Track Expense
                        </button>
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideLightbulb className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm md:text-base font-bold text-gray-800">Success Tips</h3>
                    </div>
                    <ul className="space-y-0.5 ml-3">
                        <li className="text-xs md:text-sm text-gray-700 list-disc"><span className="font-semibold">Start small</span> - 1-2 items</li>
                        <li className="text-xs md:text-sm text-gray-700 list-disc"><span className="font-semibold">Be consistent</span> - daily actions</li>
                        <li className="text-xs md:text-sm text-gray-700 list-disc"><span className="font-semibold">Track progress</span> - use app</li>
                    </ul>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideTrendingUp className="w-4 h-4 text-gray-600" />
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Yesterday</h3>
                            <p className="text-xs text-gray-600">Oct 4, 2025</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                        <span className="text-gray-700">✅ <span className="font-semibold">4</span> tasks</span>
                        <span className="text-gray-700">📝 <span className="font-semibold">2</span> notes</span>
                        <span className="text-gray-700">⏰ <span className="font-semibold">3</span> pomodoros</span>
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideSparkles className="w-4 h-4 text-cyan-600" />
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Today's Focus</h3>
                            <p className="text-xs text-gray-600">Oct 5, 2025</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs md:text-sm text-gray-700">1. Take 3 hourly breaks</p>
                        <p className="text-xs md:text-sm text-gray-700">2. Complete 2 Pomodoros</p>
                        <p className="text-xs md:text-sm text-gray-700">3. Log expenses</p>
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideTrendingUp className="w-4 h-4 text-amber-600" />
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-gray-800">Last Week</h3>
                            <p className="text-xs text-gray-600">Sep 28 - Oct 4</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-center bg-gray-50 p-1.5 rounded">
                            <p className="text-base md:text-lg font-bold text-blue-600">18</p>
                            <p className="text-xs text-gray-600">Tasks</p>
                        </div>
                        <div className="text-center bg-gray-50 p-1.5 rounded">
                            <p className="text-base md:text-lg font-bold text-green-600">7</p>
                            <p className="text-xs text-gray-600">Notes</p>
                        </div>
                        <div className="text-center bg-gray-50 p-1.5 rounded">
                            <p className="text-base md:text-lg font-bold text-purple-600">15</p>
                            <p className="text-xs text-gray-600">Pomodoros</p>
                        </div>
                        <div className="text-center bg-gray-50 p-1.5 rounded">
                            <p className="text-base md:text-lg font-bold text-orange-600">85%</p>
                            <p className="text-xs text-gray-600">Goal Rate</p>
                        </div>
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideZap className="w-4 h-4 text-blue-600" />
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-gray-800">This Week's Objectives</h3>
                            <p className="text-xs text-gray-600">Oct 5 - Oct 11</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                        <div className="p-1.5 bg-blue-50 rounded">
                            <p className="text-xs md:text-sm font-semibold text-gray-800 mb-0.5">🎯 Productivity</p>
                            <p className="text-xs text-gray-600">Pomodoro 5 days</p>
                        </div>
                        <div className="p-1.5 bg-red-50 rounded">
                            <p className="text-xs md:text-sm font-semibold text-gray-800 mb-0.5">❤️ Health</p>
                            <p className="text-xs text-gray-600">Sleep 7 days</p>
                        </div>
                        <div className="p-1.5 bg-green-50 rounded">
                            <p className="text-xs md:text-sm font-semibold text-gray-800 mb-0.5">💰 Finance</p>
                            <p className="text-xs text-gray-600">Track daily</p>
                        </div>
                        <div className="p-1.5 bg-purple-50 rounded">
                            <p className="text-xs md:text-sm font-semibold text-gray-800 mb-0.5">📚 Learning</p>
                            <p className="text-xs text-gray-600">Read 30 min</p>
                        </div>
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <LucideLightbulb className="w-4 h-4 text-purple-600" />
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-gray-800">This Month</h3>
                            <p className="text-xs text-gray-600">October 2025</p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div>
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs md:text-sm font-semibold text-gray-800">🎯 Habits</p>
                                <span className="text-xs text-purple-600 font-semibold">60%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-purple-500 h-1 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs md:text-sm font-semibold text-gray-800">💰 Save $500</p>
                                <span className="text-xs text-green-600 font-semibold">40%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-green-500 h-1 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs md:text-sm font-semibold text-gray-800">📚 2 books</p>
                                <span className="text-xs text-blue-600 font-semibold">75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 md:p-4 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <LucideStar className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">Pro Tip</h3>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                            Implement one suggestion at a time and track your progress. Use the Tasks and Notes features to turn these into actionable plans!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiSuggestions;

// Combined diaries toggles + content
const DiarySection = () => {
    const [showDaily, setShowDaily] = useState(true);
    const [showWeekly, setShowWeekly] = useState(true);
    const [showMonthly, setShowMonthly] = useState(false);
    const [showLastWeek, setShowLastWeek] = useState(false);
    const [showYesterday, setShowYesterday] = useState(false);

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={showDaily} onChange={e => setShowDaily(e.target.checked)} />
                    Daily diary
                </label>
                <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={showWeekly} onChange={e => setShowWeekly(e.target.checked)} />
                    Weekly diary
                </label>
                <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={showMonthly} onChange={e => setShowMonthly(e.target.checked)} />
                    Monthly diary
                </label>
                <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={showLastWeek} onChange={e => setShowLastWeek(e.target.checked)} />
                    Last week diary
                </label>
                <label className="flex items-center gap-1 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={showYesterday} onChange={e => setShowYesterday(e.target.checked)} />
                    Yesterday diary
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {showDaily && (
                    <div className="p-2 rounded border border-cyan-200 bg-cyan-50">
                        <p className="text-xs text-gray-600">Today</p>
                        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">AI Daily Diary</h3>
                        <ul className="text-xs md:text-sm text-gray-700 space-y-1 list-disc ml-4">
                            <li>Focus: 2 deep-work blocks, 1 review block</li>
                            <li>Wellness: 3 breaks, hydrate 2L</li>
                            <li>Finance: log expenses before bed</li>
                        </ul>
                    </div>
                )}
                {showWeekly && (
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
                {showYesterday && (
                    <div className="p-2 rounded border border-slate-200 bg-slate-50">
                        <p className="text-xs text-gray-600">Yesterday</p>
                        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">AI Yesterday Diary</h3>
                        <ul className="text-xs md:text-sm text-gray-700 space-y-1 list-disc ml-4">
                            <li>Wins: finished 4 tasks, created 2 notes</li>
                            <li>Energy: consistent; breaks helped</li>
                            <li>Improve: earlier start for deep work</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// Persisted Suggested Adds/Updates list using Jotai storage atom
const SuggestedFromChat = () => {
    const navigate = useNavigate();
    const [suggestionState] = useAtom(suggestionStateAtom);
    const [, setSuggestionState] = useAtom(setSuggestionStateAtom);

    const items = [
        { id: 'a1', kind: 'Task', action: 'Add task', title: 'Create project kickoff checklist', reason: 'You planned a kickoff this week', route: '/user/task', btn: 'Add Task' },
        { id: 'a2', kind: 'Note', action: 'Update note', title: 'Weekly review template', reason: 'You discussed adding outcomes & lessons', route: '/user/notes', btn: 'Open Notes' },
        { id: 'a3', kind: 'Goal', action: 'Add goal', title: 'Ship MVP by Nov 15', reason: 'You aligned on a tentative date', route: '/user/task-workspace', btn: 'Set Goal' },
        { id: 'a4', kind: 'Calendar', action: 'Schedule', title: 'Deep work blocks (90m x 2)', reason: 'You agreed to time-block mornings', route: '/user/schedule', btn: 'Open Schedule' },
    ];

    const now = Date.now();
    const visible = items.filter(i => {
        const s = suggestionState[i.id];
        if (!s) return true;
        if (s.dismissed) return false;
        if (s.done) return false;
        if (s.snoozeUntil && s.snoozeUntil > now) return false;
        return true;
    });

    if (visible.length === 0) {
        return (
            <div className="text-[11px] md:text-xs text-gray-500">All caught up. Suggestions will appear here when new actions are detected.</div>
        );
    }

    const markDone = (id: string) => setSuggestionState({ id, update: { done: true } });
    const dismiss = (id: string) => setSuggestionState({ id, update: { dismissed: true } });
    const snoozeFor = (id: string, ms: number) => setSuggestionState({ id, update: { snoozeUntil: Date.now() + ms } });
    const feedback = (id: string, val: 'up' | 'down') => setSuggestionState({ id, update: { feedback: val } });

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] md:text-xs text-gray-600">Showing {visible.length} suggestions</span>
                <button
                    onClick={() => visible.forEach(v => markDone(v.id))}
                    className="ml-auto px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] md:text-xs hover:bg-emerald-100"
                >
                    Mark all done
                </button>
            </div>
            <ul className="divide-y divide-gray-100">
                {visible.map(item => (
                    <li key={item.id} className="py-1.5 flex items-start gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">{item.kind}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-gray-800 font-medium">
                                <span className="text-gray-500 font-normal">{item.action}:</span> {item.title}
                            </p>
                            <p className="text-[11px] md:text-xs text-gray-600">Reason: {item.reason}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <button onClick={() => navigate(item.route)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] md:text-xs rounded whitespace-nowrap">{item.btn}</button>
                                <button onClick={() => markDone(item.id)} className="px-2 py-1 border border-gray-200 rounded text-[11px] md:text-xs">Done</button>
                                <button onClick={() => snoozeFor(item.id, 1000 * 60 * 60 * 24)} className="px-2 py-1 border border-gray-200 rounded text-[11px] md:text-xs">Snooze 1d</button>
                                <button onClick={() => dismiss(item.id)} className="px-2 py-1 border border-gray-200 rounded text-[11px] md:text-xs">Dismiss</button>
                                <button onClick={() => feedback(item.id, 'up')} className={`px-2 py-1 border rounded text-[11px] md:text-xs ${suggestionState[item.id]?.feedback === 'up' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200'}`}>👍</button>
                                <button onClick={() => feedback(item.id, 'down')} className={`px-2 py-1 border rounded text-[11px] md:text-xs ${suggestionState[item.id]?.feedback === 'down' ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200'}`}>👎</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};