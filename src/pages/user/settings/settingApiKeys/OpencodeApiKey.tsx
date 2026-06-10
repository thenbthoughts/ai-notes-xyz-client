import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const OpencodeApiKey = () => {
    const [opencodeUrl, setOpencodeUrl] = useState("");
    const [opencodeUsername, setOpencodeUsername] = useState("");
    const [opencodePassword, setOpencodePassword] = useState("");

    const [requestState, setRequestState] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    const handleUpdate = async () => {
        setRequestState({ loading: true, success: '', error: '' });

        try {
            await axiosCustom.post(
                `/api/user/api-keys/updateUserApiOpencode`,
                {
                    opencodeUrl,
                    opencodeUsername,
                    opencodePassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestState({ loading: false, success: 'OpenCode verified and saved successfully!', error: '' });
        } catch (error: unknown) {
            console.error("Error updating OpenCode:", error);

            let errorStr = '';
            if (error && typeof error === 'object' && 'response' in error) {
                const r = (error as { response?: { data?: { error?: string; message?: string } } }).response?.data;
                if (typeof r?.error === 'string') {
                    errorStr = r.error;
                } else if (typeof r?.message === 'string') {
                    errorStr = r.message;
                }
            }
            setRequestState({
                loading: false,
                success: '',
                error: `Error updating OpenCode. ${errorStr}`.trim(),
            });
        } finally {
            const randomNum = Math.floor(Math.random() * 1_000_000);
            setAuthStateReload(randomNum);
        }
    };

    return (
        <div className="mb-4">
            <div>
                <div className="block text-gray-700 font-bold mb-2">
                    OpenCode
                    {authState.apiKeyOpencodeValid ? (
                        <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Valid
                        </span>
                    ) : (
                        <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Not set
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                    Enter the OpenCode server origin (e.g. <code className="bg-gray-100 px-1 rounded">http://localhost:4096/</code>)
                    and HTTP Basic credentials. Verify calls the OpenCode SDK health endpoint (<code className="bg-gray-100 px-1 rounded">GET /global/health</code>).
                </p>
            </div>

            <div>
                <label htmlFor="opencodeUrl" className="block text-gray-700 font-bold mb-2">
                    OpenCode URL
                </label>
                <input
                    type="text"
                    id="opencodeUrl"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://your-opencode-host/"
                    value={opencodeUrl}
                    onChange={(e) => setOpencodeUrl(e.target.value)}
                />
            </div>

            <div className="mt-3">
                <label htmlFor="opencodeUsername" className="block text-gray-700 font-bold mb-2">
                    User ID (Basic auth)
                </label>
                <input
                    type="text"
                    id="opencodeUsername"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="OpenCode basic auth userId"
                    value={opencodeUsername}
                    onChange={(e) => setOpencodeUsername(e.target.value)}
                    autoComplete="userId"
                />
            </div>

            <div className="mt-3">
                <label htmlFor="opencodePassword" className="block text-gray-700 font-bold mb-2">
                    Password (Basic auth)
                </label>
                <input
                    type="password"
                    id="opencodePassword"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="OpenCode basic auth password"
                    value={opencodePassword}
                    onChange={(e) => setOpencodePassword(e.target.value)}
                    autoComplete="current-password"
                />
            </div>

            <div className="mt-2">
                {(requestState.loading || clearRequest.loading) && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestState.loading && !clearRequest.loading && requestState.success !== '' && (
                    <p className="text-green-500">{requestState.success}</p>
                )}
                {!requestState.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">OpenCode settings cleared successfully!</p>
                )}
                {!requestState.loading && !clearRequest.loading && (requestState.error !== '' || clearRequest.error !== '') && (
                    <p className="text-red-500 bg-red-100 p-1 rounded">{requestState.error || clearRequest.error}</p>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    disabled={requestState.loading || clearRequest.loading}
                >
                    Verify and save
                </button>
                <button
                    type="button"
                    onClick={() => handleClearApiKey('opencode')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestState.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default OpencodeApiKey;
