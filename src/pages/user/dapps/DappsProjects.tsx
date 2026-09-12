import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listProjects, type DappsProject } from "./dappsApi";

const DappsProjects = () => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<DappsProject[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await listProjects(search);
                setItems(data);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(() => {
            void load();
        }, 300);
        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    const active = items.filter((item) => {
        const updated = new Date(item.updatedAt).getTime();
        return Date.now() - updated < 14 * 24 * 60 * 60 * 1000;
    });
    const inactive = items.filter((item) => {
        const updated = new Date(item.updatedAt).getTime();
        return Date.now() - updated >= 14 * 24 * 60 * 60 * 1000;
    });

    const renderCard = (item: DappsProject) => {
        return (
            <Link
                key={item._id}
                to={`/user/dapps/project/${item._id}`}
                className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 hover:border-zinc-500"
            >
                <div className="text-white font-bold truncate">{item.name}</div>
                <div className="text-zinc-500 text-sm truncate mt-1">{item.prodUrl}</div>
                <div className="flex gap-2 mt-3 text-xs">
                    <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">prod: {item.prodStatus}</span>
                    <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">dev: {item.devStatus}</span>
                </div>
            </Link>
        );
    };

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                <Link to="/user/dapps/add" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded">
                    Create
                </Link>
            </div>
            {loading && <p className="text-zinc-500">Loading...</p>}
            <h3 className="text-zinc-300 font-bold mt-4 mb-2">Active in last 14 days</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {active.map((item) => renderCard(item))}
            </div>
            {active.length === 0 && !loading && <p className="text-zinc-600 text-sm">No active apps.</p>}
            <h3 className="text-zinc-300 font-bold mt-6 mb-2">Inactive</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {inactive.map((item) => renderCard(item))}
            </div>
            {inactive.length === 0 && !loading && <p className="text-zinc-600 text-sm">No inactive apps.</p>}
        </div>
    );
};

export default DappsProjects;
