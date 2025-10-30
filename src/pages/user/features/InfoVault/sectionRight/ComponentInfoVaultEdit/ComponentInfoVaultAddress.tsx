import { useEffect, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { LucideTrash2, LucidePlus, LucideEdit, LucideLoader2 } from "lucide-react";
import { DebounceInput } from "react-debounce-input";

import { IInfoVaultAddress } from "../../../../../../types/pages/tsInfoVault";

// Address Item Component
const AddressItem = ({
    address,
    setRefreshRandomNum,
}: {
    address: IInfoVaultAddress;
    setRefreshRandomNum: (num: number) => void;
}) => {
    const [formData, setFormData] = useState({
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        countryRegion: address.countryRegion,
        poBox: address.poBox,
        label: address.label,

        // location
        latitude: address.latitude,
        longitude: address.longitude,

        // primary
        isPrimary: address.isPrimary,
    });

    const [isAxiosSaving, setIsAxiosSaving] = useState(false);

    const handleSaveAddress = async () => {
        setIsAxiosSaving(true);
        toast.loading("Saving address...", { id: `save-${address._id}` });

        try {
            await axiosCustom.post("/api/info-vault/address/infoVaultAddressEdit", {
                _id: address._id,
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                pincode: formData.pincode.trim(),
                countryRegion: formData.countryRegion.trim(),
                poBox: formData.poBox.trim(),
                label: formData.label.trim(),

                // location
                latitude: formData.latitude,
                longitude: formData.longitude,

                // primary
                isPrimary: formData.isPrimary,
            });
            toast.success("Address saved!", { id: `save-${address._id}` });
        } catch {
            toast.error("Failed to save address", { id: `save-${address._id}` });
        } finally {
            setIsAxiosSaving(false);
        }
    };

    // Delete address
    const handleDelete = async () => {
        if (!window.confirm("Delete this address?")) return;
        try {
            await axiosCustom.post("/api/info-vault/address/infoVaultAddressDelete", { _id: address._id });
            toast.success("Address deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setRefreshRandomNum(Math.random());
        }
    };

    useEffect(() => {
        const hasChanges = 
            formData.address !== address.address ||
            formData.city !== address.city ||
            formData.state !== address.state ||
            formData.pincode !== address.pincode ||
            formData.countryRegion !== address.countryRegion ||
            formData.poBox !== address.poBox ||
            formData.label !== address.label ||
            formData.latitude !== address.latitude ||
            formData.longitude !== address.longitude ||
            formData.isPrimary !== address.isPrimary;

        if (hasChanges) {
            handleSaveAddress();
        }
    }, [formData]);

    return (
        <div className="border border-gray-200 bg-white p-3 rounded-sm hover:shadow-sm transition-shadow">
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs font-medium text-gray-700">Address</label>
                    <DebounceInput
                        element="textarea"
                        debounceTimeout={1000}
                        placeholder="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors resize-vertical"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700">City</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">State</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="State"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Pincode</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Country/Region</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="Country/Region"
                            value={formData.countryRegion}
                            onChange={(e) => setFormData({ ...formData, countryRegion: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">PO Box</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="PO Box"
                            value={formData.poBox}
                            onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Label</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="text"
                            placeholder="Label (e.g., home, work)"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Latitude</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="number"
                            step="any"
                            placeholder="Latitude (e.g., 40.7128)"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Longitude</label>
                        <DebounceInput
                            debounceTimeout={1000}
                            type="number"
                            step="any"
                            placeholder="Longitude (e.g., -74.0060)"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-sm text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                        />
                    </div>
                </div>

                {/* Primary Address Checkbox */}
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPrimary}
                            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                            Primary Address
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex gap-1 mt-2">
                <button
                    className="text-blue-400 hover:text-blue-600 p-1 rounded-sm hover:bg-blue-50 transition-colors"
                    title="Save address"
                    onClick={() => handleSaveAddress()}
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
                    title="Delete address"
                    onClick={() => handleDelete()}
                >
                    <LucideTrash2 className="w-4 h-4 inline-block" />
                    <span className="pl-1 inline">Delete</span>
                </button>
            </div>
        </div>
    );
};

const ComponentInfoVaultAddress = ({ infoVaultId }: { infoVaultId: string }) => {
    const [addresses, setAddresses] = useState<IInfoVaultAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch addresses
    const fetchAddresses = async () => {
        if (!infoVaultId) return;
        setLoading(true);
        try {
            const res = await axiosCustom.post("/api/info-vault/address/infoVaultAddressGet", { infoVaultId });
            setAddresses(Array.isArray(res.data.docs) ? res.data.docs : []);
        } catch {
            toast.error("Failed to load addresses");
        }
        setLoading(false);
    };

    // Add address with default values
    const handleAddAddress = async () => {
        if (!infoVaultId) return;

        setUploading(true);
        toast.loading("Adding address...", { id: "add-address" });

        try {
            await axiosCustom.post("/api/info-vault/address/infoVaultAddressAdd", {
                infoVaultId,
                address: "",
                city: "",
                state: "",
                pincode: "",
                countryRegion: "",
                poBox: "",
                label: "home",
                latitude: 0,
                longitude: 0,
                isPrimary: addresses.length === 0, // Make first address primary
            });
            toast.success("Address added!", { id: "add-address" });
            setRefreshRandomNum(Math.random());
        } catch {
            toast.error("Failed to add address", { id: "add-address" });
        }

        setUploading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, [infoVaultId, refreshRandomNum]);

    return (
        <div className="space-y-3">
            {/* Add Address Button */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={uploading}
                    onClick={handleAddAddress}
                    type="button"
                >
                    <LucidePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Address</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Addresses List */}
            {loading ? (
                <div className="text-gray-400 text-sm py-4 text-center">Loading addresses...</div>
            ) : (
                <div className="space-y-2">
                    {addresses.length === 0 && (
                        <div className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-sm border border-gray-200">
                            No addresses added yet.
                        </div>
                    )}
                    {addresses.map((address) => {
                        return (
                            <AddressItem
                                key={address._id}
                                address={address}
                                setRefreshRandomNum={setRefreshRandomNum}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ComponentInfoVaultAddress;