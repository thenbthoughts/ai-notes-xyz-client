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
            <h2 className="mb-1 flex items-center gap-1 text-xs font-semibold text-pink-900">
                <span className="rounded bg-pink-100 p-0.5">
                    <LucideTag className="h-3 w-3 text-pink-600" strokeWidth={2} aria-hidden />
                </span>
                Labels
            </h2>
            <input
                type="text"
                placeholder="Filter labels…"
                className="mb-1.5 w-full rounded-lg border border-pink-200/80 bg-pink-50/40 py-1.5 px-2 text-xs text-pink-950 shadow-sm backdrop-blur-sm focus:border-fuchsia-400 focus:outline-none focus:ring-1 focus:ring-fuchsia-200/40"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />

            {selectedLabels.length > 0 && (
                <div className="mb-1.5 rounded-lg border border-fuchsia-200/70 bg-gradient-to-r from-fuchsia-50/80 to-pink-50/60 p-1.5 shadow-sm backdrop-blur-sm">
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-fuchsia-900">Selected</span>
                        <button
                            type="button"
                            onClick={() => setSelectedLabels([])}
                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-red-700 hover:underline"
                        >
                            <X className="h-2.5 w-2.5" />
                            Clear
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                        {selectedLabels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-0.5 rounded border border-fuchsia-300/70 bg-white/95 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-fuchsia-900 shadow-sm"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={() => handleLabelClick(label)}
                                    className="text-fuchsia-700 hover:text-red-600"
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
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-fuchsia-500 border-r-amber-400" />
                    </div>
                ) : (
                    <div className="flex max-h-32 flex-wrap gap-0.5 overflow-y-auto">
                        {filteredLabels.length === 0 ? (
                            <span className="text-[11px] text-zinc-500">No labels</span>
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
                                                    ? 'border-fuchsia-600 bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-md shadow-fuchsia-500/20 '
                                                    : 'border-violet-200/80 bg-gradient-to-r from-violet-50/90 to-white text-violet-950 shadow-sm hover:border-fuchsia-300 ') +
                                                'inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-tight transition-colors'
                                            }
                                        >
                                            {label._id}
                                            <span className={on ? 'rounded bg-white/25 px-0.5 text-[9px] tabular-nums' : 'rounded bg-violet-200/80 px-0.5 text-[9px] tabular-nums text-violet-900'}>
                                                {label.count}
                                            </span>
                                        </button>
                                    );
                                })}
                                {filteredLabels.length > 100 && (
                                    <span className="rounded border border-amber-200/80 bg-amber-50 px-1 py-px text-[10px] text-amber-900">
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
