import { LucideSparkles, LucideRefreshCw, LucideZap } from "lucide-react";
import { useEffect, useState } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import MarkdownRenderer from "../../../../../components/markdown/MarkdownRenderer";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

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
            // revalidate summary
            const promiseSummaryRevalidateToday = fetchRevailateAIDiary({
                summaryDate: new Date().toISOString(),
                summaryType: 'daily',
            });
            const promiseSummaryRevalidateYesterday = fetchRevailateAIDiary({
                summaryDate: `${new Date(
                    new Date().valueOf() - 1000 * 60 * 60 * 24
                ).toISOString()}`,
                summaryType: 'daily',
            });
            await promiseSummaryRevalidateToday;
            await promiseSummaryRevalidateYesterday;
            await fetchRevailateAIDiary({
                summaryDate: new Date(
                    new Date().valueOf()
                ).toISOString(),
                summaryType: 'weekly',
            });

            // get summary
            const response = await axiosCustom.get('/api/suggestions/crud/get-ai-summary-combined', {
                signal
            });

            const tempUserSummary = response.data.data.userSummary;
            setSummary(tempUserSummary);
            setIsLoading(false);
        } catch (error: any) {
            console.error('Error fetching AI summary:', error);
            if (error.name == 'AbortError' || error.name === 'CanceledError') {
                console.error('Error fetching AI summary:', error);
            } else {
                console.log('called false')
                setIsLoading(false);
            }
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
        fetchSummary(controller.signal);

        return () => {
            controller.abort();
        };
    }, [randomNum]);

    useEffect(() => {
        if (autoLoad) {
            console.log('autoLoad is true');
            setRandomNum(Math.random());
        } else {
            console.log('autoLoad is false');
        }
    }, [autoLoad]);

    return (
        <div className="mb-2 p-2.5 md:p-3 rounded-sm shadow bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 flex-1">
                    <LucideSparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Summary</h2>
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            setAutoLoad(!autoLoad);
                        }}
                        className={`p-1 px-2 rounded-sm transition-colors text-xs flex items-center flex-1 sm:flex-initial justify-center ${autoLoad ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title={autoLoad ? 'Auto-load enabled' : 'Auto-load disabled'}
                    >
                        <LucideZap
                            className={`w-3 h-3 md:w-4 md:h-4 ${autoLoad ? 'text-green-600' : 'text-gray-400'} mr-1`}
                        />
                        <span className="">{autoLoad ? 'Auto-load enabled' : 'Auto-load disabled'}</span>
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="p-1 rounded-sm hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Refresh summary"
                    >
                        <LucideRefreshCw
                            className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {!autoLoad && summary.length === 0 && isLoading === false && (
                <div className="flex items-center justify-center py-4">
                    <span className="text-xs md:text-sm text-gray-600">Auto-load is disabled. Click refresh to load summary.</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-xs md:text-sm text-gray-600">Loading summary...</span>
                </div>
            ) : (
                <div
                    style={{
                        overflowY: 'auto',
                        maxHeight: '80vh',
                    }}
                >
                    {summary.length === 0 && (
                        <div className="text-center">
                            <span className="text-xs md:text-sm text-gray-600">No summary available yet.</span>
                        </div>
                    )}
                    <MarkdownRenderer content={summary} />
                </div>
            )}
        </div>
    )
};

export default AiSuggestionSummaryCombined;