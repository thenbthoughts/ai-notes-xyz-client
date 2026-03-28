import type { LucideIcon } from 'lucide-react';
import {
    User,
    KeyRound,
    Server,
    Cpu,
    History,
    Plug,
    Cloud,
    Lock,
    Bell,
    Brain,
    Sparkles,
} from 'lucide-react';

export interface SettingsNavItem {
    path: string;
    label: string;
    icon: LucideIcon;
}

export interface SettingsNavGroup {
    id: string;
    label: string;
    items: SettingsNavItem[];
}

/** Grouped navigation — order within each group matches product flow. */
export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
    {
        id: 'account',
        label: 'Account',
        items: [
            { path: '/user/setting', label: 'Profile', icon: User },
            { path: '/user/setting/change-password', label: 'Password', icon: Lock },
            { path: '/user/setting/login-history', label: 'Login history', icon: History },
        ],
    },
    {
        id: 'api-cloud',
        label: 'API & storage',
        items: [
            { path: '/user/setting/api-key', label: 'API keys', icon: KeyRound },
            { path: '/user/setting/s3-buckets', label: 'S3 buckets', icon: Cloud },
        ],
    },
    {
        id: 'models',
        label: 'Model providers',
        items: [
            { path: '/user/setting/ollama-models', label: 'Ollama models', icon: Server },
            { path: '/user/setting/localai-models', label: 'LocalAI models', icon: Cpu },
            { path: '/user/setting/openai-compatible-model', label: 'OpenAI compatible', icon: Plug },
        ],
    },
    {
        id: 'ai-app',
        label: 'AI & app',
        items: [
            { path: '/user/setting/ai-features', label: 'AI features', icon: Sparkles },
            { path: '/user/setting/memory', label: 'Memory', icon: Brain },
            { path: '/user/setting/notification', label: 'Notifications', icon: Bell },
        ],
    },
];

/** Flat list for route resolution and any code that iterates all items. */
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = SETTINGS_NAV_GROUPS.flatMap((g) => g.items);

/** Resolves which nav item matches the current URL (for labels / mobile header). */
export function getActiveSettingsNavItem(pathname: string): SettingsNavItem {
    const p = pathname.replace(/\/$/, '') || '/';
    const exact = SETTINGS_NAV_ITEMS.find((item) => item.path === p);
    if (exact) return exact;
    const prefix = SETTINGS_NAV_ITEMS.filter(
        (item) => item.path !== '/user/setting' && p.startsWith(`${item.path}/`),
    ).sort((a, b) => b.path.length - a.path.length)[0];
    return prefix ?? SETTINGS_NAV_ITEMS[0];
}

/** Group that contains the active item (for subgroup labels in the UI). */
export function getActiveSettingsNavGroup(pathname: string): SettingsNavGroup {
    const item = getActiveSettingsNavItem(pathname);
    const group = SETTINGS_NAV_GROUPS.find((g) => g.items.some((i) => i.path === item.path));
    return group ?? SETTINGS_NAV_GROUPS[0];
}
