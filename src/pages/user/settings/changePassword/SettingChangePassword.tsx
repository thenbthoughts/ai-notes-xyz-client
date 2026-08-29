import { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import axiosCustom from "../../../../config/axiosCustom";

const SettingChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [capsOn, setCapsOn] = useState(false);
    const getStrength = (s: string) => { if(!s) return {label:"",color:""}; let sc=0; if(s.length>=8) sc++; if(/[A-Z]/.test(s)) sc++; if(/[0-9]/.test(s)) sc++; if(/[^A-Za-z0-9]/.test(s)) sc++; if(sc<=1) return {label:"Weak",color:"bg-red-500"}; if(sc===2) return {label:"Fair",color:"bg-yellow-500"}; if(sc===3) return {label:"Good",color:"bg-blue-500"}; return {label:"Strong",color:"bg-green-500"}; };
    const strength = getStrength(newPassword);

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
            
            setRequest({ loading: false, success: 'Password changed successfully!', error: '' }); toast.success('Password changed successfully!');
            
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
        <div className="w-full max-w-3xl">
            <Helmet><title>Change Password - Settings</title></Helmet>
            <div id="change-password">
                <h2 className="text-xl font-bold text-zinc-100 py-2">Change Password</h2>

                <div className="mb-4">
                    <label htmlFor="oldPassword" className="block text-zinc-300 font-bold mb-2">
                        Current Password
                    </label>
                    <input
                        type={showOldPassword ? "text" : "password"}
                        id="oldPassword"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                    />
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-zinc-400 hover:text-zinc-200"
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
                    <label htmlFor="newPassword" className="block text-zinc-300 font-bold mb-2">
                        New Password
                    </label>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password (minimum 8 characters)" aria-label="New password" onKeyUp={(e:any)=>{setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}} onKeyDown={(e:any)=>{setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}}
                    />
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-zinc-400 hover:text-zinc-200"
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
                    {newPassword && (<div className="mt-2 flex items-center gap-2" aria-label="Password strength"><div className="h-2 flex-1 rounded bg-zinc-700"><div className={"h-2 rounded "+strength.color} style={{width: strength.label==="Weak"?"25%":strength.label==="Fair"?"50%":strength.label==="Good"?"75%":"100%"}} /></div><span className="text-xs text-zinc-400">{strength.label}</span></div>)}
                    {capsOn && <p className="text-xs text-amber-400 mt-1" role="alert">Caps Lock is on</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-zinc-300 font-bold mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                    />
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-zinc-400 hover:text-zinc-200"
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
                        <p className="text-zinc-400">Loading...</p>
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
                    className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {request.loading ? 'Changing Password...' : 'Change Password'}
                </button>
            </div>
        </div>
    );
};

export default SettingChangePassword;