import { Link, useLocation } from 'react-router-dom';

const tabs = [
    { to: '/user/drive', label: 'Browse', end: true },
    { to: '/user/drive/library', label: 'Library', end: false },
] as const;

const DriveNavTabs = () => {
    const { pathname } = useLocation();

    const isActive = (to: string, end: boolean) => {
        if (end) {
            return pathname === to || pathname === `${to}/`;
        }
        return pathname.startsWith(to);
    };

    return (
        <nav
            className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
            aria-label="Drive sections"
        >
            {tabs.map((tab) => {
                const active = isActive(tab.to, tab.end);
                return (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            active
                                ? 'bg-white text-sky-800 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
};

export default DriveNavTabs;
