import { LucideBrain } from "lucide-react";

import AiSuggestionsDiary from "./components/AiSuggestionSummary";
import AiSuggestionTasks from "./components/AiSuggestionTasks";
import AiSuggestionSummaryCombined from "./components/AiSuggestionSummaryCombined";

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
            <AiSuggestionSummaryCombined />
            <AiSuggestionsDiary />
            <AiSuggestionTasks />
        </div>
    )
};

export default AiSuggestions;