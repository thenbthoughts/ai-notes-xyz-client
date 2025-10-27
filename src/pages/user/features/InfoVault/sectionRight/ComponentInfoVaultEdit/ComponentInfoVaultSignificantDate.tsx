import { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { LucideTrash2, LucidePlus, LucideEdit, LucideLoader2 } from "lucide-react";
import { DebounceInput } from "react-debounce-input";

import { IInfoVaultSignificantDate } from "../../../../../../types/pages/tsInfoVault";

// SignificantDate Item Component
const SignificantDateItem = ({
    significantDate,
    setRefreshRandomNum,
}: {
    significantDate: IInfoVaultSignificantDate;
    setRefreshRandomNum: (num: number) => void;
}) => {
    const [formData, setFormData] = useState({
        date: new Date(significantDate.date).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        label: significantDate.label,
    });

    const [isAxiosSaving, setIsAxiosSaving] = useState(false);

    const handleSaveSignificantDate = async () => {
        setIsAxiosSaving(true);
        toast.loading("Saving significant date...", { id: `save-${significantDate._id}` });

        try {
            await axiosCustom.post("/api/info-vault/significantDate/infoVaultSignificantDateEdit", {
                _id: significantDate._id,
                date: new Date(formData.date),
                label: formData.label.trim(),
            });
            toast.success("Significant date saved!", { id: `save-${significantDate._id}` });
        } catch {
            toast.error("Failed to save significant date", { id: `save-${significantDate._id}` });
        } finally {
            setIsAxiosSaving(false);
        }
    };

    // Delete significant date
    const handleDelete = async () => {
        if (!window.confirm("Delete this significant date?")) return;
        try {
            await axiosCustom.post("/api/info-vault/significantDate/infoVaultSignificantDateDelete", { _id: significantDate._id });
            toast.success("Significant date deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setRefreshRandomNum(Math.random());
        }
    };

    useEffect(() => {
        const originalDate = new Date(significantDate.date).toISOString().split('T')[0];
        if (formData.date === originalDate && formData.label === significantDate.label) {
            // ignore
        } else {
            handleSaveSignificantDate();
        }
    }, [formData]);

    return (
        <div className="border border-gray-200 bg-white p-3 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <label className="text-xs text-gray-500">Label</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="Label (e.g., birthday, anniversary)"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1">
                    <span className="text-xs text-gray-500 mb-1 sm:mb-0">Quick suggestions:</span>
                    <div className="flex flex-wrap gap-1">
                        {['Birthday', 'Anniversary', 'Wedding', 'Graduation', 'First Met', 'Hired Date', 'Retirement'].map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => setFormData({ ...formData, label: suggestion })}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-1 mt-2">
                <button
                    className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Save significant date"
                    onClick={() => handleSaveSignificantDate()}
                >
                    {isAxiosSaving ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <LucideEdit className="w-4 h-4 inline-block" />
                    )}
                    <span className="pl-1 inline">Save</span>
                </button>
                <button
                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete significant date"
                    onClick={() => handleDelete()}
                >
                    <LucideTrash2 className="w-4 h-4 inline-block" />
                    <span className="pl-1 inline">Delete</span>
                </button>
            </div>
        </div>
    );
};

const ComponentInfoVaultSignificantDate = ({ infoVaultId }: { infoVaultId: string }) => {
    const [significantDates, setSignificantDates] = useState<IInfoVaultSignificantDate[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch significant dates
    const fetchSignificantDates = async () => {
        if (!infoVaultId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/info-vault/significantDate/infoVaultSignificantDateGet", { infoVaultId });
            setSignificantDates(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load significant dates");
        }
        setLoading(false);
    };

    // Add significant date with default values
    const handleAddSignificantDate = async () => {
        if (!infoVaultId) return;

        setUploading(true);
        toast.loading("Adding significant date...", { id: "add-significant-date" });

        try {
            await axiosCustom.post("/api/info-vault/significantDate/infoVaultSignificantDateAdd", {
                infoVaultId,
                date: new Date(),
                label: "important date",
            });
            toast.success("Significant date added!", { id: "add-significant-date" });
            setRefreshRandomNum(Math.random());
        } catch {
            toast.error("Failed to add significant date", { id: "add-significant-date" });
        }

        setUploading(false);
    };

    useEffect(() => {
        fetchSignificantDates();
    }, [infoVaultId, refreshRandomNum]);

    return (
        <div className="space-y-3">
            {/* Add Significant Date Button */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={uploading}
                    onClick={handleAddSignificantDate}
                    type="button"
                >
                    <LucidePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Significant Date</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Significant Dates List */}
            {loading ? (
                <div className="text-gray-400 text-sm py-4 text-center">Loading significant dates...</div>
            ) : (
                <div className="space-y-2">
                    {significantDates.length === 0 && (
                        <div className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                            No significant dates added yet.
                        </div>
                    )}
                    {significantDates.map((significantDate) => {
                        return (
                            <SignificantDateItem
                                key={significantDate._id}
                                significantDate={significantDate}
                                setRefreshRandomNum={setRefreshRandomNum}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ComponentInfoVaultSignificantDate;