import { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { LucideTrash2, LucidePlus, LucideEdit, LucideLoader2, LucideStar } from "lucide-react";
import { DebounceInput } from "react-debounce-input";

import { IInfoVaultPhone } from "../../../../../../types/pages/tsInfoVault";

// Phone Item Component
const PhoneItem = ({
    phone,
    setRefreshRandomNum,
}: {
    phone: IInfoVaultPhone;
    setRefreshRandomNum: (num: number) => void;
}) => {
    const [formData, setFormData] = useState({
        phoneNumber: phone.phoneNumber,
        countryCode: phone.countryCode,
        label: phone.label,
        isPrimary: phone.isPrimary,
    });

    const [isAxiosSaving, setIsAxiosSaving] = useState(false);

    const handleSavePhone = async () => {
        setIsAxiosSaving(true);
        toast.loading("Saving phone...", { id: `save-${phone._id}` });

        try {
            await axiosCustom.post("/api/info-vault/phone/infoVaultPhoneEdit", {
                _id: phone._id,
                phoneNumber: formData.phoneNumber.trim(),
                countryCode: formData.countryCode.trim(),
                label: formData.label.trim(),
                isPrimary: formData.isPrimary,
            });
            toast.success("Phone saved!", { id: `save-${phone._id}` });
        } catch {
            toast.error("Failed to save phone", { id: `save-${phone._id}` });
        } finally {
            setIsAxiosSaving(false);
        }
    };

    // Delete phone
    const handleDelete = async () => {
        if (!window.confirm("Delete this phone number?")) return;
        try {
            await axiosCustom.post("/api/info-vault/phone/infoVaultPhoneDelete", { _id: phone._id });
            toast.success("Phone deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setRefreshRandomNum(Math.random());
        }
    };

    useEffect(() => {
        if (formData.phoneNumber === phone.phoneNumber && formData.countryCode === phone.countryCode && formData.label === phone.label && formData.isPrimary === phone.isPrimary) {
            // ignore
        } else { 
            handleSavePhone();
        }
    }, [formData]);

    return (
        <div className="border border-gray-200 bg-white p-3 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <DebounceInput
                        debounceTimeout={1000}
                        type="text"
                        placeholder="Country code (e.g., +1)"
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        className="sm:w-32 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                    />
                    <DebounceInput
                        debounceTimeout={1000}
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                    />
                    <DebounceInput
                        debounceTimeout={1000}
                        type="text"
                        placeholder="Label (e.g., mobile, work, home)"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="sm:w-40 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPrimary}
                            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                            <LucideStar className="w-3 h-3" />
                            Primary Phone
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex gap-1 mt-2">
                <button
                    className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Save phone"
                    onClick={() => handleSavePhone()}
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
                    title="Delete phone"
                    onClick={() => handleDelete()}
                >
                    <LucideTrash2 className="w-4 h-4 inline-block" />
                    <span className="pl-1 inline">Delete</span>
                </button>
            </div>
        </div>
    );
};

const ComponentInfoVaultPhone = ({ infoVaultId }: { infoVaultId: string }) => {
    const [phones, setPhones] = useState<IInfoVaultPhone[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch phones
    const fetchPhones = async () => {
        if (!infoVaultId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/info-vault/phone/infoVaultPhoneGet", { infoVaultId });
            setPhones(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load phones");
        }
        setLoading(false);
    };

    // Add phone with default values
    const handleAddPhone = async () => {
        if (!infoVaultId) return;

        setUploading(true);
        toast.loading("Adding phone...", { id: "add-phone" });

        try {
            await axiosCustom.post("/api/info-vault/phone/infoVaultPhoneAdd", {
                infoVaultId,
                phoneNumber: "",
                countryCode: "+1",
                label: "mobile",
                isPrimary: phones.length === 0, // Make first phone primary
            });
            toast.success("Phone added!", { id: "add-phone" });
            setRefreshRandomNum(Math.random());
        } catch {
            toast.error("Failed to add phone", { id: "add-phone" });
        }

        setUploading(false);
    };

    useEffect(() => {
        fetchPhones();
    }, [infoVaultId, refreshRandomNum]);

    return (
        <div className="space-y-3">
            {/* Add Phone Button */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={uploading}
                    onClick={handleAddPhone}
                    type="button"
                >
                    <LucidePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Phone</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Phones List */}
            {loading ? (
                <div className="text-gray-400 text-sm py-4 text-center">Loading phones...</div>
            ) : (
                <div className="space-y-2">
                    {phones.length === 0 && (
                        <div className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                            No phones added yet.
                        </div>
                    )}
                    {phones.map((phone) => {
                        return (
                            <PhoneItem
                                key={phone._id}
                                phone={phone}
                                setRefreshRandomNum={setRefreshRandomNum}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ComponentInfoVaultPhone;