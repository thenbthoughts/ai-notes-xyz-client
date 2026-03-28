import { LucideSparkles, LucideRefreshCw, LucideZap } from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import MarkdownRenderer from '../../../../../components/markdown/MarkdownRenderer';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const autoLoadAtom = atomWithStorage('aiSummaryAutoLoad', false);

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

const AiSuggestionSummaryCombined = () => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [autoLoad, setAutoLoad] = useAtom(autoLoadAtom);
    const [randomNum, setRandomNum] = useState(0);

    const fetchSummary = async (signal?: AbortSignal) => {
        setIsLoading(true);
        try {
            const promiseSummaryRevalidateToday = fetchRevailateAIDiary({
                summaryDate: new Date().toISOString(),
                summaryType: 'daily',
            });
            const promiseSummaryRevalidateYesterday = fetchRevailateAIDiary({
                summaryDate: `${new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toISOString()}`,
                summaryType: 'daily',
            });
            await promiseSummaryRevalidateToday;
            await promiseSummaryRevalidateYesterday;
            await fetchRevailateAIDiary({
                summaryDate: new Date(new Date().valueOf()).toISOString(),
                summaryType: 'weekly',
            });

            const response = await axiosCustom.get('/api/suggestions/crud/get-ai-summary-combined', {
                signal,
            });

            const tempUserSummary = response.data.data.userSummary;
            setSummary(tempUserSummary);
            setIsLoading(false);
        } catch (error: unknown) {
            console.error('Error fetching AI summary:', error);
            const err = error as { name?: string };
            if (err.name === 'AbortError' || err.name === 'CanceledError') {
                return;
            }
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setRandomNum(Math.random());
    };

    useEffect(() => {
        if (randomNum === 0) {
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();
        void fetchSummary(controller.signal);

        return () => {
            controller.abort();
        };
    }, [randomNum]);

    useEffect(() => {
        if (autoLoad) {
            setRandomNum(Math.random());
        }
    }, [autoLoad]);

    const toggleBtn = (on: boolean) =>
        `rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
            on
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
        }`;

    return (
        <div className="mb-2 rounded-sm border border-zinc-200 bg-white p-2.5 shadow-sm md:p-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5">
                    <LucideSparkles className="h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2} />
                    <h2 className="text-sm font-semibold text-zinc-900">AI summary</h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setAutoLoad(!autoLoad)}
                        className={toggleBtn(autoLoad)}
                        title={autoLoad ? 'Auto-load on' : 'Auto-load off'}
                    >
                        <span className="inline-flex items-center gap-1">
                            <LucideZap
                                className={`h-3.5 w-3.5 ${autoLoad ? 'text-emerald-600' : 'text-zinc-400'}`}
                                strokeWidth={2}
                            />
                            {autoLoad ? 'Auto-load on' : 'Auto-load off'}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="rounded-sm border border-zinc-200 bg-white p-1.5 text-indigo-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Refresh summary"
                    >
                        <LucideRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {!autoLoad && summary.length === 0 && isLoading === false && (
                <div className="flex justify-center py-4">
                    <span className="text-xs text-zinc-600">
                        Auto-load is off. Use refresh to load the summary.
                    </span>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                    <span className="text-xs text-zinc-600">Loading summary…</span>
                </div>
            ) : (
                <div className="max-h-[80vh] overflow-y-auto rounded-sm border border-zinc-100 bg-zinc-50/50 p-2">
                    {summary.length === 0 && (
                        <p className="py-2 text-center text-xs text-zinc-600">No summary yet.</p>
                    )}
                    <div className="prose prose-sm max-w-none text-zinc-800">
                        <MarkdownRenderer content={summary} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiSuggestionSummaryCombined;
