import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LucideChevronDown, LucideLayers } from 'lucide-react';
import {
    SETTINGS_NAV_GROUPS,
    getActiveSettingsNavGroup,
    getActiveSettingsNavItem,
    type SettingsNavItem,
} from './settingsNav';

const HEADER_OFFSET_PX = 60;

function MobileNavRow({
    item,
    onPick,
}: {
    item: SettingsNavItem;
    onPick: () => void;
}) {
    const Icon = item.icon;
    return (
        <li>
            <NavLink
                to={item.path}
                end={item.path === '/user/setting'}
                onClick={onPick}
                className={({ isActive }) =>
                    `flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors active:bg-zinc-200/80 ${
                        isActive
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'bg-zinc-100/90 text-zinc-800 hover:bg-zinc-200/90'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                isActive ? 'bg-white/15 text-white' : 'bg-white text-zinc-600 shadow-sm'
                            }`}
                        >
                            <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="flex-1 truncate">{item.label}</span>
                    </>
                )}
            </NavLink>
        </li>
    );
}

export default function SettingsMobileNav() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const active = getActiveSettingsNavItem(location.pathname);
    const activeGroup = getActiveSettingsNavGroup(location.pathname);
    const ActiveIcon = active.icon;

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <div
            className="sticky z-40 mb-1 md:hidden"
            style={{ top: HEADER_OFFSET_PX }}
        >
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-between gap-2 rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-3 py-2.5 text-left text-white shadow-md shadow-zinc-900/20"
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls={open ? titleId : undefined}
            >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <ActiveIcon className="h-4 w-4 text-white" aria-hidden />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                            Settings · {activeGroup.label}
                        </span>
                        <span className="block truncate text-sm font-semibold leading-tight">
                            {active.label}
                        </span>
                    </span>
                </span>
                <LucideChevronDown
                    className={`h-5 w-5 shrink-0 text-zinc-300 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                />
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-[60] bg-zinc-950/55 backdrop-blur-[2px]"
                        aria-label="Close settings menu"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[min(88vh,560px)] flex-col rounded-t-2xl border border-zinc-200/80 bg-white shadow-2xl"
                    >
                        <div className="flex shrink-0 flex-col items-center border-b border-zinc-100 px-3 pb-2 pt-3">
                            <div className="mb-2 h-1 w-10 rounded-full bg-zinc-200" aria-hidden />
                            <div className="flex w-full items-center gap-2 px-1">
                                <LucideLayers className="h-4 w-4 text-zinc-400" aria-hidden />
                                <h2 id={titleId} className="text-sm font-semibold text-zinc-900">
                                    All sections
                                </h2>
                            </div>
                        </div>
                        <nav
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
                            aria-label="Settings sections"
                        >
                            <div className="flex flex-col gap-4">
                                {SETTINGS_NAV_GROUPS.map((group) => (
                                    <section key={group.id} aria-labelledby={`mobile-settings-group-${group.id}`}>
                                        <h3
                                            id={`mobile-settings-group-${group.id}`}
                                            className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
                                        >
                                            {group.label}
                                        </h3>
                                        <ul className="flex flex-col gap-1.5">
                                            {group.items.map((item) => (
                                                <MobileNavRow
                                                    key={item.path}
                                                    item={item}
                                                    onPick={() => setOpen(false)}
                                                />
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </div>
    );
}
