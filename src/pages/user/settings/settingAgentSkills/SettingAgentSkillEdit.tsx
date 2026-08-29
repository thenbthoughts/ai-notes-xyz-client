import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    createAgentSkill,
    fetchAgentSkill,
    updateAgentSkill,
} from './agentSkillsApi';

const SettingAgentSkillEdit = () => {
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [body, setBody] = useState('');
    const [enabled, setEnabled] = useState(true);
    const [isBuiltin, setIsBuiltin] = useState(false);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isNew || !id) return;
        let cancelled = false;
        (async () => {
            try {
                const skill = await fetchAgentSkill(id);
                if (cancelled) return;
                setName(skill.name);
                setDescription(skill.description);
                setBody(skill.body);
                setEnabled(skill.enabled);
                setIsBuiltin(Boolean(skill.isBuiltin && !skill.userId));
            } catch {
                toast.error('Failed to load skill');
                navigate('/user/chat/skills');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, isNew, navigate]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !body.trim()) {
            toast.error('Name, description, and body are required');
            return;
        }
        try {
            setSaving(true);
            if (isNew) {
                const created = await createAgentSkill({
                    name: name.trim(),
                    description: description.trim(),
                    body,
                    enabled,
                });
                toast.success('Skill created');
                navigate(`/user/chat/skills/${created.id}`);
            } else if (id) {
                const updated = await updateAgentSkill(id, {
                    name: name.trim(),
                    description: description.trim(),
                    body,
                    enabled,
                });
                toast.success(
                    isBuiltin || updated.isUserOverride
                        ? 'Saved (builtin edits create/update your override)'
                        : 'Skill saved'
                );
                if (updated.id !== id) {
                    navigate(`/user/chat/skills/${updated.id}`, { replace: true });
                }
                setIsBuiltin(Boolean(updated.isBuiltin && !updated.userId));
                setName(updated.name);
            }
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message || '')
                    : '';
            toast.error(msg || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 px-3 py-16 sm:px-6 sm:py-20">
                <p className="mx-auto max-w-3xl text-sm text-zinc-500">Loading…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-3 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-3xl">
            <div className="mb-3 flex items-center gap-2">
                <Link
                    to="/user/chat/skills"
                    className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Skills
                </Link>
            </div>

            <h1 className="mb-1 text-xl font-bold text-zinc-100">
                {isNew ? 'Create agent skill' : 'Edit agent skill'}
            </h1>
            <p className="mb-4 text-sm text-zinc-400">
                Use a short slug name, a description that says WHAT and WHEN (third person), and a
                markdown body with step-by-step instructions.
            </p>

            {isBuiltin && (
                <p className="mb-3 rounded-md border border-amber-800 bg-amber-950 px-3 py-2 text-xs text-amber-200">
                    This is a builtin skill. Saving creates or updates your personal override with the
                    same name.
                </p>
            )}

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Name (slug)
                    </span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-200"
                        placeholder="my-workflow"
                        maxLength={64}
                    />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Description
                    </span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                        rows={3}
                        maxLength={1024}
                        placeholder="Does X when the user asks about Y…"
                    />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Body (markdown)
                    </span>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-200"
                        rows={16}
                        maxLength={50000}
                        placeholder={'# Skill\n\n## Instructions\n...'}
                    />
                </label>

                <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />
                    Enabled
                </label>

                <div className="flex gap-2 pt-1">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link
                        to="/user/chat/skills"
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
        </div>
    );
};

export default SettingAgentSkillEdit;
