import { useState, useEffect } from "react";
import axiosCustom from "../../../../config/axiosCustom";
import { LucideTag, LucideX, X } from 'lucide-react';

interface LabelData {
    _id: string;
    count: number;
}

const ComponentTaskListLabels = ({
    workspaceId,
    selectedLabels,
    setSelectedLabels
}: {
    workspaceId: string;
    selectedLabels: string[];
    setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
}) => {

    const [labels, setLabels] = useState<LabelData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        if (workspaceId && workspaceId.length === 24) {
            fetchLabels();
        }
    }, [workspaceId]);

    const fetchLabels = async () => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: '/api/task/crud/taskLabelsByWorkspaceId',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    workspaceId: workspaceId
                }
            };
            const response = await axiosCustom.request(config);
            setLabels(response.data.labels);
        } catch (error) {
            console.error('Error fetching labels:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredLabels = labels.filter(label =>
        label._id.toLowerCase().includes(searchInput.toLowerCase())
    );

    const handleLabelClick = (labelId: string) => {
        if (selectedLabels.includes(labelId)) {
            setSelectedLabels(selectedLabels.filter(id => id !== labelId));
        } else {
            setSelectedLabels([...selectedLabels, labelId]);
        }
    };

    return (
        <div>
            <h2 className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-zinc-800">
                <LucideTag className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                Labels
            </h2>
            <input
                type="text"
                placeholder="Filter labels…"
                className="mb-1.5 w-full rounded-lg border border-zinc-200/80 bg-white/80 py-1 px-2 text-[11px] text-zinc-900 shadow-sm backdrop-blur-sm focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />

            {selectedLabels.length > 0 && (
                <div className="mb-1.5 rounded-lg border border-teal-200/60 bg-teal-50/40 p-1.5 shadow-sm backdrop-blur-sm">
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-semibold text-teal-900">Selected</span>
                        <button
                            type="button"
                            onClick={() => setSelectedLabels([])}
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-700 hover:underline"
                        >
                            <X className="h-2.5 w-2.5" />
                            Clear
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                        {selectedLabels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-0.5 rounded border border-teal-200/80 bg-white/90 px-1 py-px text-[9px] font-medium leading-tight text-teal-900 shadow-sm"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={() => handleLabelClick(label)}
                                    className="text-teal-700 hover:text-red-600"
                                    aria-label={`Remove ${label}`}
                                >
                                    <LucideX className="h-2.5 w-2.5" strokeWidth={2} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div>
                {loading ? (
                    <div className="flex justify-center py-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600" />
                    </div>
                ) : (
                    <div className="flex max-h-32 flex-wrap gap-0.5 overflow-y-auto">
                        {filteredLabels.length === 0 ? (
                            <span className="text-[10px] text-zinc-500">No labels</span>
                        ) : (
                            <>
                                {filteredLabels.slice(0, 100).map((label) => {
                                    const on = selectedLabels.includes(label._id);
                                    return (
                                        <button
                                            key={label._id}
                                            type="button"
                                            onClick={() => handleLabelClick(label._id)}
                                            className={
                                                (on
                                                    ? 'border-teal-600 bg-teal-600 text-white shadow-sm '
                                                    : 'border-zinc-200/80 bg-white/80 text-zinc-800 shadow-sm hover:border-zinc-300 ') +
                                                'inline-flex items-center gap-0.5 rounded border px-1 py-px text-[9px] font-medium leading-tight transition-colors'
                                            }
                                        >
                                            {label._id}
                                            <span className={on ? 'rounded bg-teal-500/90 px-0.5 text-[8px] tabular-nums' : 'rounded bg-zinc-200 px-0.5 text-[8px] tabular-nums text-zinc-700'}>
                                                {label.count}
                                            </span>
                                        </button>
                                    );
                                })}
                                {filteredLabels.length > 100 && (
                                    <span className="rounded border border-zinc-200/80 bg-zinc-50 px-1 py-px text-[9px] text-zinc-600">
                                        +{filteredLabels.length - 100}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComponentTaskListLabels;
