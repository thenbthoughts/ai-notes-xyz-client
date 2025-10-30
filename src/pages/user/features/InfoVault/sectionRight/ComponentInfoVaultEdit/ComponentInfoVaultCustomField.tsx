import { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { LucideTrash2, LucidePlus, LucideEdit, LucideLoader2 } from "lucide-react";
import { DebounceInput } from "react-debounce-input";

import { IInfoVaultCustomField } from "../../../../../../types/pages/tsInfoVault";

// Custom Field Item Component
const CustomFieldItem = ({
    customField,
    setRefreshRandomNum,
}: {
    customField: IInfoVaultCustomField;
    setRefreshRandomNum: (num: number) => void;
}) => {
    const [formData, setFormData] = useState({
        key: customField.key,
        value: customField.value,
    });

    const [isAxiosSaving, setIsAxiosSaving] = useState(false);

    const handleSaveField = async () => {
        setIsAxiosSaving(true);
        toast.loading("Saving custom field...", { id: `save-${customField._id}` });

        try {
            await axiosCustom.post("/api/info-vault/customField/infoVaultCustomFieldEdit", {
                _id: customField._id,
                key: formData.key.trim(),
                value: formData.value.trim(),
            });
            toast.success("Custom field saved!", { id: `save-${customField._id}` });
        } catch {
            toast.error("Failed to save custom field", { id: `save-${customField._id}` });
        } finally {
            setIsAxiosSaving(false);
        }
    };

    // Delete custom field
    const handleDelete = async () => {
        if (!window.confirm("Delete this custom field?")) return;
        try {
            await axiosCustom.post("/api/info-vault/customField/infoVaultCustomFieldDelete", { _id: customField._id });
            toast.success("Custom field deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setRefreshRandomNum(Math.random());
        }
    };

    useEffect(() => {
        if (formData.value === customField.value && formData.key === customField.key) {
            // ignore
        } else { 
            handleSaveField();
        }
    }, [formData]);

    return (
        <div className="border border-gray-200 bg-white p-3 rounded-sm hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row gap-2">
                <DebounceInput
                    debounceTimeout={1000}
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                />
                <DebounceInput
                    debounceTimeout={1000}
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                />
            </div>

            <div className="flex gap-1">
                <>
                    <button
                        className="text-blue-400 hover:text-blue-600 p-1 rounded-sm hover:bg-blue-50 transition-colors"
                        title="Edit custom field"
                        onClick={() => handleSaveField()}
                    >
                        {isAxiosSaving ? (
                            <LucideLoader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LucideEdit className="w-4 h-4 inline-block" />
                        )}
                        <span className="pl-1 inline">Save</span>
                    </button>
                    <button
                        className="text-red-400 hover:text-red-600 p-1 rounded-sm hover:bg-red-50 transition-colors"
                        title="Delete custom field"
                        onClick={() => handleDelete()}
                    >
                        <LucideTrash2 className="w-4 h-4 inline-block" />
                        <span className="pl-1 inline">Delete</span>
                    </button>
                </>
            </div>
        </div>
    );
};

const ComponentInfoVaultCustomField = ({ infoVaultId }: { infoVaultId: string }) => {
    const [customFields, setCustomFields] = useState<IInfoVaultCustomField[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch custom fields
    const fetchCustomFields = async () => {
        if (!infoVaultId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/info-vault/customField/infoVaultCustomFieldGet", { infoVaultId });
            setCustomFields(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load custom fields");
        }
        setLoading(false);
    };

    // Add custom field with default values
    const handleAddCustomField = async () => {
        if (!infoVaultId) return;

        setUploading(true);
        toast.loading("Adding custom field...", { id: "add-custom-field" });

        try {
            await axiosCustom.post("/api/info-vault/customField/infoVaultCustomFieldAdd", {
                infoVaultId,
                key: "New Field",
                value: "New Value",
            });
            toast.success("Custom field added!", { id: "add-custom-field" });
            setRefreshRandomNum(Math.random());
        } catch {
            toast.error("Failed to add custom field", { id: "add-custom-field" });
        }

        setUploading(false);
    };

    useEffect(() => {
        fetchCustomFields();
    }, [infoVaultId, refreshRandomNum]);

    return (
        <div className="space-y-3">
            {/* Add Custom Field Button */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={uploading}
                    onClick={handleAddCustomField}
                    type="button"
                >
                    <LucidePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Custom Field</span>
                    <span className="sm:hidden">Add Field</span>
                </button>
            </div>

            {/* Custom Fields List */}
            {loading ? (
                <div className="text-gray-400 text-sm py-4 text-center">Loading custom fields...</div>
            ) : (
                <div className="space-y-2">
                    {customFields.length === 0 && (
                        <div className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-sm border border-gray-200">
                            No custom fields added yet.
                        </div>
                    )}
                    {customFields.map((customField) => {
                        return (
                            <CustomFieldItem
                                key={customField._id}
                                customField={customField}
                                setRefreshRandomNum={setRefreshRandomNum}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ComponentInfoVaultCustomField;