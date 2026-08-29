import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import envKeys from "../../../../config/envKeys";
import { useApiKeyClear } from "./utils/useApiKeyClear";

const TOOLS = [
    'search — notes, tasks, life events, memos, info vault',
    'add_chat_file — attach a file to the current AI chat message',
];

const MCP_PATH = '/api/mcp';

const toMcpUrl = (raw: string): string => {
    const trimmed = String(raw || '').trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    try {
        const withProto = trimmed.includes('://') ? trimmed : `http://${trimmed}`;
        const u = new URL(withProto);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
        const path = (u.pathname || '/').replace(/\/+$/, '');
        if (!path || path === '/' || path === '/api' || !path.endsWith('/api/mcp')) {
            u.pathname = MCP_PATH;
        }
        u.search = '';
        u.hash = '';
        return `${u.origin}${u.pathname.replace(/\/+$/, '') || MCP_PATH}`;
    } catch {
        return '';
    }
};

const isValidMcpInfo = (data: unknown): boolean => {
    if (!data || typeof data !== 'object') return false;
    const body = data as { success?: unknown; name?: unknown; mcp?: unknown };
    return body.success === true && (body.mcp === true || body.name === 'ai-notes-xyz');
};

const probeMcpInfo = async (mcpUrl: string): Promise<boolean> => {
    const infoUrl = `${mcpUrl.replace(/\/+$/, '')}/info`;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    try {
        const res = await fetch(infoUrl, {
            method: 'GET',
            credentials: 'omit',
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return false;
        return isValidMcpInfo(await res.json());
    } catch {
        return false;
    } finally {
        window.clearTimeout(timer);
    }
};

const McpApiKey = () => {
    const [mcpBearerToken, setMcpBearerToken] = useState('');
    const [mcpBaseUrl, setMcpBaseUrl] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [savingUrl, setSavingUrl] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);
    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    const applyPayload = (data: {
        mcpBearerToken?: string;
        mcpBaseUrl?: string;
    }) => {
        if (typeof data.mcpBearerToken === 'string') setMcpBearerToken(data.mcpBearerToken);
        if (typeof data.mcpBaseUrl === 'string') setMcpBaseUrl(data.mcpBaseUrl);
    };

    const loadToken = async () => {
        setLoading(true);
        try {
            const res = await axiosCustom.get('/api/user/api-keys/getMcpBearerToken');
            applyPayload(res.data || {});
        } catch (error) {
            console.error(error);
            toast.error('Could not load MCP token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadToken();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await axiosCustom.post('/api/user/api-keys/generateMcpBearerToken', {});
            applyPayload(res.data || {});
            toast.success('MCP token generated');
            setAuthStateReload(Math.floor(Math.random() * 1_000_000));
        } catch (error) {
            console.error(error);
            toast.error('Could not generate MCP token');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveUrl = async () => {
        setSavingUrl(true);
        try {
            const res = await axiosCustom.post('/api/user/api-keys/updateMcpBaseUrl', {
                mcpBaseUrl,
            });
            applyPayload(res.data || {});
            toast.success('MCP URL saved');
        } catch (error) {
            console.error(error);
            toast.error('Could not save MCP URL');
        } finally {
            setSavingUrl(false);
        }
    };

    const handleFetchUrl = async () => {
        setFetchingUrl(true);
        try {
            const fromApiEnv = toMcpUrl(envKeys.API_URL);
            const fromFrontend = toMcpUrl(window.location.origin);
            const candidates = fromApiEnv
                ? [fromApiEnv, ...(fromFrontend && fromFrontend !== fromApiEnv ? [fromFrontend] : [])]
                : fromFrontend
                  ? [fromFrontend]
                  : [];
            let validUrl = '';
            for (const candidate of candidates) {
                if (await probeMcpInfo(candidate)) {
                    validUrl = candidate;
                    break;
                }
            }
            if (!validUrl) {
                toast.error('Could not find a valid MCP URL at /api/mcp/info');
                return;
            }
            const res = await axiosCustom.post('/api/user/api-keys/updateMcpBaseUrl', {
                mcpBaseUrl: validUrl,
            });
            applyPayload(res.data || {});
            toast.success('MCP URL fetched');
        } catch (error) {
            console.error(error);
            toast.error('Could not fetch MCP URL');
        } finally {
            setFetchingUrl(false);
        }
    };

    const handleCopy = async () => {
        if (!mcpBearerToken) return;
        try {
            await navigator.clipboard.writeText(mcpBearerToken);
            toast.success('Token copied');
        } catch {
            toast.error('Could not copy token');
        }
    };

    const urlBusy = savingUrl || fetchingUrl;

    return (
        <div className="mb-4">
            <div className="block text-zinc-300 font-bold mb-2">
                MCP
                {authState.mcpBearerTokenValid || mcpBearerToken ? (
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
                    OpenCode calls this Streamable HTTP MCP server to search notes/tasks and attach files to the AI chat message.
                </span>
                <span className="block">
                    Auth header:{' '}
                    <code className="bg-zinc-800 px-1 rounded">Authorization: Bearer</code>
                    . The token is generated per user and stored as{' '}
                    <code className="bg-zinc-800 px-1 rounded">mcpBearerToken</code>.
                </span>
                <span className="block">
                    Agent (Opencode) registers this server in{' '}
                    <code className="bg-zinc-800 px-1 rounded">opencode.json</code>
                    . localhost is rewritten to{' '}
                    <code className="bg-zinc-800 px-1 rounded">host.docker.internal</code>
                    {' '}inside Docker.
                </span>
            </p>

            <label className="block text-zinc-400 text-sm mb-1">MCP URL</label>
            <input
                className="w-full mb-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200"
                value={mcpBaseUrl}
                onChange={(e) => setMcpBaseUrl(e.target.value)}
                placeholder="http://localhost:2000/api/mcp"
                spellCheck={false}
            />
            <div className="mb-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => void handleFetchUrl()}
                    disabled={urlBusy}
                    className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                >
                    {fetchingUrl ? 'Fetching…' : 'Fetch URL automatically'}
                </button>
                <button
                    type="button"
                    onClick={() => void handleSaveUrl()}
                    disabled={urlBusy}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    {savingUrl ? 'Saving…' : 'Save URL'}
                </button>
            </div>

            <label className="block text-zinc-400 text-sm mb-1">Token</label>
            <div className="mb-3 flex gap-2">
                <input
                    className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200"
                    type={showToken ? 'text' : 'password'}
                    value={loading ? 'Loading…' : mcpBearerToken}
                    readOnly
                />
                <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="rounded-md border border-zinc-700 px-2 text-zinc-300 hover:bg-zinc-800"
                    title={showToken ? 'Hide' : 'Show'}
                >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="rounded-md border border-zinc-700 px-2 text-zinc-300 hover:bg-zinc-800"
                    title="Copy"
                >
                    <Copy className="h-4 w-4" />
                </button>
            </div>

            <div className="mb-4 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-400">
                <div className="mb-1 font-semibold text-zinc-300">Tools</div>
                <ul className="list-disc space-y-0.5 pl-4 font-mono">
                    {TOOLS.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => void handleGenerate()}
                    disabled={generating}
                    className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                    {mcpBearerToken ? 'Regenerate token' : 'Generate token'}
                </button>
                <button
                    type="button"
                    onClick={async () => {
                        const ok = await handleClearApiKey('mcp');
                        if (ok) setMcpBearerToken('');
                    }}
                    disabled={clearRequest.loading}
                    className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/70 disabled:opacity-50"
                >
                    Clear
                </button>
            </div>
            {clearRequest.error ? (
                <p className="mt-2 text-sm text-red-400">{clearRequest.error}</p>
            ) : null}
            {clearRequest.success ? (
                <p className="mt-2 text-sm text-green-400">{clearRequest.success}</p>
            ) : null}
        </div>
    );
};

export default McpApiKey;
