import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, updateProject, deleteProject, type DappsProject } from "./dappsApi";

const DappsProjectSetting = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<DappsProject | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [port, setPort] = useState(3000);
    const [confirmDelete, setConfirmDelete] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!id) {
                return;
            }
            try {
                const data = await getProject(id);
                setItem(data);
                setName(data.name);
                setDescription(data.description);
                setPort(data.port);
            } catch {
                setItem(null);
            }
        };
        void load();
    }, [id]);

    const handleSave = async () => {
        if (!id) {
            return;
        }
        try {
            const data = await updateProject(id, { name, description, port });
            setItem(data);
            setMessage("Saved.");
        } catch {
            setMessage("Save failed.");
        }
    };

    const handleDelete = async () => {
        if (!id || !item) {
            return;
        }
        if (confirmDelete !== item.name) {
            setMessage(`Type "${item.name}" to confirm delete.`);
            return;
        }
        try {
            await deleteProject(id);
            navigate("/user/dapps/projects");
        } catch {
            setMessage("Delete failed.");
        }
    };

    if (!item) {
        return <p className="text-zinc-500">Loading setting...</p>;
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">General</h3>
                <label className="block text-zinc-400 text-sm mb-1">App name</label>
                <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <label className="block text-zinc-400 text-sm mt-3 mb-1">Description</label>
                <textarea
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                    }}
                />
                <label className="block text-zinc-400 text-sm mt-3 mb-1">Port</label>
                <input
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={port}
                    onChange={(e) => {
                        setPort(Number(e.target.value));
                    }}
                />
                <button
                    type="button"
                    onClick={handleSave}
                    className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded"
                >
                    Save
                </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">URLs</h3>
                <div className="text-sm text-zinc-300 space-y-1">
                    <div>Prod: {item.prodUrl}</div>
                    <div>Dev: {item.devUrl}</div>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">Secrets for Coolify env</h3>
                <p className="text-zinc-500 text-sm mb-2">Paste these into each Coolify app env (dev and prod separately), then Restart. Tokens are never shown again after save in global settings, but per-app values live here.</p>
                <label className="block text-zinc-400 text-sm mb-1">Login username (BASIC_AUTH_USER)</label>
                <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={item.basicAuthUsername}
                    readOnly
                />
                <label className="block text-zinc-400 text-sm mt-3 mb-1">Login password (BASIC_AUTH_PASSWORD)</label>
                <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={item.basicAuthPassword}
                    readOnly
                />
                <label className="block text-zinc-400 text-sm mt-3 mb-1">Manage token (MANAGE_TOKEN, dev app)</label>
                <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={item.manageToken}
                    readOnly
                />
            </div>

            <div className="bg-zinc-950 border border-red-900 rounded-lg p-4">
                <h3 className="text-red-400 font-bold mb-3">Danger</h3>
                <p className="text-zinc-500 text-sm mb-2">Type app name to confirm delete.</p>
                <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    value={confirmDelete}
                    onChange={(e) => {
                        setConfirmDelete(e.target.value);
                    }}
                />
                <button
                    type="button"
                    onClick={handleDelete}
                    className="mt-3 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded"
                >
                    Delete app
                </button>
            </div>
            {message !== '' && <p className="text-zinc-400">{message}</p>}
        </div>
    );
};

export default DappsProjectSetting;
