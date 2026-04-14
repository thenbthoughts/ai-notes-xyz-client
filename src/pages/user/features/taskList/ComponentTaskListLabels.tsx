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
            <h2 className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-700">
                <span className="rounded-md bg-zinc-100 p-0.5">
                    <LucideTag className="h-3 w-3 text-zinc-600" strokeWidth={2} aria-hidden />
                </span>
                Labels
            </h2>
            <input
                type="text"
                placeholder="Filter labels…"
                className="mb-1.5 w-full rounded-lg border border-zinc-200/90 bg-zinc-50/80 py-1.5 px-2 text-xs text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />

            {selectedLabels.length > 0 && (
                <div className="mb-1.5 rounded-lg border border-zinc-200/70 bg-zinc-50/80 p-1.5 shadow-sm">
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                        <span className="text-[11px] font-medium text-zinc-700">Selected</span>
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
                                className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white px-1.5 py-0.5 text-[10px] font-medium leading-tight text-zinc-800 shadow-sm"
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
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
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
                                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm '
                                                    : 'border-zinc-200/80 bg-white text-zinc-800 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 ') +
                                                'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-tight transition-colors'
                                            }
                                        >
                                            {label._id}
                                            <span className={on ? 'rounded bg-white/20 px-0.5 text-[9px] tabular-nums' : 'rounded bg-zinc-200/80 px-0.5 text-[9px] tabular-nums text-zinc-700'}>
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
