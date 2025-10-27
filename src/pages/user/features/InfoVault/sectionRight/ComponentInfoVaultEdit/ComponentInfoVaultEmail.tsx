import { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { LucideTrash2, LucidePlus, LucideEdit, LucideLoader2, LucideStar } from "lucide-react";
import { DebounceInput } from "react-debounce-input";

import { IInfoVaultEmail } from "../../../../../../types/pages/tsInfoVault";

// Email Item Component
const EmailItem = ({
    email,
    setRefreshRandomNum,
}: {
    email: IInfoVaultEmail;
    setRefreshRandomNum: (num: number) => void;
}) => {
    const [formData, setFormData] = useState({
        email: email.email,
        label: email.label,
        isPrimary: email.isPrimary,
    });

    const [isAxiosSaving, setIsAxiosSaving] = useState(false);

    const handleSaveEmail = async () => {
        setIsAxiosSaving(true);
        toast.loading("Saving email...", { id: `save-${email._id}` });

        try {
            await axiosCustom.post("/api/info-vault/email/infoVaultEmailEdit", {
                _id: email._id,
                email: formData.email.trim(),
                label: formData.label.trim(),
                isPrimary: formData.isPrimary,
            });
            toast.success("Email saved!", { id: `save-${email._id}` });
        } catch {
            toast.error("Failed to save email", { id: `save-${email._id}` });
        } finally {
            setIsAxiosSaving(false);
        }
    };

    // Delete email
    const handleDelete = async () => {
        if (!window.confirm("Delete this email?")) return;
        try {
            await axiosCustom.post("/api/info-vault/email/infoVaultEmailDelete", { _id: email._id });
            toast.success("Email deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setRefreshRandomNum(Math.random());
        }
    };

    useEffect(() => {
        if (formData.email === email.email && formData.label === email.label && formData.isPrimary === email.isPrimary) {
            // ignore
        } else { 
            handleSaveEmail();
        }
    }, [formData]);

    return (
        <div className="border border-gray-200 bg-white p-3 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <DebounceInput
                        debounceTimeout={1000}
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                    />
                    <DebounceInput
                        debounceTimeout={1000}
                        type="text"
                        placeholder="Label (e.g., work, home)"
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
                            Primary Email
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex gap-1 mt-2">
                <button
                    className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Save email"
                    onClick={() => handleSaveEmail()}
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
                    title="Delete email"
                    onClick={() => handleDelete()}
                >
                    <LucideTrash2 className="w-4 h-4 inline-block" />
                    <span className="pl-1 inline">Delete</span>
                </button>
            </div>
        </div>
    );
};

const ComponentInfoVaultEmail = ({ infoVaultId }: { infoVaultId: string }) => {
    const [emails, setEmails] = useState<IInfoVaultEmail[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch emails
    const fetchEmails = async () => {
        if (!infoVaultId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/info-vault/email/infoVaultEmailGet", { infoVaultId });
            setEmails(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load emails");
        }
        setLoading(false);
    };

    // Add email with default values
    const handleAddEmail = async () => {
        if (!infoVaultId) return;

        setUploading(true);
        toast.loading("Adding email...", { id: "add-email" });

        try {
            await axiosCustom.post("/api/info-vault/email/infoVaultEmailAdd", {
                infoVaultId,
                email: "",
                label: "work",
                isPrimary: emails.length === 0, // Make first email primary
            });
            toast.success("Email added!", { id: "add-email" });
            setRefreshRandomNum(Math.random());
        } catch {
            toast.error("Failed to add email", { id: "add-email" });
        }

        setUploading(false);
    };

    useEffect(() => {
        fetchEmails();
    }, [infoVaultId, refreshRandomNum]);

    return (
        <div className="space-y-3">
            {/* Add Email Button */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={uploading}
                    onClick={handleAddEmail}
                    type="button"
                >
                    <LucidePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Email</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Emails List */}
            {loading ? (
                <div className="text-gray-400 text-sm py-4 text-center">Loading emails...</div>
            ) : (
                <div className="space-y-2">
                    {emails.length === 0 && (
                        <div className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                            No emails added yet.
                        </div>
                    )}
                    {emails.map((email) => {
                        return (
                            <EmailItem
                                key={email._id}
                                email={email}
                                setRefreshRandomNum={setRefreshRandomNum}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ComponentInfoVaultEmail;