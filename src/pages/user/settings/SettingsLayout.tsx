import { NavLink, Outlet } from 'react-router-dom';
import { SETTINGS_NAV_GROUPS } from './settingsNav';
import SettingsMobileNav from './SettingsMobileNav';

const HEADER_OFFSET_PX = 60;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
        isActive
            ? 'bg-zinc-900 text-white'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
    }`;

export default function SettingsLayout() {
    return (
        <div
            className="min-h-screen bg-zinc-50"
            style={{ paddingTop: HEADER_OFFSET_PX }}
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-2 pb-4 sm:px-3 md:flex-row md:gap-3 md:px-4 md:pb-6">
                <SettingsMobileNav />

                {/* Desktop sidebar */}
                <aside className="hidden w-52 shrink-0 md:block lg:w-56">
                    <nav
                        className="sticky space-y-2 rounded-lg border border-zinc-200/90 bg-white p-1.5 shadow-sm"
                        style={{ top: HEADER_OFFSET_PX + 12 }}
                        aria-label="Settings sections"
                    >
                        <p className="px-2 pb-0.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Settings
                        </p>
                        {SETTINGS_NAV_GROUPS.map((group, groupIndex) => (
                            <div key={group.id} className="space-y-0.5">
                                <p
                                    className={`px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ${
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
                    <div className="bg-white p-2 shadow-sm sm:rounded-lg sm:border sm:border-zinc-200/90 sm:p-2.5 md:p-3">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
