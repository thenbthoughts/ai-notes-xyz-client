import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Eye, EyeOff } from "lucide-react";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const AgentWorkspaceApiKey = () => {
    const [agentWorkspaceDesktopUrl, setAgentWorkspaceDesktopUrl] = useState("");
    const [agentWorkspaceDesktopUsername, setAgentWorkspaceDesktopUsername] = useState("");
    const [agentWorkspaceDesktopPassword, setAgentWorkspaceDesktopPassword] = useState("");
    const [agentWorkspaceApiUrl, setAgentWorkspaceApiUrl] = useState("");
    const [agentWorkspaceApiToken, setAgentWorkspaceApiToken] = useState("");
    const [opencodeUrl, setOpencodeUrl] = useState("");
    const [opencodeUsername, setOpencodeUsername] = useState("opencode");
    const [opencodePassword, setOpencodePassword] = useState("");
    const [showDesktopPassword, setShowDesktopPassword] = useState(false);
    const [showApiToken, setShowApiToken] = useState(false);
    const [showOpencodePassword, setShowOpencodePassword] = useState(false);

    const [requestState, setRequestState] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const res = await axiosCustom.get('/api/user/api-keys/getUserApiAgentWorkspace', { withCredentials: true });
                if (res.data?.desktopUrl) setAgentWorkspaceDesktopUrl(res.data.desktopUrl);
                if (res.data?.apiUrl) setAgentWorkspaceApiUrl(res.data.apiUrl);
                if (typeof res.data?.opencodeUrl === 'string') setOpencodeUrl(res.data.opencodeUrl);
                if (typeof res.data?.opencodeUsername === 'string' && res.data.opencodeUsername.trim()) setOpencodeUsername(res.data.opencodeUsername.trim());
            } catch { /* ignore */ }
        };
        void fetchCurrent();
    }, []);

    const handleUpdate = async () => {
        setRequestState({ loading: true, success: '', error: '' });

        try {
            await axiosCustom.post(
                `/api/user/api-keys/updateUserApiAgentWorkspace`,
                {
                    agentWorkspaceDesktopUrl,
                    agentWorkspaceDesktopUsername,
                    agentWorkspaceDesktopPassword,
                    agentWorkspaceApiUrl,
                    agentWorkspaceApiToken,
                    opencodeUrl,
                    opencodeUsername: opencodeUsername.trim() || 'opencode',
                    opencodePassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestState({ loading: false, success: 'User updated successfully!', error: '' });
        } catch (error: any) {
            console.error("Error updating Agent Workspace:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                errorStr = error?.response?.data?.error;
            } else if (typeof error?.response?.data?.message === 'string') {
                errorStr = error?.response?.data?.message;
            }
            setRequestState({
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
                <div className="block text-zinc-300 font-bold mb-2">
                    Agent Workspace (ai-notes-xyz-agent-workspace)
                    {authState.agentWorkspaceValid ? (
                        <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Valid
                        </span>
                    ) : (
                        <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Not set
                        </span>
                    )}
                </div>
                <p className="text-sm text-zinc-400 mb-3 space-y-1">
                    <span className="block">
                        Enter the desktop origin, e.g.{' '}
                        <code className="bg-zinc-800 px-1 rounded">http://localhost:3010/</code> or{' '}
                        <code className="bg-zinc-800 px-1 rounded">https://localhost:3011/</code>.
                    </span>
                    <span className="block">
                        Enter the API origin only (no{' '}
                        <code className="bg-zinc-800 px-1 rounded">/api</code> path), e.g.{' '}
                        <code className="bg-zinc-800 px-1 rounded">http://localhost:2001/</code>.
                    </span>
                    <span className="block">
                        Basic auth is the desktop login (
                        <code className="bg-zinc-800 px-1 rounded">CUSTOM_USER</code> /{' '}
                        <code className="bg-zinc-800 px-1 rounded">PASSWORD</code>, defaults{' '}
                        <code className="bg-zinc-800 px-1 rounded">abc</code> /{' '}
                        <code className="bg-zinc-800 px-1 rounded">agentworkspace</code>
                        ) or reverse-proxy credentials.
                    </span>
                    <span className="block">
                        Token is <code className="bg-zinc-800 px-1 rounded">API_TOKEN</code> / header{' '}
                        <code className="bg-zinc-800 px-1 rounded">X-API-Token</code>.
                    </span>
                    <span className="block">
                        Verify and save calls public{' '}
                        <code className="bg-zinc-800 px-1 rounded">/api/shell-engine/about</code> and token-checked{' '}
                        <code className="bg-zinc-800 px-1 rounded">/api/shell-engine/about/private</code>; both must return{' '}
                        <code className="bg-zinc-800 px-1 rounded">ai-notes-xyz-agent-workspace</code>.
                    </span>
                </p>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">Desktop</h4>
                <label htmlFor="agentWorkspaceDesktopUrl" className="block text-zinc-300 font-bold mb-2">
                    Desktop URL
                </label>
                <input
                    type="text"
                    id="agentWorkspaceDesktopUrl"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="http://localhost:3010/"
                    value={agentWorkspaceDesktopUrl}
                    onChange={(e) => setAgentWorkspaceDesktopUrl(e.target.value)}
                />

                <div className="mt-3">
                    <label htmlFor="agentWorkspaceDesktopUsername" className="block text-zinc-300 font-bold mb-2">
                        Desktop Basic Auth Username
                    </label>
                    <input
                        type="text"
                        id="agentWorkspaceDesktopUsername"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="abc"
                        value={agentWorkspaceDesktopUsername}
                        onChange={(e) => setAgentWorkspaceDesktopUsername(e.target.value)}
                        autoComplete="username"
                    />
                </div>

                <div className="mt-3">
                    <label htmlFor="agentWorkspaceDesktopPassword" className="block text-zinc-300 font-bold mb-2">
                        Desktop Basic Auth Password
                    </label>
                    <div className="relative">
                        <input
                            type={showDesktopPassword ? "text" : "password"}
                            id="agentWorkspaceDesktopPassword"
                            className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 pr-10 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Same value as PASSWORD on the desktop"
                            value={agentWorkspaceDesktopPassword}
                            onChange={(e) => setAgentWorkspaceDesktopPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowDesktopPassword(!showDesktopPassword)}
                            aria-label={showDesktopPassword ? "Hide password" : "Show password"}
                            title={showDesktopPassword ? "Hide password" : "Show password"}
                        >
                            {showDesktopPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowDesktopPassword(!showDesktopPassword)}
                    >
                        {showDesktopPassword ? "Hide password" : "Show password"}
                    </button>
                </div>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">API</h4>
                <label htmlFor="agentWorkspaceApiUrl" className="block text-zinc-300 font-bold mb-2">
                    Agent Workspace API URL
                </label>
                <input
                    type="text"
                    id="agentWorkspaceApiUrl"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="http://localhost:2001/"
                    value={agentWorkspaceApiUrl}
                    onChange={(e) => setAgentWorkspaceApiUrl(e.target.value)}
                />

                <div className="mt-3">
                    <label htmlFor="agentWorkspaceApiToken" className="block text-zinc-300 font-bold mb-2">
                        API token
                    </label>
                    <div className="relative">
                        <input
                            type={showApiToken ? "text" : "password"}
                            id="agentWorkspaceApiToken"
                            className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 pr-10 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Same value as API_TOKEN"
                            value={agentWorkspaceApiToken}
                            onChange={(e) => setAgentWorkspaceApiToken(e.target.value)}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowApiToken(!showApiToken)}
                            aria-label={showApiToken ? "Hide token" : "Show token"}
                            title={showApiToken ? "Hide token" : "Show token"}
                        >
                            {showApiToken ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowApiToken(!showApiToken)}
                    >
                        {showApiToken ? "Hide token" : "Show token"}
                    </button>
                </div>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">Opencode <span className="text-xs font-normal text-zinc-400">(optional)</span></h4>
                <p className="text-xs text-zinc-400 mb-2">
                    If set, <span className="font-mono text-zinc-300">Open session</span> will open this Opencode server instead of <code className="bg-zinc-800 px-1 rounded">http://localhost:4096</code>. Leave empty to use the workspace host on port 4096.
                </p>
                <label htmlFor="opencodeUrl" className="block text-zinc-300 font-bold mb-2">
                    Opencode URL
                </label>
                <input
                    type="text"
                    id="opencodeUrl"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="http://localhost:4096"
                    value={opencodeUrl}
                    onChange={(e) => setOpencodeUrl(e.target.value)}
                />

                <div className="mt-3">
                    <label htmlFor="opencodeUsername" className="block text-zinc-300 font-bold mb-2">
                        Opencode Username
                    </label>
                    <input
                        type="text"
                        id="opencodeUsername"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="opencode"
                        value={opencodeUsername}
                        onChange={(e) => setOpencodeUsername(e.target.value)}
                        autoComplete="username"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Defaults to <code className="bg-zinc-800 px-1 rounded">opencode</code> if left empty.</p>
                </div>

                <div className="mt-3">
                    <label htmlFor="opencodePassword" className="block text-zinc-300 font-bold mb-2">
                        Opencode Password
                    </label>
                    <div className="relative">
                        <input
                            type={showOpencodePassword ? "text" : "password"}
                            id="opencodePassword"
                            className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 pr-10 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Same value as OPENCODE_SERVER_PASSWORD"
                            value={opencodePassword}
                            onChange={(e) => setOpencodePassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-200"
                            onClick={() => setShowOpencodePassword(!showOpencodePassword)}
                            aria-label={showOpencodePassword ? "Hide password" : "Show password"}
                            title={showOpencodePassword ? "Hide password" : "Show password"}
                        >
                            {showOpencodePassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <button
                        type="button"
                        className="flex items-center mt-1 text-sm text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowOpencodePassword(!showOpencodePassword)}
                    >
                        {showOpencodePassword ? "Hide password" : "Show password"}
                    </button>
                </div>
            </div>

            <div className="mt-2">
                {(requestState.loading || clearRequest.loading) && (
                    <p className="text-zinc-400">Loading...</p>
                )}
                {!requestState.loading && !clearRequest.loading && requestState.success !== '' && (
                    <p className="text-green-500">Desktop, basic auth, API URL, and token verified and saved successfully!</p>
                )}
                {!requestState.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">Agent Workspace settings cleared successfully!</p>
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
                    onClick={() => handleClearApiKey('agentWorkspace')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestState.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default AgentWorkspaceApiKey;
