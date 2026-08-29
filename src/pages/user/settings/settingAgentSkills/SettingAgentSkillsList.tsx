import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Copy, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    deleteAgentSkill,
    duplicateAgentSkill,
    fetchAgentSkills,
    toggleAgentSkill,
    type AgentSkillDto,
} from './agentSkillsApi';

const SettingAgentSkillsList = () => {
    const [skills, setSkills] = useState<AgentSkillDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const list = await fetchAgentSkills();
            setSkills(list);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load skills');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const onToggle = async (skill: AgentSkillDto) => {
        try {
            setBusyId(skill.id);
            await toggleAgentSkill(skill.id);
            await load();
            toast.success(skill.enabled ? 'Skill disabled' : 'Skill enabled');
        } catch {
            toast.error('Toggle failed');
        } finally {
            setBusyId(null);
        }
    };

    const onDuplicate = async (skill: AgentSkillDto) => {
        try {
            setBusyId(skill.id);
            const copy = await duplicateAgentSkill(skill.id);
            toast.success(`Duplicated as ${copy.name}`);
            await load();
        } catch {
            toast.error('Duplicate failed');
        } finally {
            setBusyId(null);
        }
    };

    const onDelete = async (skill: AgentSkillDto) => {
        if (skill.isBuiltin && !skill.userId) {
            toast.error('Builtin skills cannot be deleted');
            return;
        }
        if (!window.confirm(`Delete skill "${skill.name}"?`)) return;
        try {
            setBusyId(skill.id);
            await deleteAgentSkill(skill.id);
            toast.success('Deleted');
            await load();
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message || '')
                    : '';
            toast.error(msg || 'Delete failed');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 px-3 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-3xl">
            <div className="mb-3 rounded-md border border-teal-800/80 bg-gradient-to-r from-teal-950 to-cyan-950 p-2 sm:p-3">
                <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-sm bg-teal-900/50 p-1">
                        <BookOpen className="h-4 w-4 text-teal-700 sm:h-5 sm:w-5" />
                    </div>
                    <h1 className="text-xl font-bold text-zinc-200 sm:text-2xl">Agent Skills</h1>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
                    Skill packs teach the agent how to handle complex tasks. Skills inject
                    instructions into the planner — they do not add new tools. Builtins cover shell
                    environment, personal research, and image/media workflows.
                </p>
            </div>

            <div className="mb-3 flex justify-end">
                <Link
                    to="/user/chat/skills/new"
                    className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
                >
                    <Plus className="h-4 w-4" />
                    New skill
                </Link>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading skills…</p>
            ) : skills.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
                    No skills yet. Create one or wait for builtins to seed on first load.
                </p>
            ) : (
                <ul className="space-y-2">
                    {skills.map((skill) => (
                        <li
                            key={skill.id}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-sm"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-sm font-semibold text-zinc-100">
                                            {skill.name}
                                        </span>
                                        {skill.isBuiltin && !skill.userId && (
                                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-400">
                                                Builtin
                                            </span>
                                        )}
                                        {skill.isUserOverride && (
                                            <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                                                Override
                                            </span>
                                        )}
                                        {!skill.enabled && (
                                            <span className="rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-400">
                                                Disabled
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                                        {skill.description}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={busyId === skill.id}
                                        onClick={() => void onToggle(skill)}
                                        className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                        title="Toggle enabled"
                                    >
                                        <Power className="h-3.5 w-3.5" />
                                        {skill.enabled ? 'On' : 'Off'}
                                    </button>
                                    <Link
                                        to={`/user/chat/skills/${skill.id}`}
                                        className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        disabled={busyId === skill.id}
                                        onClick={() => void onDuplicate(skill)}
                                        className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        Duplicate
                                    </button>
                                    {!(!skill.userId && skill.isBuiltin) && (
                                        <button
                                            type="button"
                                            disabled={busyId === skill.id}
                                            onClick={() => void onDelete(skill)}
                                            className="inline-flex items-center gap-1 rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </div>
    );
};

export default SettingAgentSkillsList;
