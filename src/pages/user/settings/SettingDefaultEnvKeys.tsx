import { useState } from "react";
import { useSetAtom } from "jotai";

import { stateJotaiAuthReloadAtom } from '../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../config/axiosCustom";

const SettingDefaultEnvKeys = () => {
    // location
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    // success or failed
    const [
        request,
        setRequest,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    })

    const handleUpdate = async () => {
        setRequest({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/apiKeyDefault/crud/updateApiKeyDefault`,
                {
                    
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequest({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error) {
            console.error("Error updating user:", error);
            setRequest({ loading: false, success: '', error: 'Error updating user. Please try again.' });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const renderApiKeys = () => {
        return (
            <div
                id="api-keys"
            >
                <h2 className="text-xl font-bold text-gray-900 py-2">Set Default Api Keys</h2>

                <p className="text-white-500 text-sm mb-4">
                    To set your default API keys, click the button below.
                </p>
                {request.success !== "" && (
                    <p className="rounded px-2 bg-green-100 text-green-500 text-sm py-2">{request.success}</p>
                )}
                {request.error !== "" && (
                    <p className="rounded px-2 bg-red-100 text-red-500 text-sm py-2">{request.error}</p>
                )}
                {request.loading && (
                     <button
                        className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                        Updating...
                    </button>
                )}
                {!request.loading && (
                    <button
                        onClick={handleUpdate}
                        className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                        Set Default API Keys
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="pt-5">
            {renderApiKeys()}
        </div>
    );
};

export default SettingDefaultEnvKeys;