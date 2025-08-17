import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axiosCustom from "../../../../config/axiosCustom";
import SettingHeader from "../SettingHeader";

const SettingChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [request, setRequest] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const handleChangePassword = async () => {
        // Client-side validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setRequest({ loading: false, success: '', error: 'All fields are required' });
            return;
        }

        if (newPassword.length < 8) {
            setRequest({ loading: false, success: '', error: 'New password must be at least 8 characters long' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setRequest({ loading: false, success: '', error: 'New passwords do not match' });
            return;
        }

        setRequest({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/auth/change-password-logged-in`,
                {
                    oldPassword,
                    newPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            
            setRequest({ loading: false, success: 'Password changed successfully!', error: '' });
            
            // Clear form fields
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            
            console.log("Password changed:", response.data);
        } catch (error: any) {
            console.error("Error changing password:", error);

            let errorStr = 'Error changing password. Please try again.';
            if (typeof error?.response?.data?.message === 'string') {
                errorStr = error.response.data.message;
            } else if (typeof error?.response?.data?.error === 'string') {
                errorStr = error.response.data.error;
            }

            setRequest({ loading: false, success: '', error: errorStr });
        }
    };

    return (
        <div
            className="p-4"
            style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}
        >
            <SettingHeader />

            <div id="change-password">
                <h2 className="text-xl font-bold text-gray-900 py-2">Change Password</h2>

                <div className="mb-4">
                    <label htmlFor="oldPassword" className="block text-gray-700 font-bold mb-2">
                        Current Password
                    </label>
                    <input
                        type={showOldPassword ? "text" : "password"}
                        id="oldPassword"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                    />
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                        {showOldPassword ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Hide password
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-1" />
                                Show password
                            </>
                        )}
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-gray-700 font-bold mb-2">
                        New Password
                    </label>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password (minimum 8 characters)"
                    />
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Hide password
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-1" />
                                Show password
                            </>
                        )}
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                    />
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Hide password
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-1" />
                                Show password
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-2">
                    {request.loading && (
                        <p className="text-gray-500">Loading...</p>
                    )}
                    {!request.loading && request.success !== '' && (
                        <p className="text-green-500 bg-green-100 p-2 rounded">{request.success}</p>
                    )}
                    {!request.loading && request.error !== '' && (
                        <p className="text-red-500 bg-red-100 p-2 rounded">{request.error}</p>
                    )}
                </div>

                <button
                    onClick={handleChangePassword}
                    disabled={request.loading}
                    className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {request.loading ? 'Changing Password...' : 'Change Password'}
                </button>
            </div>
        </div>
    );
};

export default SettingChangePassword;