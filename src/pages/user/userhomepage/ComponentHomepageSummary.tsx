import { useState, useEffect } from "react";
import {
    LucideSparkles,
    LucideChevronRight,
    LucideChevronLeft,
    LucidePlus,
    LucideTrash2,
    LucideLoader,
} from 'lucide-react';

import axiosCustom from "../../../config/axiosCustom";

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
        fetchSummaries();
    }, [])

    const fetchSummaries = async () => {
        try {
            const response = await axiosCustom.get(
                `/api/dashboard/crud/homepage-summary/list`,
            );
            const summaryArr = response.data.docs;
            setSummaryArr(summaryArr as HomepageSummary[]);
        } catch (error) {
            console.error("Error fetching homepage summaries:", error);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await axiosCustom.post('/api/dashboard/crud/homepage-summary/generate');
            await fetchSummaries();
            // Show the newly generated summary (most recent)
            setCurrentSummaryIndex(0);
        } catch (error) {
            console.error("Error generating homepage summary:", error);
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
            console.error("Error clearing homepage summaries:", error);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div>
            {summaryArr.length > 0 && (
                <div className="text-left p-2 border border-blue-400 rounded-sm shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-2 hover:bg-blue-200 transition duration-300">
                    <h2 className="text-lg font-bold mb-0 text-blue-800">
                        <LucideSparkles size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                        Homepage Summary
                    </h2>
                    <div>
                        <div className="flex items-center gap-2 mb-1 pt-1">
                            <button
                                className="p-1 border border-blue-400 rounded-sm bg-blue-100 hover:bg-blue-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Generate New Summary"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <LucideLoader size={16} className="text-blue-600 animate-spin" />
                                ) : (
                                    <LucidePlus size={16} className="text-blue-600" />
                                )}
                            </button>
                            <button
                                className="p-1 border border-blue-400 rounded-sm bg-blue-100 hover:bg-blue-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Previous Summary"
                                disabled={currentSummaryIndex <= 0}
                                onClick={() => {
                                    setCurrentSummaryIndex(currentSummaryIndex - 1);
                                }}
                            >
                                <LucideChevronLeft size={16} className="text-blue-600" />
                            </button>
                            <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-sm border border-blue-300">
                                {summaryArr.length > 0 ? `${currentSummaryIndex + 1} / ${summaryArr.length}` : '0 / 0'}
                            </span>
                            <button
                                className="p-1 border border-blue-400 rounded-sm bg-blue-100 hover:bg-blue-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Next Summary"
                                disabled={currentSummaryIndex >= summaryArr.length - 1}
                                onClick={() => {
                                    setCurrentSummaryIndex(currentSummaryIndex + 1);
                                }}
                            >
                                <LucideChevronRight size={16} className="text-blue-600" />
                            </button>
                            <button
                                className="p-1 border border-red-400 rounded-sm bg-red-100 hover:bg-red-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Clear All Summaries"
                                onClick={handleClearAll}
                                disabled={isClearing}
                            >
                                {isClearing ? (
                                    <LucideLoader size={16} className="text-red-600 animate-spin" />
                                ) : (
                                    <LucideTrash2 size={16} className="text-red-600" />
                                )}
                            </button>
                        </div>
                    </div>
                    {summaryArr.length > 0 && summaryArr[currentSummaryIndex] && (
                        <div>
                            <p className="text-xs text-blue-600">
                                Generated: {new Date(summaryArr[currentSummaryIndex].generatedAtUtc).toLocaleString()}
                            </p>
                            <div
                                style={{
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    whiteSpace: 'pre-wrap',
                                }}
                                className="text-sm text-blue-700 pt-2"
                            >
                                {summaryArr[currentSummaryIndex].summary}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {summaryArr.length === 0 && (
                <div className="text-left p-2 border border-blue-400 rounded-sm shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-2 hover:bg-blue-200 transition duration-300">
                    <h2 className="text-lg font-bold mb-0 text-blue-800">
                        <LucideSparkles size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                        Homepage Summary
                    </h2>
                    <div className="flex items-center gap-2 mb-1 pt-1">
                        <button
                            className="p-1 border border-blue-400 rounded-sm bg-blue-100 hover:bg-blue-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Generate New Summary"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <LucideLoader size={16} className="text-blue-600 animate-spin" />
                            ) : (
                                <LucidePlus size={16} className="text-blue-600" />
                            )}
                        </button>
                    </div>
                    <div className="text-center py-2">
                        <span className="text-sm text-blue-600">No summaries yet. Click the + button to generate one.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentHomepageSummary;