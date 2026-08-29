import { useMemo } from 'react';
import { IInfoVault } from '../../../../../types/pages/tsInfoVault.ts';

const ComponentInfoVaultGraphMini = ({ docs }: { docs: IInfoVault[] }) => {
    const nodes = useMemo(() => {
        return docs.slice(0, 30).map((d, idx) => {
            const angle = (idx / Math.max(1, Math.min(docs.length, 30))) * Math.PI * 2;
            const radius = 70;
            const x = 100 + Math.cos(angle) * radius;
            const y = 100 + Math.sin(angle) * radius;
            let color = '#52525b';
            if (d.relationshipType === 'family') { color = '#a78bfa'; }
            if (d.relationshipType === 'professional') { color = '#38bdf8'; }
            if (d.relationshipType === 'personal') { color = '#34d399'; }
            if ((d.relationshipType as string) === 'myself') { color = '#fbbf24'; }
            return { id: d._id, name: d.name, x, y, color, favorite: d.isFavorite };
        });
    }, [docs]);

    const edges = useMemo(() => {
        const out: Array<{ a: number; b: number }> = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const di = docs[i];
                const dj = docs[j];
                let connect = false;
                if (di.company && di.company === dj.company) { connect = true; }
                if (di.relationshipType && di.relationshipType === dj.relationshipType) {
                    if (Math.random() < 0.15) { connect = true; }
                }
                if (di.tags.length > 0 && dj.tags.length > 0) {
                    const shared = di.tags.some((t) => dj.tags.includes(t));
                    if (shared) { connect = true; }
                }
                if (connect) {
                    out.push({ a: i, b: j });
                    if (out.length > 40) { break; }
                }
            }
            if (out.length > 40) { break; }
        }
        return out;
    }, [docs, nodes]);

    if (docs.length === 0) {
        return <div className="rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-6 text-center text-xs text-zinc-400">No data to graph</div>;
    }

    return (
        <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-2">
            <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">Relationship graph</span>
                <span className="text-[10px] text-zinc-500">{nodes.length} nodes · {edges.length} links</span>
            </div>
            <svg viewBox="0 0 200 200" className="h-52 w-full rounded-sm border border-zinc-800 bg-zinc-950" aria-label="Relationship graph mini view">
                {edges.map((e, idx) => {
                    const a = nodes[e.a];
                    const b = nodes[e.b];
                    return <line key={idx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#3f3f46" strokeWidth={0.8} opacity={0.7} />;
                })}
                {nodes.map((n) => (
                    <g key={n.id}>
                        <circle cx={n.x} cy={n.y} r={n.favorite ? 8 : 6} fill={n.color} stroke="#18181b" strokeWidth={1.5} />
                        <text x={n.x} y={n.y + 16} textAnchor="middle" fontSize={5} fill="#d4d4d8">{n.name.slice(0, 10)}</text>
                    </g>
                ))}
                <circle cx={100} cy={100} r={3} fill="#e4e4e7" stroke="#18181b" strokeWidth={1} />
            </svg>
            <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-zinc-400">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />personal</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" />professional</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400" />family</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />myself</span>
            </div>
        </div>
    );
};

export default ComponentInfoVaultGraphMini;
