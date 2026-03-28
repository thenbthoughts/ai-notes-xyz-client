import { LucideBrain, LucideMoveDown, LucideMoveUp, LucideRefreshCcw, LucideSettings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import AiSuggestionsDiary from './components/AiSuggestionSummary';
import AiSuggestionTasks from './components/AiSuggestionTasks';
import AiSuggestionSummaryCombined from './components/AiSuggestionSummaryCombined';

const railBtn =
    'flex w-full items-center justify-center rounded-none border-0 py-1.5 text-zinc-200 transition-colors';

const AiSuggestions = () => {
    return (
        <div className="flex w-full bg-[#f4f4f5]">
            <div className="min-w-0 w-[calc(100vw-50px)]">
                <div className="min-h-[calc(100vh-60px)] px-2 py-2 md:px-3">
                    <div id="messagesScrollUp" />

                    <div className="mb-3 rounded-sm border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-start gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-zinc-50">
                                <LucideBrain className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">
                                    AI suggestions
                                </h1>
                                <p className="text-[11px] text-zinc-500 md:text-xs">
                                    Summaries, diaries, and task ideas from your activity
                                </p>
                            </div>
                        </div>
                    </div>

                    <AiSuggestionSummaryCombined />
                    <AiSuggestionsDiary />
                    <AiSuggestionTasks />

                    <div id="messagesScrollDown" />
                </div>
            </div>

            <div className="flex w-[50px] shrink-0 flex-col items-stretch border-l border-zinc-800 bg-zinc-900 py-1">
                <Link
                    to="/user/setting"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Settings"
                >
                    <LucideSettings className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll up"
                    onClick={() => {
                        document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <LucideMoveUp className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll down"
                    onClick={() => {
                        document.getElementById('messagesScrollDown')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <LucideMoveDown className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Reload page"
                    onClick={() => {
                        toast.success('Refreshing…');
                        window.location.reload();
                    }}
                >
                    <LucideRefreshCcw className="h-4 w-4" strokeWidth={1.75} />
                </button>
            </div>
        </div>
    );
};

export default AiSuggestions;
