import { useState, useEffect } from "react";
import axiosCustom from "../../../../config/axiosCustom";
import { LucideX, X } from 'lucide-react';

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
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                Labels
            </h2>
            <input
                type="text"
                placeholder="Filter labels…"
                className="mb-2 w-full rounded-none border border-zinc-300 bg-white py-1.5 px-2 text-[11px] focus:border-emerald-600 focus:outline-none"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />

            {selectedLabels.length > 0 && (
                <div className="mb-2 rounded-none border border-emerald-200 bg-emerald-50/50 p-2">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-800">Selected</span>
                        <button
                            type="button"
                            onClick={() => setSelectedLabels([])}
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-700 hover:underline"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {selectedLabels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-0.5 rounded-none border border-emerald-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-emerald-900"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={() => handleLabelClick(label)}
                                    className="text-emerald-700 hover:text-red-600"
                                    aria-label={`Remove ${label}`}
                                >
                                    <LucideX className="h-3 w-3" strokeWidth={2} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div>
                {loading ? (
                    <p className="py-2 text-center font-mono text-[10px] text-zinc-500">Loading…</p>
                ) : (
                    <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto">
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
                                                    ? 'border-emerald-600 bg-emerald-600 text-white '
                                                    : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 ') +
                                                'inline-flex items-center gap-1 rounded-none border px-1.5 py-0.5 text-[10px] font-medium'
                                            }
                                        >
                                            {label._id}
                                            <span className={on ? 'bg-emerald-500 px-0.5 text-[9px]' : 'bg-zinc-200 px-0.5 text-[9px] text-zinc-700'}>
                                                {label.count}
                                            </span>
                                        </button>
                                    );
                                })}
                                {filteredLabels.length > 100 && (
                                    <span className="rounded-none border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600">
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
