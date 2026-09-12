import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import stateJotaiAuthAtom from "../../../jotai/stateJotaiAuth";
import { createProject } from "./dappsApi";

const DappsAdd = () => {
    const navigate = useNavigate();
    const authState = useAtomValue(stateJotaiAuthAtom);
    const [prompt, setPrompt] = useState("");
    const [stackHint, setStackHint] = useState("auto");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleBuild = async () => {
        setError("");
        if (!prompt.trim()) {
            setError("Type what to build first.");
            return;
        }
        setLoading(true);
        try {
            const name = prompt.trim().slice(0, 60);
            const item = await createProject({
                name,
                description: prompt.trim().slice(0, 2000),
                stackHint,
                port: 3000,
            });
            navigate(`/user/dapps/project/${item._id}`);
        } catch (err) {
            setError("Create failed. Check DApps settings, then retry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            {!authState.dappsValid && (
                <button
                    type="button"
                    onClick={() => {
                        navigate("/user/setting/api-key");
                    }}
                    className="mb-4 text-sm px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:text-white"
                >
                    Connect Git + Coolify first - open DApps settings
                </button>
            )}
            <h1 className="text-3xl font-bold text-white mb-6">Ready to build?</h1>
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
                <textarea
                    className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 outline-none min-h-[90px]"
                    placeholder="Ask to create a presentation about..."
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                    }}
                />
                <div className="flex items-center gap-2 mt-3">
                    <select
                        className="bg-zinc-800 text-zinc-200 rounded px-3 py-2"
                        value={stackHint}
                        onChange={(e) => {
                            setStackHint(e.target.value);
                        }}
                    >
                        <option value="auto">Build: Auto</option>
                        <option value="static">Build: Static</option>
                        <option value="node">Build: Node</option>
                        <option value="python">Build: Python</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleBuild}
                        disabled={loading}
                        className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded"
                    >
                        {loading ? "Building..." : "Build"}
                    </button>
                </div>
            </div>
            {error !== '' && <p className="text-red-400 mt-4">{error}</p>}
            <p className="text-zinc-500 text-sm mt-4">Dev builds first at dev.{`{app}`}.dapps.example.com, then promote to prod.</p>
        </div>
    );
};

export default DappsAdd;
