import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProject, promoteProject, buildProject, type DappsProject } from "./dappsApi";

const DappsProjectDetail = () => {
    const { id } = useParams();
    const [item, setItem] = useState<DappsProject | null>(null);
    const [tab, setTab] = useState("preview");
    const [env, setEnv] = useState("dev");
    const [chat, setChat] = useState("");
    const [loading, setLoading] = useState(false);
    const [buildMessage, setBuildMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!id) {
                return;
            }
            try {
                const data = await getProject(id);
                setItem(data);
            } catch {
                setItem(null);
            }
        };
        void load();
    }, [id]);

    const handlePromote = async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        try {
            const data = await promoteProject(id);
            setItem(data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    if (!item) {
        return <p className="text-zinc-500">Loading project...</p>;
    }

    const previewUrl = env === 'dev' ? item.devUrl : item.prodUrl;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <h2 className="text-white font-bold text-lg">{item.name}</h2>
                <p className="text-zinc-500 text-sm mt-1">Dev builds first. Check dev, then promote to prod.</p>
                <div className="mt-4 space-y-2 text-sm text-zinc-300">
                    <div>Prod: {item.prodUrl} - {item.prodStatus}</div>
                    <div>Dev: {item.devUrl} - {item.devStatus}</div>
                    <div>Repo: {item.gitRepo}</div>
                </div>
                <div className="mt-4">
                    <textarea
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 min-h-[90px]"
                        placeholder="Describe the change, then press Build dev..."
                        value={chat}
                        onChange={(e) => {
                            setChat(e.target.value);
                        }}
                    />
                    <p className="text-zinc-600 text-xs mt-2">Build dev writes code in shell/dapps/{item._id}/code, pushes dev branch to git. Coolify deploys dev from there.</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        type="button"
                        onClick={async () => {
                            if (!id) {
                                return;
                            }
                            setLoading(true);
                            setBuildMessage("");
                            try {
                                const data = await buildProject(id, chat || item.description || item.name);
                                setItem(data);
                                setBuildMessage("Dev build pushed. Open dev URL in 2-3 mins. If Coolify shows no server, connect the repo there once.");
                            } catch (err: any) {
                                const msg = typeof err?.response?.data?.message === 'string' ? err.response.data.message : 'Dev build failed.';
                                setBuildMessage(msg);
                                try {
                                    const fresh = await getProject(id);
                                    setItem(fresh);
                                } catch {
                                    // ignore
                                }
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded"
                    >
                        {loading ? "Building dev..." : "Resend - build dev"}
                    </button>
                    <button
                        type="button"
                        onClick={handlePromote}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded"
                    >
                        {loading ? "Promoting..." : "Publish - promote dev to prod"}
                    </button>
                    <Link to={`/user/dapps/project/${item._id}/setting`} className="px-4 py-2 rounded border border-zinc-700 text-zinc-300">
                        Setting
                    </Link>
                </div>
                {buildMessage !== '' && <p className="text-zinc-300 text-sm mt-3">{buildMessage}</p>}
                {item.devLog ? (
                    <pre className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded p-3 mt-3 max-h-48 overflow-auto whitespace-pre-wrap">{item.devLog}</pre>
                ) : null}
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <div className="flex gap-2 mb-3">
                    <button
                        type="button"
                        onClick={() => {
                            setTab("preview");
                        }}
                        className={`px-3 py-1 rounded ${tab === "preview" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
                    >
                        Preview
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTab("code");
                        }}
                        className={`px-3 py-1 rounded ${tab === "code" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
                    >
                        Code
                    </button>
                    <select
                        className="ml-auto bg-zinc-800 text-zinc-200 rounded px-2 py-1"
                        value={env}
                        onChange={(e) => {
                            setEnv(e.target.value);
                        }}
                    >
                        <option value="dev">Dev</option>
                        <option value="prod">Prod</option>
                    </select>
                </div>
                {tab === "preview" && (
                    <iframe title="preview" src={previewUrl} className="w-full h-[480px] bg-white rounded" />
                )}
                {tab === "code" && (
                    <p className="text-zinc-500 text-sm">Code lives in workspace shell/dapps/{item._id}/code/ and Git repo {item.gitRepo}.</p>
                )}
            </div>
        </div>
    );
};

export default DappsProjectDetail;
