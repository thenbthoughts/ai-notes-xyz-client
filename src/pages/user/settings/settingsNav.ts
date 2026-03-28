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

/** Single source of truth for settings navigation (sidebar + mobile picker). */
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
    { path: '/user/setting', label: 'Profile', icon: User },
    { path: '/user/setting/api-key', label: 'API keys', icon: KeyRound },
    { path: '/user/setting/ollama-models', label: 'Ollama models', icon: Server },
    { path: '/user/setting/localai-models', label: 'LocalAI models', icon: Cpu },
    { path: '/user/setting/openai-compatible-model', label: 'OpenAI compatible', icon: Plug },
    { path: '/user/setting/s3-buckets', label: 'S3 buckets', icon: Cloud },
    { path: '/user/setting/ai-features', label: 'AI features', icon: Sparkles },
    { path: '/user/setting/memory', label: 'Memory', icon: Brain },
    { path: '/user/setting/notification', label: 'Notifications', icon: Bell },
    { path: '/user/setting/login-history', label: 'Login history', icon: History },
    { path: '/user/setting/change-password', label: 'Password', icon: Lock },
];
