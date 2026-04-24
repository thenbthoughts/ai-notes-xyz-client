import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from "../../../../jotai/stateJotaiAuth";
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const OpencodeApiKey = () => {
    const [apiKeyOpencode, setApiKeyOpencode] = useState("");
    const [apiKeyOpencodeEndpoint, setApiKeyOpencodeEndpoint] = useState("https://opencode.example.com/");
    const [apiKeyOpencodeBasicAuthUsername, setApiKeyOpencodeBasicAuthUsername] = useState("");
    const [apiKeyOpencodeBasicAuthPassword, setApiKeyOpencodeBasicAuthPassword] = useState("");

    const [requestOpencode, setRequestOpencode] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    const handleUpdateOpencode = async () => {
        setRequestOpencode({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiOpencode`,
                {
                    apiKeyOpencode,
                    apiKeyOpencodeEndpoint,
                    apiKeyOpencodeBasicAuthUsername,
                    apiKeyOpencodeBasicAuthPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestOpencode({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            } else if (typeof error?.response?.data?.message === 'string') {
                errorStr = error?.response?.data?.message;
            }

            setRequestOpencode({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            );
            setAuthStateReload(randomNum);
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor="apiKeyOpencodeEndpoint" className="block text-gray-700 font-bold mb-2">
                OpenCode URL
            </label>
            <input
                type="text"
                id="apiKeyOpencodeEndpoint"
                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3"
                placeholder="https://opencode.example.com/"
                value={apiKeyOpencodeEndpoint}
                onChange={(e) => setApiKeyOpencodeEndpoint(e.target.value)}
            />

            <label htmlFor="apiKeyOpencodeBasicAuthUsername" className="block text-gray-700 font-bold mb-2">
                Basic Auth Username (optional)
            </label>
            <input
                type="text"
                id="apiKeyOpencodeBasicAuthUsername"
                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3"
                placeholder="Optional username"
                value={apiKeyOpencodeBasicAuthUsername}
                onChange={(e) => setApiKeyOpencodeBasicAuthUsername(e.target.value)}
            />

            <label htmlFor="apiKeyOpencodeBasicAuthPassword" className="block text-gray-700 font-bold mb-2">
                Basic Auth Password (optional)
            </label>
            <input
                type="password"
                id="apiKeyOpencodeBasicAuthPassword"
                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3"
                placeholder="Optional password"
                value={apiKeyOpencodeBasicAuthPassword}
                onChange={(e) => setApiKeyOpencodeBasicAuthPassword(e.target.value)}
            />

            <label htmlFor="apiKeyOpencode" className="block text-gray-700 font-bold mb-2">
                OpenCode API Key
                {authState.apiKeyOpencodeValid ? (
                    <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                        Valid
                    </span>
                ) : (
                    <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                        Not set
                    </span>
                )}
            </label>
            <p className="text-sm text-gray-600 mb-2">
                Get your key from{" "}
                <a
                    href="https://opencode.ai/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                >
                    https://opencode.ai/
                </a>
            </p>
            <input
                type="text"
                id="apiKeyOpencode"
                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Optional API key"
                value={apiKeyOpencode}
                onChange={(e) => setApiKeyOpencode(e.target.value)}
            />
            <div className="mt-2">
                {(requestOpencode.loading || clearRequest.loading) && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestOpencode.loading && !clearRequest.loading && requestOpencode.success !== '' && (
                    <p className="text-green-500">API Key saved successfully!</p>
                )}
                {!requestOpencode.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">API Key cleared successfully!</p>
                )}
                {!requestOpencode.loading && !clearRequest.loading && (requestOpencode.error !== '' || clearRequest.error !== '') && (
                    <p className="text-red-500">Error. Please try again.</p>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleUpdateOpencode}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    disabled={requestOpencode.loading || clearRequest.loading}
                >
                    Save
                </button>
                <button
                    onClick={() => handleClearApiKey('opencode')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestOpencode.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default OpencodeApiKey;
