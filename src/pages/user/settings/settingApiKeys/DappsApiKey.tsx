import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Eye, EyeOff } from "lucide-react";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const DappsApiKey = () => {
    const [gitProvider, setGitProvider] = useState("gitea");
    const [gitUrl, setGitUrl] = useState("");
    const [gitToken, setGitToken] = useState("");
    const [gitOwner, setGitOwner] = useState("");
    const [coolifyBaseUrl, setCoolifyBaseUrl] = useState("");
    const [coolifyToken, setCoolifyToken] = useState("");
    const [coolifyProjectId, setCoolifyProjectId] = useState("");
    const [coolifyEnvId, setCoolifyEnvId] = useState("");
    const [coolifyProjectIdProd, setCoolifyProjectIdProd] = useState("");
    const [coolifyEnvIdProd, setCoolifyEnvIdProd] = useState("");
    const [deployKeyUuid, setDeployKeyUuid] = useState("");
    const [baseDomain, setBaseDomain] = useState("");
    const [showGitToken, setShowGitToken] = useState(false);
    const [showCoolifyToken, setShowCoolifyToken] = useState(false);

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
                const res = await axiosCustom.get('/api/user/api-keys/getUserApiDapps', { withCredentials: true });
                if (typeof res.data?.gitProvider === 'string') {
                    setGitProvider(res.data.gitProvider);
                }
                if (typeof res.data?.gitUrl === 'string') {
                    setGitUrl(res.data.gitUrl);
                }
                if (typeof res.data?.gitOwner === 'string') {
                    setGitOwner(res.data.gitOwner);
                }
                if (typeof res.data?.coolifyBaseUrl === 'string') {
                    setCoolifyBaseUrl(res.data.coolifyBaseUrl);
                }
                if (typeof res.data?.coolifyProjectId === 'string') {
                    setCoolifyProjectId(res.data.coolifyProjectId);
                }
                if (typeof res.data?.coolifyEnvId === 'string') {
                    setCoolifyEnvId(res.data.coolifyEnvId);
                }
                if (typeof res.data?.coolifyProjectIdProd === 'string') {
                    setCoolifyProjectIdProd(res.data.coolifyProjectIdProd);
                }
                if (typeof res.data?.coolifyEnvIdProd === 'string') {
                    setCoolifyEnvIdProd(res.data.coolifyEnvIdProd);
                }
                if (typeof res.data?.deployKeyUuid === 'string') {
                    setDeployKeyUuid(res.data.deployKeyUuid);
                }
                if (typeof res.data?.baseDomain === 'string') {
                    setBaseDomain(res.data.baseDomain);
                }
            } catch {
                // ignore
            }
        };
        void fetchCurrent();
    }, []);

    const handleUpdate = async () => {
        setRequestState({ loading: true, success: '', error: '' });
        try {
            await axiosCustom.post(
                `/api/user/api-keys/updateUserApiDapps`,
                {
                    dappsGitProvider: gitProvider,
                    dappsGitUrl: gitUrl,
                    dappsGitToken: gitToken,
                    dappsGitOwner: gitOwner,
                    dappsCoolifyBaseUrl: coolifyBaseUrl,
                    dappsCoolifyToken: coolifyToken,
                    dappsCoolifyProjectId: coolifyProjectId,
                    dappsCoolifyEnvId: coolifyEnvId,
                    dappsCoolifyProjectIdProd: coolifyProjectIdProd,
                    dappsCoolifyEnvIdProd: coolifyEnvIdProd,
                    dappsDeployKeyUuid: deployKeyUuid,
                    dappsBaseDomain: baseDomain,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestState({ loading: false, success: 'DApps verified and saved! Test repo was created and deleted.', error: '' });
            setGitToken('');
            setCoolifyToken('');
        } catch (error: any) {
            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                errorStr = error?.response?.data?.error;
            }
            setRequestState({
                loading: false,
                success: '',
                error: `Verify failed. Please try again. ${errorStr}`,
            });
        } finally {
            const randomNum = Math.floor(Math.random() * 1_000_000);
            setAuthStateReload(randomNum);
        }
    };

    return (
        <div className="mb-4">
            <div>
                <div className="block text-zinc-300 font-bold mb-2">
                    DApps - Git + Coolify hosting
                    {authState.dappsValid ? (
                        <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Valid
                        </span>
                    ) : (
                        <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Not set
                        </span>
                    )}
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                    Pick git provider Gitea or GitHub. Verify creates a test repo then deletes it. Coolify is the only hosting. Tokens are never shown again after save.
                </p>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">Git provider</h4>
                <label htmlFor="dappsGitProvider" className="block text-zinc-300 font-bold mb-2">
                    Provider
                </label>
                <select
                    id="dappsGitProvider"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    value={gitProvider}
                    onChange={(e) => {
                        setGitProvider(e.target.value);
                    }}
                >
                    <option value="gitea">Gitea - your own GitHub</option>
                    <option value="github">GitHub - github.com</option>
                </select>

                <div className="mt-3">
                    <label htmlFor="dappsGitUrl" className="block text-zinc-300 font-bold mb-2">
                        Git URL
                    </label>
                    <input
                        type="text"
                        id="dappsGitUrl"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="https://git.example.com"
                        value={gitUrl}
                        onChange={(e) => {
                            setGitUrl(e.target.value);
                        }}
                    />
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsGitToken" className="block text-zinc-300 font-bold mb-2">
                        Git token
                    </label>
                    <div className="relative">
                        <input
                            type={showGitToken ? "text" : "password"}
                            id="dappsGitToken"
                            className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 pr-10 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Token with repo create rights"
                            value={gitToken}
                            onChange={(e) => {
                                setGitToken(e.target.value);
                            }}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-200"
                            onClick={() => {
                                setShowGitToken(!showGitToken);
                            }}
                            aria-label={showGitToken ? "Hide token" : "Show token"}
                        >
                            {showGitToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsGitOwner" className="block text-zinc-300 font-bold mb-2">
                        Repo owner - optional
                    </label>
                    <input
                        type="text"
                        id="dappsGitOwner"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Empty means token owner"
                        value={gitOwner}
                        onChange={(e) => {
                            setGitOwner(e.target.value);
                        }}
                    />
                </div>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">Coolify - only hosting</h4>
                <label htmlFor="dappsCoolifyBaseUrl" className="block text-zinc-300 font-bold mb-2">
                    1. Base URL
                </label>
                <input
                    type="text"
                    id="dappsCoolifyBaseUrl"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://coolify.example.com"
                    value={coolifyBaseUrl}
                    onChange={(e) => {
                        setCoolifyBaseUrl(e.target.value);
                    }}
                    autoComplete="off"
                />

                <div className="mt-3">
                    <label htmlFor="dappsCoolifyProjectId" className="block text-zinc-300 font-bold mb-2">
                        2. Dev project ID
                    </label>
                    <input
                        type="text"
                        id="dappsCoolifyProjectId"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Copy from Coolify URL after /project/"
                        value={coolifyProjectId}
                        onChange={(e) => {
                            setCoolifyProjectId(e.target.value);
                        }}
                        autoComplete="off"
                    />
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsCoolifyEnvId" className="block text-zinc-300 font-bold mb-2">
                        3. Dev environment ID
                    </label>
                    <input
                        type="text"
                        id="dappsCoolifyEnvId"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Copy from Coolify URL after /environment/"
                        value={coolifyEnvId}
                        onChange={(e) => {
                            setCoolifyEnvId(e.target.value);
                        }}
                        autoComplete="off"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Open your dev project in Coolify, copy from the address bar. Dev apps are created dynamically inside this project + environment.
                    </p>
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsCoolifyProjectIdProd" className="block text-zinc-300 font-bold mb-2">
                        4. Prod project ID
                    </label>
                    <input
                        type="text"
                        id="dappsCoolifyProjectIdProd"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Create a second project for prod, copy its ID"
                        value={coolifyProjectIdProd}
                        onChange={(e) => {
                            setCoolifyProjectIdProd(e.target.value);
                        }}
                        autoComplete="off"
                    />
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsCoolifyEnvIdProd" className="block text-zinc-300 font-bold mb-2">
                        5. Prod environment ID
                    </label>
                    <input
                        type="text"
                        id="dappsCoolifyEnvIdProd"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Copy from prod project URL after /environment/"
                        value={coolifyEnvIdProd}
                        onChange={(e) => {
                            setCoolifyEnvIdProd(e.target.value);
                        }}
                        autoComplete="off"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Prod apps are created dynamically inside this project + environment. Both projects build the same template repo.
                    </p>
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsDeployKeyUuid" className="block text-zinc-300 font-bold mb-2">
                        6. Deploy key UUID - optional, unused for now
                    </label>
                    <input
                        type="text"
                        id="dappsDeployKeyUuid"
                        className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Paste key UUID from Coolify Keys"
                        value={deployKeyUuid}
                        onChange={(e) => {
                            setDeployKeyUuid(e.target.value);
                        }}
                        autoComplete="off"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Unused for now. The template repo is public, so Coolify clones it with no key. Leave empty.
                    </p>
                </div>

                <div className="mt-3">
                    <label htmlFor="dappsCoolifyToken" className="block text-zinc-300 font-bold mb-2">
                        Coolify token
                    </label>
                    <div className="relative">
                        <input
                            type={showCoolifyToken ? "text" : "password"}
                            id="dappsCoolifyToken"
                            className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 pr-10 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Coolify API token"
                            value={coolifyToken}
                            onChange={(e) => {
                                setCoolifyToken(e.target.value);
                            }}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-200"
                            onClick={() => {
                                setShowCoolifyToken(!showCoolifyToken);
                            }}
                            aria-label={showCoolifyToken ? "Hide token" : "Show token"}
                        >
                            {showCoolifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">Custom domain</h4>
                <label htmlFor="dappsBaseDomain" className="block text-zinc-300 font-bold mb-2">
                    Apps live under this domain
                </label>
                <div className="flex items-stretch">
                    <span className="inline-flex items-center px-3 rounded-l-sm border border-r-0 border-zinc-700 bg-zinc-900 text-zinc-400 font-bold">
                        *.
                    </span>
                    <input
                        type="text"
                        id="dappsBaseDomain"
                        className="shadow appearance-none border border-zinc-700 rounded-r-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="dapps.example.com"
                        value={baseDomain}
                        onChange={(e) => {
                            setBaseDomain(e.target.value);
                        }}
                        autoComplete="off"
                    />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                    Type like dapps.example.com. Point *.yourdomain to your server IP once. Then apps get todo1.yourdomain + dev.todo1.yourdomain.
                </p>
            </div>

            <div className="mt-2">
                {(requestState.loading || clearRequest.loading) && (
                    <p className="text-zinc-400">Loading...</p>
                )}
                {!requestState.loading && !clearRequest.loading && requestState.success !== '' && (
                    <p className="text-green-500">{requestState.success}</p>
                )}
                {!requestState.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">DApps settings cleared successfully!</p>
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
                    onClick={() => handleClearApiKey('dapps')}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={requestState.loading || clearRequest.loading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default DappsApiKey;
