import { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { LucideTrash2, LucidePlus, LucideEdit, LucideLoader2 } from "lucide-react";
import { DebounceInput } from "react-debounce-input";

import { IInfoVaultWebsite } from "../../../../../../types/pages/tsInfoVault";

// Website Item Component
const WebsiteItem = ({
    website,
    setRefreshRandomNum,
}: {
    website: IInfoVaultWebsite;
    setRefreshRandomNum: (num: number) => void;
}) => {
    const [formData, setFormData] = useState({
        url: website.url,
        label: website.label,
    });

    const [isAxiosSaving, setIsAxiosSaving] = useState(false);

    const handleSaveWebsite = async () => {
        setIsAxiosSaving(true);
        toast.loading("Saving website...", { id: `save-${website._id}` });

        try {
            await axiosCustom.post("/api/info-vault/website/infoVaultWebsiteEdit", {
                _id: website._id,
                url: formData.url.trim(),
                label: formData.label.trim(),
            });
            toast.success("Website saved!", { id: `save-${website._id}` });
        } catch {
            toast.error("Failed to save website", { id: `save-${website._id}` });
        } finally {
            setIsAxiosSaving(false);
        }
    };

    // Delete website
    const handleDelete = async () => {
        if (!window.confirm("Delete this website?")) return;
        try {
            await axiosCustom.post("/api/info-vault/website/infoVaultWebsiteDelete", { _id: website._id });
            toast.success("Website deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setRefreshRandomNum(Math.random());
        }
    };

    useEffect(() => {
        if (formData.url === website.url && formData.label === website.label) {
            // ignore
        } else { 
            handleSaveWebsite();
        }
    }, [formData]);

    return (
        <div className="border border-gray-200 bg-white p-3 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <DebounceInput
                        debounceTimeout={1000}
                        type="url"
                        placeholder="Enter website URL"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                    />
                    <DebounceInput
                        debounceTimeout={1000}
                        type="text"
                        placeholder="Label (e.g., portfolio, company)"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="sm:w-40 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                    />
                </div>
            </div>

            <div className="flex gap-1 mt-2">
                <button
                    className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Save website"
                    onClick={() => handleSaveWebsite()}
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
                    title="Delete website"
                    onClick={() => handleDelete()}
                >
                    <LucideTrash2 className="w-4 h-4 inline-block" />
                    <span className="pl-1 inline">Delete</span>
                </button>
            </div>
        </div>
    );
};

const ComponentInfoVaultWebsite = ({ infoVaultId }: { infoVaultId: string }) => {
    const [websites, setWebsites] = useState<IInfoVaultWebsite[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch websites
    const fetchWebsites = async () => {
        if (!infoVaultId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/info-vault/website/infoVaultWebsiteGet", { infoVaultId });
            setWebsites(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load websites");
        }
        setLoading(false);
    };

    // Add website with default values
    const handleAddWebsite = async () => {
        if (!infoVaultId) return;

        setUploading(true);
        toast.loading("Adding website...", { id: "add-website" });

        try {
            await axiosCustom.post("/api/info-vault/website/infoVaultWebsiteAdd", {
                infoVaultId,
                url: "",
                label: "website",
            });
            toast.success("Website added!", { id: "add-website" });
            setRefreshRandomNum(Math.random());
        } catch {
            toast.error("Failed to add website", { id: "add-website" });
        }

        setUploading(false);
    };

    useEffect(() => {
        fetchWebsites();
    }, [infoVaultId, refreshRandomNum]);

    return (
        <div className="space-y-3">
            {/* Add Website Button */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={uploading}
                    onClick={handleAddWebsite}
                    type="button"
                >
                    <LucidePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Website</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Websites List */}
            {loading ? (
                <div className="text-gray-400 text-sm py-4 text-center">Loading websites...</div>
            ) : (
                <div className="space-y-2">
                    {websites.length === 0 && (
                        <div className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                            No websites added yet.
                        </div>
                    )}
                    {websites.map((website) => {
                        return (
                            <WebsiteItem
                                key={website._id}
                                website={website}
                                setRefreshRandomNum={setRefreshRandomNum}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ComponentInfoVaultWebsite;