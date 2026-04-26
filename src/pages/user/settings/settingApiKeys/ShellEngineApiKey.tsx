import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const ShellEngineApiKey = () => {
    const [shellEngineUrl, setShellEngineUrl] = useState("");
    const [shellEngineToken, setShellEngineToken] = useState("");

    const [requestShell, setRequestShell] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    const handleUpdateShellEngine = async () => {
        setRequestShell({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiShellEngine`,
                {
                    shellEngineUrl,
                    shellEngineToken,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestShell({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                errorStr = error?.response?.data?.error;
            } else if (typeof error?.response?.data?.message === 'string') {
                errorStr = error?.response?.data?.message;
            }
            setRequestShell({
                loading: false,
                success: '',
                error: `Error updating user. Please try again. ${errorStr}`,
            });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            );
            setAuthStateReload(randomNum);
        }
    };

    return (
        <div className="mb-4">
            <div>
                <div className="block text-gray-700 font-bold mb-2">
                    Shell execute (ai-notes-xyz-shell)
                    {authState.shellEngineValid ? (
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
                    Enter the shell server origin only (no <code className="bg-gray-100 px-1 rounded">/api</code> path), e.g.{' '}
                    <code className="bg-gray-100 px-1 rounded">http://localhost:2001/</code>.
                    Token is <code className="bg-gray-100 px-1 rounded">API_TOKEN</code> / header <code className="bg-gray-100 px-1 rounded">X-API-Token</code>.
                    <span className="block mt-1">Verify and save calls public <code className="bg-gray-100 px-1 rounded">/api/shell-engine/about</code> and token-checked <code className="bg-gray-100 px-1 rounded">/api/shell-engine/about/private</code>; both must succeed.</span>
                </p>
            </div>

            <div>
                <label htmlFor="shellEngineUrl" className="block text-gray-700 font-bold mb-2">
                    Shell service URL
                </label>
                <input
                    type="text"
                    id="shellEngineUrl"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="http://localhost:2001/"
                    value={shellEngineUrl}
                    onChange={(e) => setShellEngineUrl(e.target.value)}
                />
            </div>

            <div className="mt-3">
                <label htmlFor="shellEngineToken" className="block text-gray-700 font-bold mb-2">
                    API token
                </label>
                <input
                    type="password"
                    id="shellEngineToken"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Same value as API_TOKEN on the shell server"
                    value={shellEngineToken}
                    onChange={(e) => setShellEngineToken(e.target.value)}
                    autoComplete="off"
                />
            </div>

            <div className="mt-2">
                {(requestShell.loading || clearRequest.loading) && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestShell.loading && !clearRequest.loading && requestShell.success !== '' && (
                    <p className="text-green-500">URL and token verified and saved successfully!</p>
                )}
                {!requestShell.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">Shell settings cleared successfully!</p>
                )}
                {!requestShell.loading && !clearRequest.loading && (requestShell.error !== '' || clearRequest.error !== '') && (
                    <p className="text-red-500 bg-red-100 p-1 rounded">{requestShell.error || clearRequest.error}</p>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    onClick={handleUpdateShellEngine}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    disabled={requestShell.loading || clearRequest.loading}
                >
                    Verify and save
                </button>
                <button
                    type="button"
                    onClick={() => handleClearApiKey('shellEngine')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestShell.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default ShellEngineApiKey;
