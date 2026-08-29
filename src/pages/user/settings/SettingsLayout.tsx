import { useMemo, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, X } from 'lucide-react';
import { SETTINGS_NAV_GROUPS, getActiveSettingsNavItem } from './settingsNav';
import SettingsMobileNav from './SettingsMobileNav';

const HEADER_OFFSET_PX = 60;

const settingsSearchKey = 'settings-unified-search';

const readSearch = () => {
    try {
        const v = localStorage.getItem(settingsSearchKey);
        if (typeof v === 'string') return v;
        return '';
    } catch {
        return '';
    }
};

const writeSearch = (v: string) => {
    try {
        localStorage.setItem(settingsSearchKey, v);
    } catch {
        return;
    }
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
        isActive
            ? 'bg-zinc-100 text-zinc-900'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
    }`;

export default function SettingsLayout() {
    const location = useLocation();
    const activeItem = getActiveSettingsNavItem(location.pathname);
    const [search, setSearch] = useState(() => { return readSearch(); });
    useEffect(() => {
        writeSearch(search);
    }, [search]);
    const filteredGroups = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return SETTINGS_NAV_GROUPS;
        return SETTINGS_NAV_GROUPS.map((g) => {
            return { ...g, items: g.items.filter((it) => { return it.label.toLowerCase().includes(q) || g.label.toLowerCase().includes(q) || g.id.toLowerCase().includes(q); }) };
        }).filter((g) => { return g.items.length > 0; });
    }, [search]);
    return (
        <div
            className="min-h-screen bg-zinc-950"
            style={{ paddingTop: HEADER_OFFSET_PX }}
        >
            <Helmet><title>{activeItem.label} - Settings</title></Helmet>
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-2 pb-4 sm:px-3 md:flex-row md:gap-3 md:px-4 md:pb-6">
                <SettingsMobileNav search={search} onSearchChange={setSearch} filteredGroups={filteredGroups} />

                {/* Desktop sidebar */}
                <aside className="hidden w-52 shrink-0 md:block lg:w-56">
                    <nav
                        className="sticky space-y-2 rounded-lg border border-zinc-700/90 bg-zinc-900 p-1.5 shadow-sm"
                        style={{ top: HEADER_OFFSET_PX + 12 }}
                        aria-label="Settings sections"
                    >
                        <p className="px-2 pb-0.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Settings
                        </p>
                        <div className="relative mb-1">
                            <Search className="absolute left-2 top-2 h-3 w-3 text-zinc-500" aria-hidden />
                            <input value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search settings..." aria-label="Search settings sections" className="w-full rounded-md border border-zinc-700 bg-zinc-800 pl-6 pr-6 py-1 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none" />
                            {search && (<button type="button" onClick={() => { setSearch(''); }} className="absolute right-1 top-1 rounded p-1 text-zinc-400 hover:text-zinc-200" aria-label="Clear search"><X className="h-3 w-3" /></button>)}
                        </div>
                        {filteredGroups.length === 0 && (<p className="px-2 py-2 text-xs text-zinc-500">No sections match</p>)}
                        {filteredGroups.map((group, groupIndex) => (
                            <div key={group.id} className="space-y-0.5">
                                <p
                                    className={`px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 ${
                                        groupIndex === 0 ? 'pt-0' : 'pt-1.5'
                                    }`}
                                    id={`settings-group-${group.id}`}
                                >
                                    {group.label}
                                </p>
                                <div
                                    role="group"
                                    aria-labelledby={`settings-group-${group.id}`}
                                    className="space-y-0.5"
                                >
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                end={item.path === '/user/setting'}
                                                className={navLinkClass}
                                            >
                                                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                                                <span className="truncate">{item.label}</span>
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1">
                    <div className="bg-zinc-900 p-2 shadow-sm sm:rounded-lg sm:border sm:border-zinc-700/90 sm:p-2.5 md:p-3">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
