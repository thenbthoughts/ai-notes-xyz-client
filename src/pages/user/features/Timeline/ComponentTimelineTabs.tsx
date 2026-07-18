import { Link, useLocation } from 'react-router-dom';

const tabs = [
    { to: '/user/timeline', label: 'Timeline', matchExact: true },
    { to: '/user/timeline/files', label: 'Images', matchExact: false },
] as const;

const ComponentTimelineTabs = () => {
    const location = useLocation();

    return (
        <div className="mb-3 flex items-center gap-1 border-b border-zinc-200">
            {tabs.map((tab) => {
                const isActive = tab.matchExact
                    ? location.pathname === tab.to
                    : location.pathname.startsWith(tab.to);

                return (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        className={`-mb-px border-b-2 px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isActive
                                ? 'border-zinc-900 text-zinc-900'
                                : 'border-transparent text-zinc-600 hover:text-zinc-900'
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
};

export default ComponentTimelineTabs;
