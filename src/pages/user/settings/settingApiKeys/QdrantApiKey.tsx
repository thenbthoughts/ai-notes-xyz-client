import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const QdrantApiKey = () => {
    const [apiKeyQdrantEndpoint, setApiKeyQdrantEndpoint] = useState("");
    const [apiKeyQdrantPassword, setApiKeyQdrantPassword] = useState("");

    const [requestQdrant, setRequestQdrant] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const handleUpdateQdrant = async () => {
        setRequestQdrant({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiQdrant`,
                {
                    apiKeyQdrantEndpoint,
                    apiKeyQdrantPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestQdrant({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestQdrant({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
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
                <label htmlFor="apiKeyOllama" className="block text-gray-700 font-bold mb-2">
                    Qdrant Api Key
                    {authState.apiKeyQdrantValid ? (
                        <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Valid
                        </span>
                    ) : (
                        <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Not set
                        </span>
                    )}
                </label>
            </div>

            <div>
                <label htmlFor="apiKeyQdrantEndpoint" className="block text-gray-700 font-bold mb-2">
                    Qdrant Endpoint
                </label>
                <input
                    type="text"
                    id="apiKeyQdrantEndpoint"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyQdrantEndpoint}
                    onChange={(e) => setApiKeyQdrantEndpoint(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="apiKeyQdrantPassword" className="block text-gray-700 font-bold mb-2">
                    Qdrant Password
                </label>
                <input
                    type="text"
                    id="apiKeyQdrantPassword"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyQdrantPassword}
                    onChange={(e) => setApiKeyQdrantPassword(e.target.value)}
                />
            </div>

            <div className="mt-2">
                {requestQdrant.loading && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestQdrant.loading && requestQdrant.success !== '' && (
                    <p className="text-green-500">API Key verified and saved successfully!</p>
                )}
                {!requestQdrant.loading && requestQdrant.error !== '' && (
                    <p className="text-red-500 bg-red-100 p-1 rounded">{requestQdrant.error}</p>
                )}
            </div>
            <button
                onClick={handleUpdateQdrant}
                className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
            >
                Verify and save
            </button>
        </div>
    );
};

export default QdrantApiKey;