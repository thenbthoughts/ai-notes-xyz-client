import { Link, Outlet, useLocation } from "react-router-dom";

const DappsLayout = () => {
    const location = useLocation();
    const isActive = (path: string): string => {
        if (location.pathname === path) {
            return "bg-zinc-800 text-white";
        }
        return "text-zinc-400 hover:text-white";
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                <Link to="/user/dapps/projects" className={`px-3 py-2 rounded ${isActive("/user/dapps/projects")}`}>
                    All projects
                </Link>
                <Link to="/user/dapps/add" className={`px-3 py-2 rounded ${isActive("/user/dapps/add")}`}>
                    New app
                </Link>
                <Link to="/user/setting/api-key" className="px-3 py-2 rounded text-zinc-400 hover:text-white ml-auto">
                    DApps settings
                </Link>
            </div>
            <Outlet />
        </div>
    );
};

export default DappsLayout;
