import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const LocalaiApiKey = () => {
    const [apiKeyLocalaiEndpoint, setApiKeyLocalaiEndpoint] = useState("");
    const [apiKeyLocalai, setApiKeyLocalai] = useState("");

    const [requestLocalai, setRequestLocalai] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const handleUpdateLocalai = async () => {
        setRequestLocalai({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiLocalai`,
                {
                    apiKeyLocalaiEndpoint,
                    apiKeyLocalai,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestLocalai({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }

            setRequestLocalai({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
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
                <label htmlFor="apiKeyLocalai" className="block text-gray-700 font-bold mb-2">
                    LocalAI Api Key (Optional)
                    {authState.apiKeyLocalaiValid ? (
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
                <label htmlFor="apiKeyLocalaiEndpoint" className="block text-gray-700 font-bold mb-2">
                    LocalAI Endpoint
                </label>
                <input
                    type="text"
                    id="apiKeyLocalaiEndpoint"
                    placeholder="http://localhost:8080"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyLocalaiEndpoint}
                    onChange={(e) => setApiKeyLocalaiEndpoint(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="apiKeyLocalai" className="block text-gray-700 font-bold mb-2">
                    LocalAI API Key (Optional)
                </label>
                <input
                    type="text"
                    id="apiKeyLocalai"
                    placeholder="Leave empty if not required"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyLocalai}
                    onChange={(e) => setApiKeyLocalai(e.target.value)}
                />
            </div>

            <div className="mt-2">
                {requestLocalai.loading && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestLocalai.loading && requestLocalai.success !== '' && (
                    <p className="text-green-500">API Key verified and saved successfully!</p>
                )}
                {!requestLocalai.loading && requestLocalai.error !== '' && (
                    <p className="text-red-500 bg-red-100 p-1 rounded">{requestLocalai.error}</p>
                )}
            </div>
            <button
                onClick={handleUpdateLocalai}
                className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
            >
                Verify and save
            </button>
        </div>
    );
};

export default LocalaiApiKey;