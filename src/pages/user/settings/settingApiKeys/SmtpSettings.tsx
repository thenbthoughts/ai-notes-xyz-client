import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const SmtpSettings = () => {
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPassword, setSmtpPassword] = useState("");
    const [smtpFrom, setSmtpFrom] = useState("");
    const [smtpTo, setSmtpTo] = useState("");

    const [requestSmtp, setRequestSmtp] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const handleUpdateSmtp = async () => {
        setRequestSmtp({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiSmtp`,
                {
                    "smtpHost": smtpHost,
                    "smtpPort": smtpPort,
                    "smtpUser": smtpUser,
                    "smtpPassword": smtpPassword,

                    // fields send from email
                    "smtpFrom": smtpFrom,
                    "smtpTo": smtpTo
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestSmtp({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestSmtp({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    return (
        <div className="mb-4">
            <div>
                <label htmlFor="smtpHost" className="block text-gray-700 font-bold mb-2">
                    SMTP Host
                    {authState.smtpValid ? (
                        <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Valid
                        </span>
                    ) : (
                        <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Not set
                        </span>
                    )}
                </label>
                <input
                    type="text"
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="smtpPort" className="block text-gray-700 font-bold mb-2">
                    SMTP Port
                </label>
                <input
                    type="number"
                    id="smtpPort"
                    placeholder="587"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="smtpUser" className="block text-gray-700 font-bold mb-2">
                    SMTP User
                </label>
                <input
                    type="text"
                    id="smtpUser"
                    placeholder="your-email@gmail.com"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="smtpPassword" className="block text-gray-700 font-bold mb-2">
                    SMTP Password
                </label>
                <input
                    type="password"
                    id="smtpPassword"
                    placeholder="your-app-password"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="smtpFrom" className="block text-gray-700 font-bold mb-2">
                    SMTP From
                </label>
                <input
                    type="email"
                    id="smtpFrom"
                    placeholder="sender@example.com"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="smtpTo" className="block text-gray-700 font-bold mb-2">
                    SMTP To
                </label>
                <input
                    type="email"
                    id="smtpTo"
                    placeholder="recipient@example.com"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={smtpTo}
                    onChange={(e) => setSmtpTo(e.target.value)}
                />
            </div>

            <div className="mt-2">
                {requestSmtp.loading && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestSmtp.loading && requestSmtp.success !== '' && (
                    <p className="text-green-500">SMTP settings verified and saved successfully!</p>
                )}
                {!requestSmtp.loading && requestSmtp.error !== '' && (
                    <p className="text-red-500 bg-red-100 p-1 rounded">{requestSmtp.error}</p>
                )}
            </div>
            <button
                onClick={handleUpdateSmtp}
                className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
            >
                Verify and save
            </button>
        </div>
    );
};

export default SmtpSettings;