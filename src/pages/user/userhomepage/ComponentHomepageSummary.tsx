import { useState, useEffect } from 'react';
import {
    LucideSparkles,
    LucideChevronRight,
    LucideChevronLeft,
    LucidePlus,
    LucideTrash2,
    LucideLoader,
} from 'lucide-react';

import axiosCustom from '../../../config/axiosCustom';

const panel =
    'rounded-lg border border-zinc-200/90 bg-white p-2.5 shadow-sm transition hover:shadow';
const panelTitle = 'flex items-center gap-1.5 text-xs font-semibold text-zinc-800';
const panelIconBtn =
    'rounded-md border border-zinc-200 bg-white p-1 text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40';
const mutedText = 'text-[11px] leading-snug text-zinc-500';

interface HomepageSummary {
    _id: string;
    username: string;
    generatedAtUtc: string;
    summary: string;
}

const ComponentHomepageSummary = () => {
    const [summaryArr, setSummaryArr] = useState([] as HomepageSummary[]);
    const [currentSummaryIndex, setCurrentSummaryIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        void fetchSummaries();
    }, []);

    const fetchSummaries = async () => {
        try {
            const response = await axiosCustom.get(`/api/dashboard/crud/homepage-summary/list`);
            const arr = response.data.docs;
            setSummaryArr(arr as HomepageSummary[]);
        } catch (error) {
            console.error('Error fetching homepage summaries:', error);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await axiosCustom.post('/api/dashboard/crud/homepage-summary/generate');
            await fetchSummaries();
            setCurrentSummaryIndex(0);
        } catch (error) {
            console.error('Error generating homepage summary:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            await axiosCustom.delete('/api/dashboard/crud/homepage-summary/clear-all');
            setSummaryArr([]);
            setCurrentSummaryIndex(0);
        } catch (error) {
            console.error('Error clearing homepage summaries:', error);
        } finally {
            setIsClearing(false);
        }
    };

    const toolbar = (
        <div className="mb-2 flex flex-wrap items-center gap-1">
            <button
                type="button"
                className={panelIconBtn}
                title="Generate"
                onClick={handleGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <LucideLoader className="h-3.5 w-3.5 animate-spin text-sky-600" strokeWidth={2} />
                ) : (
                    <LucidePlus className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                )}
            </button>
            <button
                type="button"
                className={panelIconBtn}
                title="Previous"
                disabled={currentSummaryIndex <= 0}
                onClick={() => setCurrentSummaryIndex(currentSummaryIndex - 1)}
            >
                <LucideChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <span className="rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-900">
                {summaryArr.length > 0 ? `${currentSummaryIndex + 1} / ${summaryArr.length}` : '0 / 0'}
            </span>
            <button
                type="button"
                className={panelIconBtn}
                title="Next"
                disabled={currentSummaryIndex >= summaryArr.length - 1}
                onClick={() => setCurrentSummaryIndex(currentSummaryIndex + 1)}
            >
                <LucideChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
                type="button"
                className={`${panelIconBtn} border-rose-200 hover:bg-rose-50`}
                title="Clear all"
                onClick={handleClearAll}
                disabled={isClearing}
            >
                {isClearing ? (
                    <LucideLoader className="h-3.5 w-3.5 animate-spin text-rose-600" strokeWidth={2} />
                ) : (
                    <LucideTrash2 className="h-3.5 w-3.5 text-rose-600" strokeWidth={2} />
                )}
            </button>
        </div>
    );

    return (
        <div className={`${panel} border-l-[3px] border-l-sky-500`}>
            <h2 className={`${panelTitle} mb-0.5`}>
                <LucideSparkles className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                Homepage summary
            </h2>
            {toolbar}
            {summaryArr.length > 0 && summaryArr[currentSummaryIndex] && (
                <div>
                    <p className={mutedText}>
                        {new Date(summaryArr[currentSummaryIndex].generatedAtUtc).toLocaleString()}
                    </p>
                    <div className="mt-1 max-h-[120px] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-zinc-700">
                        {summaryArr[currentSummaryIndex].summary}
                    </div>
                </div>
            )}
            {summaryArr.length === 0 && (
                <p className={`${mutedText} py-1 text-center`}>No summaries — tap + to generate.</p>
            )}
        </div>
    );
};

export default ComponentHomepageSummary;
