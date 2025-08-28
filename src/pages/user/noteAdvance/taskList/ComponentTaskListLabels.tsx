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
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">Labels</h2>
            <input
                type="text"
                placeholder="Search labels..."
                className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />

            {/* Selected labels */}
            {selectedLabels.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Selected Labels:</span>
                        <button
                            onClick={() => setSelectedLabels([])}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedLabels.map((label) => (
                            <span key={label} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                {label}
                                <button
                                    onClick={() => handleLabelClick(label)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <LucideX className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* display labels */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Labels</h3>
                
                {loading ? (
                    <div className="text-center py-4">
                        <span className="text-gray-500">Loading labels...</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {filteredLabels.length === 0 ? (
                            <span className="text-gray-500 text-sm">No labels found</span>
                        ) : (
                            <>
                                {filteredLabels.slice(0, 100).map((label) => (
                                    <span key={label._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1" onClick={() => handleLabelClick(label._id)}>
                                        {label._id}
                                        <span className="bg-blue-200 text-blue-900 px-1 rounded-full text-xs">
                                            {label.count}
                                        </span>
                                    </span>
                                ))}
                                {filteredLabels.length > 100 && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                                        + {filteredLabels.length - 100} more
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ComponentTaskListLabels;