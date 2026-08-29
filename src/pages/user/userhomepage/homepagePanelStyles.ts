export const panel = 'rounded-2xl border-2 border-sky-700/80 bg-zinc-900/90 p-2.5 shadow-md shadow-sky-900/25 backdrop-blur-sm transition hover:shadow-lg hover:shadow-sky-900/40';
export const panelHeader = 'mb-1.5 flex items-center justify-between gap-1.5';
export const panelTitle = 'flex items-center gap-1.5 text-xs font-bold text-sky-100';
export const panelIconBtn = 'rounded-xl border-2 border-sky-700/70 bg-zinc-800/80 p-1 text-sky-300 shadow-sm transition hover:border-sky-600 hover:bg-zinc-800 hover:text-sky-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900';
export const mutedText = 'text-[11px] leading-snug font-medium text-sky-300/75';
export const chipAction = 'inline-flex items-center gap-1 rounded-xl border-2 border-sky-700/70 bg-zinc-900/95 px-2 py-1 text-[11px] font-semibold text-sky-200 shadow-sm transition hover:-translate-y-px hover:border-cyan-500 hover:bg-gradient-to-r hover:from-zinc-800 hover:to-zinc-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900';
export const skeletonBase = 'animate-pulse rounded-lg bg-zinc-800/60';
export const skeletonLine = 'h-3 animate-pulse rounded bg-zinc-800/60';
export const filterChipBtn = (active: boolean) => {
    if (active) {
        return 'rounded-lg border px-1.5 py-0.5 text-[10px] font-semibold transition sm:text-[11px] border-cyan-500 bg-cyan-900/60 text-cyan-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500';
    }
    return 'rounded-lg border px-1.5 py-0.5 text-[10px] font-semibold transition sm:text-[11px] border-sky-700/90 bg-zinc-900/80 text-sky-300 hover:border-cyan-500 hover:bg-cyan-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500';
};
