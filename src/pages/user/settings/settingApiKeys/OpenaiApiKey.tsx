import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const OpenaiApiKey = () => {
    const [apiKeyOpenai, setApiKeyOpenai] = useState("");

    const [requestOpenai, setRequestOpenai] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    const handleUpdateOpenai = async () => {
        setRequestOpenai({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiOpenai`,
                {
                    apiKeyOpenai,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestOpenai({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }

            setRequestOpenai({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor="apiKeyOpenai" className="block text-gray-700 font-bold mb-2">
                OpenAI Api Key
                {authState.apiKeyOpenaiValid ? (
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
                id="apiKeyOpenai"
                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={apiKeyOpenai}
                onChange={(e) => setApiKeyOpenai(e.target.value)}
            />
            <div className="mt-2">
                {(requestOpenai.loading || clearRequest.loading) && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestOpenai.loading && !clearRequest.loading && requestOpenai.success !== '' && (
                    <p className="text-green-500">API Key verified and saved successfully!</p>
                )}
                {!requestOpenai.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">API Key cleared successfully!</p>
                )}
                {!requestOpenai.loading && !clearRequest.loading && (requestOpenai.error !== '' || clearRequest.error !== '') && (
                    <p className="text-red-500">Error. Please try again.</p>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleUpdateOpenai}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    disabled={requestOpenai.loading || clearRequest.loading}
                >
                    Verify and save
                </button>
                <button
                    onClick={() => handleClearApiKey('openai')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestOpenai.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default OpenaiApiKey;