import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const OpencodeWithShellApiKey = () => {
    const [opencodeUrl, setOpencodeUrl] = useState("");
    const [opencodeUsername, setOpencodeUsername] = useState("");
    const [opencodePassword, setOpencodePassword] = useState("");
    const [opencodeWithCustomShellUrl, setOpencodeWithCustomShellUrl] = useState("");
    const [opencodeWithCustomShellToken, setOpencodeWithCustomShellToken] = useState("");

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
                `/api/user/api-keys/updateUserApiOpencodeWithShell`,
                {
                    opencodeUrl,
                    opencodeUsername,
                    opencodePassword,
                    opencodeWithCustomShellUrl,
                    opencodeWithCustomShellToken,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestState({
                loading: false,
                success: 'OpenCode and shell verified and saved successfully!',
                error: '',
            });
        } catch (error: unknown) {
            console.error("Error updating OpenCode with shell:", error);

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
                error: `Error saving configuration. ${errorStr}`.trim(),
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
                    OpenCode with Shell
                    {authState.apiKeyOpencodeWithShellValid ? (
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
                    Set the OpenCode server URL for this integration and HTTP Basic credentials (saved as{' '}
                    <code className="bg-gray-100 px-1 rounded">opencodeUsername</code> and{' '}
                    <code className="bg-gray-100 px-1 rounded">opencodePassword</code>). Add <strong>ai-notes-xyz-shell</strong>: origin only
                    (no <code className="bg-gray-100 px-1 rounded">/api</code> path) and API token (
                    <code className="bg-gray-100 px-1 rounded">X-API-Token</code>).
                    OpenCode <code className="bg-gray-100 px-1 rounded">GET /global/health</code> and shell{' '}
                    <code className="bg-gray-100 px-1 rounded">/api/shell-engine/about</code> +{' '}
                    <code className="bg-gray-100 px-1 rounded">/about/private</code> must succeed.
                </p>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">OpenCode</h4>
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

                <div className="mt-3">
                    <label htmlFor="opencodeWithShellBasicUser" className="block text-gray-700 font-bold mb-2">
                        User ID (Basic auth, shared with OpenCode)
                    </label>
                    <input
                        type="text"
                        id="opencodeWithShellBasicUser"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={opencodeUsername}
                        onChange={(e) => setOpencodeUsername(e.target.value)}
                        autoComplete="userId"
                    />
                </div>

                <div className="mt-3">
                    <label htmlFor="opencodeWithShellBasicPass" className="block text-gray-700 font-bold mb-2">
                        Password (Basic auth, shared with OpenCode)
                    </label>
                    <input
                        type="password"
                        id="opencodeWithShellBasicPass"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={opencodePassword}
                        onChange={(e) => setOpencodePassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Shell execute</h4>
                <label htmlFor="opencodeWithCustomShellUrl" className="block text-gray-700 font-bold mb-2">
                    Shell service URL
                </label>
                <input
                    type="text"
                    id="opencodeWithCustomShellUrl"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="http://localhost:2001/"
                    value={opencodeWithCustomShellUrl}
                    onChange={(e) => setOpencodeWithCustomShellUrl(e.target.value)}
                />

                <div className="mt-3">
                    <label htmlFor="opencodeWithCustomShellToken" className="block text-gray-700 font-bold mb-2">
                        API token
                    </label>
                    <input
                        type="password"
                        id="opencodeWithCustomShellToken"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Same value as API_TOKEN on the shell server"
                        value={opencodeWithCustomShellToken}
                        onChange={(e) => setOpencodeWithCustomShellToken(e.target.value)}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="mt-2">
                {(requestState.loading || clearRequest.loading) && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestState.loading && !clearRequest.loading && requestState.success !== '' && (
                    <p className="text-green-500">{requestState.success}</p>
                )}
                {!requestState.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">OpenCode with shell settings cleared successfully!</p>
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
                    onClick={() => handleClearApiKey('opencodeWithShell')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestState.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default OpencodeWithShellApiKey;
