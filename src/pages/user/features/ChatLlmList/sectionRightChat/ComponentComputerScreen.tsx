import { useState, useEffect } from 'react';
import { Monitor, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';

const ComponentComputerScreen = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [desktopUrl, setDesktopUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDesktopUrl = async () => {
            try {
                const res = await axiosCustom.get('/api/user/api-keys/getUserApiAgentWorkspace');
                if (res.data?.desktopUrl) {
                    setDesktopUrl(res.data.desktopUrl);
                } else if (res.data?.agentWorkspaceValid) {
                    // Valid but no URL? fallback to default
                    setDesktopUrl('http://localhost:3010');
                } else {
                    setDesktopUrl('');
                }
            } catch {
                setDesktopUrl('');
            } finally {
                setLoading(false);
            }
        };
        fetchDesktopUrl();
    }, []);

    if (loading) return null;

    return (
        <div className="mb-3 rounded-xl border border-zinc-700/60 bg-zinc-900/40 backdrop-blur-sm">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-teal-400" />
                    Computer Screen
                    <span className="text-xs text-zinc-500">(read-only)</span>
                </span>
                <span className="flex items-center gap-1">
                    {desktopUrl && (
                        <a
                            href={desktopUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-zinc-700 rounded"
                            title="Open in new tab"
                        >
                            <ExternalLink className="h-3 w-3 text-zinc-400" />
                        </a>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            </button>
            {isExpanded && (
                <div className="border-t border-zinc-700/60">
                    {desktopUrl ? (
                        <iframe
                            src={desktopUrl}
                            title="Agent Workspace Desktop"
                            className="w-full h-[480px] bg-white"
                            sandbox="allow-same-origin allow-scripts allow-forms"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="p-4 text-sm text-zinc-500 text-center">
                            Desktop not configured. Set in Settings → API Keys → Agent Workspace.
                        </div>
                    )}
                    <div className="px-3 py-1 text-xs text-zinc-500 bg-zinc-900/50 border-t border-zinc-700/30">
                        Read-only view — reflects live desktop at {desktopUrl || 'not set'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentComputerScreen;
