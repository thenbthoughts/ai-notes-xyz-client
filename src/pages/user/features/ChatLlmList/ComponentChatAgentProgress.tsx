import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Play, Square, RefreshCw, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../config/axiosCustom';
import { cancelAgentRunByThreadId } from './utils/answerMachinePollingAxios';

export interface ActiveAgentItem {
    agentInstanceId: string;
    threadId: string;
    threadTitle: string;
    status: string;
    tickCount: number;
    goalsCount: number;
    completedGoalsCount: number;
    currentGoalTitle: string;
    lastTickAtUtc: string;
    createdAtUtc: string;
    totalTokens?: number;
    costInUsd?: number;
}

const ComponentChatAgentProgress = () => {
    const [agents, setAgents] = useState<ActiveAgentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stoppingId, setStoppingId] = useState<string | null>(null);

    const fetchActiveAgents = useCallback(async () => {
        try {
            const response = await axiosCustom.post('/api/chat-llm/polling/agentProgressList');
            if (response.data?.success && Array.isArray(response.data.agents)) {
                setAgents(response.data.agents);
            }
        } catch (err) {
            console.error('Failed to fetch active agents list:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveAgents();
        const interval = setInterval(fetchActiveAgents, 2000);
        return () => clearInterval(interval);
    }, [fetchActiveAgents]);

    const handleStopAgent = async (threadId: string) => {
        try {
            setStoppingId(threadId);
            await cancelAgentRunByThreadId(threadId);
            toast.success('Agent stop requested');
            await fetchActiveAgents();
        } catch (err) {
            toast.error('Failed to stop agent');
        } finally {
            setStoppingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 px-3 py-16 sm:px-6 sm:py-20 lg:p-8 text-zinc-100">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-indigo-950/60 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-inner">
                                <Bot className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse" />
                                {agents.length > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                                        <span className="relative inline-flex h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-teal-500"></span>
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                                    Agent Progress Center
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1 sm:line-clamp-none">
                                    Real-time tracking of active autonomous agent execution threads
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t border-zinc-800/60 pt-3 sm:border-t-0 sm:pt-0">
                            <button
                                type="button"
                                onClick={fetchActiveAgents}
                                className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-bold text-teal-300">
                                {agents.length} Active {agents.length === 1 ? 'Agent' : 'Agents'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading && agents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12 text-center backdrop-blur-md">
                        <RefreshCw className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-teal-500" />
                        <p className="mt-4 text-xs sm:text-sm text-zinc-400">Checking for active background agents...</p>
                    </div>
                ) : agents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 sm:p-12 text-center backdrop-blur-md">
                        <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-zinc-800/50 text-zinc-500">
                            <Bot className="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="mt-4 text-base sm:text-lg font-bold text-zinc-200">No Agents Currently Running</h3>
                        <p className="mt-1 max-w-md text-xs sm:text-sm text-zinc-400 px-2">
                            When you start a task in Chat using the Agent answer engine, active background progress will appear here in real-time.
                        </p>
                        <Link
                            to="/user/chat"
                            className="mt-5 sm:mt-6 flex items-center gap-2 rounded-xl bg-teal-600 px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Open Chat & Start Agent</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {agents.map((agent) => {
                            const progressPercent = agent.goalsCount > 0
                                ? Math.round((agent.completedGoalsCount / agent.goalsCount) * 100)
                                : 0;

                            return (
                                <div
                                    key={agent.agentInstanceId}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 shadow-xl transition-all duration-300 hover:border-teal-500/40 hover:bg-zinc-900/90"
                                >
                                    <div>
                                        {/* Card Top Info */}
                                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-teal-400 shadow-sm shadow-teal-400"></span>
                                                    <h3 className="truncate text-sm sm:text-base font-bold text-white">
                                                        {agent.threadTitle}
                                                    </h3>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                                                    Thread ID: <span className="font-mono text-zinc-300">{agent.threadId.slice(0, 12)}...</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-9500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300">
                                                    <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 animate-ping"></span>
                                                    {agent.status || 'pending'}
                                                </span>
                                                <div className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-teal-300">
                                                    <Play className="h-3 w-3 fill-teal-400 text-teal-400 animate-pulse" />
                                                    <span>Tick #{agent.tickCount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {(typeof agent.totalTokens === 'number' ||
                                            typeof agent.costInUsd === 'number') && (
                                            <p className="mt-2 text-[11px] text-zinc-400">
                                                {(agent.totalTokens || 0).toLocaleString()} tokens
                                                {typeof agent.costInUsd === 'number' &&
                                                    agent.costInUsd > 0 && (
                                                        <> · ${agent.costInUsd.toFixed(4)}</>
                                                    )}
                                            </p>
                                        )}

                                        {/* Current Goal Box */}
                                        <div className="mt-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 sm:p-3.5">
                                            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 mb-1">
                                                <span className="font-semibold uppercase tracking-wider text-teal-400 text-[10px]">
                                                    Current Goal
                                                </span>
                                                <span>{agent.completedGoalsCount} of {agent.goalsCount} completed</span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-zinc-200 line-clamp-2 break-words">
                                                {agent.currentGoalTitle}
                                            </p>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3.5 space-y-1.5">
                                            <div className="flex justify-between text-[11px] sm:text-xs text-zinc-400 font-medium">
                                                <span>Overall Progress</span>
                                                <span className="text-teal-400 font-bold">{progressPercent}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-800/60 pt-3.5">
                                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500">
                                            <Clock className="h-3.5 w-3.5 shrink-0" />
                                            <span>
                                                Updated {new Date(agent.lastTickAtUtc).toLocaleTimeString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => handleStopAgent(agent.threadId)}
                                                disabled={stoppingId === agent.threadId}
                                                className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                                            >
                                                <Square className="h-3 w-3" />
                                                <span>Stop</span>
                                            </button>
                                            <Link
                                                to={`/user/chat?id=${agent.threadId}`}
                                                className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-teal-500"
                                            >
                                                <span>View Chat</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComponentChatAgentProgress;
