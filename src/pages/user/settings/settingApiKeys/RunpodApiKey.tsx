import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const RunpodApiKey = () => {
    const [apiKeyRunpod, setApiKeyRunpod] = useState("");

    const [requestRunpod, setRequestRunpod] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const handleUpdateRunpod = async () => {
        setRequestRunpod({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiRunpod`,
                {
                    apiKeyRunpod,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestRunpod({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }

            setRequestRunpod({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor="apiKeyRunpod" className="block text-gray-700 font-bold mb-2">
                RunPod Api Key
                {authState.apiKeyRunpodValid ? (
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
                id="apiKeyRunpod"
                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={apiKeyRunpod}
                onChange={(e) => setApiKeyRunpod(e.target.value)}
            />
            <div className="mt-2">
                {requestRunpod.loading && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestRunpod.loading && requestRunpod.success !== '' && (
                    <p className="text-green-500">API Key verified and saved successfully!</p>
                )}
                {!requestRunpod.loading && requestRunpod.error !== '' && (
                    <p className="text-red-500">Error verifying API Key. Please try again.</p>
                )}
            </div>
            <button
                onClick={handleUpdateRunpod}
                className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
            >
                Verify and save
            </button>
        </div>
    );
};

export default RunpodApiKey;