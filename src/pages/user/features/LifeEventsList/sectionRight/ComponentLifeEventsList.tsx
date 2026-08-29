import { useState, useEffect, useCallback, useMemo } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useAtomValue, useAtom } from 'jotai';
import { DateTime } from 'luxon';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents.ts';
import ComponentLifeEventItem from './ComponentLifeEventItem.tsx';
import { jotaiStateLifeEventSearch, jotaiStateLifeEventCategory, jotaiStateLifeEventCategorySub, jotaiStateLifeEventIsStar, jotaiStateLifeEventImpact, jotaiStateLifeEventDateRange, jotaiStateLifeEventAiCategory, jotaiStateLifeEventAiCategorySub, jotaiStateLifeEventHideDailyDiary } from '../stateJotai/lifeEventStateJotai.ts';
import ReactPaginate from 'react-paginate';
import { LucideLayoutGrid, LucideList, LucidePlus, LucideDownload, LucideCalendar, LucideClock, LucideMapPin } from 'lucide-react';
import { lifeEventAddAxios } from '../utils/lifeEventsListAxios.ts';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const VIEW_STORAGE_KEY = 'lifeEventsViewMode';
const GROUP_STORAGE_KEY = 'lifeEventsGroupByYear';
const SORT_STORAGE_KEY = 'lifeEventsSort';
const PAGE_SIZE_KEY = 'lifeEventsPageSize';

function readLS(key: string, fallback: string): string {
    try { const v = localStorage.getItem(key); if (v) return v; } catch { /* ignore */ }
    return fallback;
}

type ViewMode = 'grid' | 'list' | 'timeline' | 'calendar' | 'map';

const ComponentLifeEventsList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0);
    const [list, setList] = useState<tsLifeEventsItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = readLS(VIEW_STORAGE_KEY, 'grid');
        if (v === 'list' || v === 'timeline' || v === 'calendar' || v === 'map') return v as ViewMode;
        return 'grid';
    });
    const [groupByYear, setGroupByYear] = useState(() => readLS(GROUP_STORAGE_KEY, 'false') === 'true');
    const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>(() => {
        const v = readLS(SORT_STORAGE_KEY, 'newest'); if (v === 'oldest' || v === 'title') return v; return 'newest';
    });
    const [perPage, setPerPage] = useState(() => {
        const v = parseInt(readLS(PAGE_SIZE_KEY, '10'), 10); if ([10, 20, 50].includes(v)) return v; return 10;
    });
    const [streak, setStreak] = useState<{ total: number; thisMonth: number; currentStreak: number; longestStreak: number; distinctDays: number } | null>(null);

    const persist = useCallback((key: string, val: string) => {
        try { localStorage.setItem(key, val); } catch { /* ignore */ }
    }, []);

    const searchTerm = useAtomValue(jotaiStateLifeEventSearch);
    const categoryId = useAtomValue(jotaiStateLifeEventCategory);
    const categorySubId = useAtomValue(jotaiStateLifeEventCategorySub);
    const [aiCategory, setAiCategory] = useAtom(jotaiStateLifeEventAiCategory);
    const [aiSubCategory, setAiSubCategory] = useAtom(jotaiStateLifeEventAiCategorySub);
    const isStar = useAtomValue(jotaiStateLifeEventIsStar);
    const [eventImpact, setEventImpact] = useAtom(jotaiStateLifeEventImpact);
    const [dateRange, setDateRange] = useAtom(jotaiStateLifeEventDateRange);
    const hideDailyDiary = useAtomValue(jotaiStateLifeEventHideDailyDiary);
    const hasActiveFilters = !!(searchTerm || categoryId || categorySubId || isStar || eventImpact || dateRange.startDate || dateRange.endDate || aiCategory || hideDailyDiary !== true);

    const clearFilters = useCallback(() => {
        try {
            setEventImpact('' as never);
            setDateRange({ startDate: null, endDate: null });
            setAiCategory('');
            setAiSubCategory('');
        } catch { /* ignore */ }
    }, [setEventImpact, setDateRange, setAiCategory, setAiSubCategory]);

    const setPreset = useCallback((preset: string) => {
        const now = DateTime.now();
        let s: Date | null = null; let e: Date | null = null;
        if (preset === '7d') { s = now.minus({ days: 7 }).toJSDate(); e = now.toJSDate(); }
        else if (preset === '30d') { s = now.minus({ days: 30 }).toJSDate(); e = now.toJSDate(); }
        else if (preset === 'thisYear') { s = now.startOf('year').toJSDate(); e = now.endOf('year').toJSDate(); }
        else if (preset === 'clear') { s = null; e = null; }
        setDateRange({ startDate: s, endDate: e });
    }, [setDateRange]);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'n' || e.ctrlKey || e.metaKey || e.altKey) return;
            const ae = document.activeElement as HTMLElement | null;
            if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
            e.preventDefault();
            void lifeEventAddAxiosLocal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const c: CancelTokenSource = axios.CancelToken.source();
        void fetchList(c);
        return () => c.cancel('cancel');
    }, [refreshRandomNum, page, perPage]);

    useEffect(() => { setPage(1); setRefreshRandomNum(Math.random()); }, [searchTerm, categoryId, categorySubId, aiCategory, aiSubCategory, isStar, eventImpact, dateRange, hideDailyDiary]);

    useEffect(() => {
        void fetchStreak();
    }, [refreshRandomNum]);

    const fetchStreak = async () => {
        try {
            const res = await axiosCustom.request({ method: 'post', url: `/api/life-events/crud/lifeEventsStreak` });
            setStreak(res.data);
        } catch { /* ignore */ }
    };

    const fetchList = async (cancel: CancelTokenSource) => {
        setLoading(true);
        try {
            let startDate = '';
            if (dateRange.startDate) {
                const d = DateTime.fromJSDate(dateRange.startDate); if (d.isValid) startDate = d.toUTC().toISO() ?? '';
            }
            let endDate = '';
            if (dateRange.endDate) {
                const d = DateTime.fromJSDate(dateRange.endDate); if (d.isValid) endDate = d.toUTC().toISO() ?? '';
            }
            const config = { method: 'post', url: `/api/life-events/crud/lifeEventsGet`, headers: { 'Content-Type': 'application/json' }, data: { page, perPage, search: searchTerm, categoryId, categorySubId, isStar, eventImpact, hideDailyDiary, startDate, endDate, aiCategory, aiSubCategory }, cancelToken: cancel.token } as AxiosRequestConfig;
            const res = await axiosCustom.request(config);
            setList(Array.isArray(res.data.docs) ? res.data.docs : []);
            setTotalCount(typeof res.data.count === 'number' ? res.data.count : 0);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const lifeEventAddAxiosLocal = async () => {
        try { const r = await lifeEventAddAxios(); if (r.success !== '') navigate(`/user/life-events?action=edit&id=${r.recordId}`); } catch (e) { console.error(e); }
    };

    const sorted = useMemo(() => {
        const c = [...list];
        if (sort === 'title') c.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === 'oldest') c.sort((a, b) => DateTime.fromISO(a.eventDateUtc).toMillis() - DateTime.fromISO(b.eventDateUtc).toMillis());
        else c.sort((a, b) => DateTime.fromISO(b.eventDateUtc).toMillis() - DateTime.fromISO(a.eventDateUtc).toMillis());
        return c;
    }, [list, sort]);

    const grouped = useMemo(() => {
        if (!groupByYear) return null;
        const m = new Map<string, tsLifeEventsItem[]>();
        sorted.forEach((it) => {
            const y = DateTime.fromISO(it.eventDateUtc).toFormat('yyyy');
            const k = y && y !== 'Invalid DateTime' ? y : 'Unknown';
            const arr = m.get(k) ?? []; arr.push(it); m.set(k, arr);
        });
        return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    }, [sorted, groupByYear]);

    const calendarEvents = useMemo(() => {
        return sorted.map((it) => {
            const dt = DateTime.fromISO(it.eventDateUtc);
            const dateStr = dt.isValid ? dt.toISODate() ?? '' : '';
            return { id: it._id, title: it.title, date: dateStr };
        }).filter((e) => e.date !== '');
    }, [sorted]);

    const exportCsv = useCallback(() => {
        const rows = [['Title', 'Date', 'Impact', 'Category', 'Star', 'Place', 'Address']];
        sorted.forEach((it) => {
            const cat = it.categoryArr[0]?.name ?? '';
            const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
            rows.push([esc(it.title), DateTime.fromISO(it.eventDateUtc).toISODate() ?? '', it.eventImpact, esc(cat), it.isStar ? 'yes' : 'no', esc(it.placeName ?? ''), esc(it.address ?? '')]);
        });
        const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'life-events.csv'; a.click(); URL.revokeObjectURL(a.href); toast.success('CSV exported');
    }, [sorted]);

    const copyAddress = useCallback(async (addr: string) => {
        try { await navigator.clipboard.writeText(addr); toast.success('Address copied'); } catch { toast.error('Copy failed'); }
    }, []);

    const toggleBtn = 'inline-flex h-8 items-center justify-center rounded-lg border px-2 text-zinc-400 transition-colors sm:h-7';
    const chipBtn = (active: boolean) => `inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-medium ${active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`;

    return (
        <div>
            <Helmet><title>Life Events</title></Helmet>
            <div id="messagesScrollUp" />
            {streak && (
                <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 px-2.5 py-2">
                        <div className="text-[10px] text-zinc-500">Total events</div>
                        <div className="text-sm font-semibold text-zinc-100 tabular-nums">{streak.total}</div>
                    </div>
                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 px-2.5 py-2">
                        <div className="text-[10px] text-zinc-500">This month</div>
                        <div className="text-sm font-semibold text-zinc-100 tabular-nums">{streak.thisMonth}</div>
                    </div>
                    <div className="rounded-xl border border-indigo-700/60 bg-indigo-950/40 px-2.5 py-2">
                        <div className="text-[10px] text-indigo-300">Diary streak</div>
                        <div className="text-sm font-semibold text-white tabular-nums">{streak.currentStreak} days</div>
                    </div>
                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 px-2.5 py-2">
                        <div className="text-[10px] text-zinc-500">Longest</div>
                        <div className="text-sm font-semibold text-zinc-100 tabular-nums">{streak.longestStreak} days</div>
                    </div>
                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 px-2.5 py-2">
                        <div className="text-[10px] text-zinc-500">Active days</div>
                        <div className="text-sm font-semibold text-zinc-100 tabular-nums">{streak.distinctDays}</div>
                    </div>
                </div>
            )}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900 px-2 py-1.5 shadow-sm sm:mb-2.5 sm:px-2.5 sm:py-2">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <button type="button" aria-label="Add life event" onClick={() => void lifeEventAddAxiosLocal()} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-indigo-600/20 bg-indigo-600 px-2.5 text-[11px] font-medium text-white hover:bg-indigo-700 sm:h-7"><LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />Add</button>
                    <span className="text-[11px] text-zinc-400"><span className="font-semibold tabular-nums text-zinc-100">{totalCount}</span> events</span>
                    <button type="button" aria-label="Export CSV" onClick={() => exportCsv()} className="inline-flex h-7 items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-[11px] text-zinc-200 hover:bg-zinc-700"><LucideDownload className="h-3 w-3" />CSV</button>
                    <select aria-label="Page size" value={perPage} onChange={(e) => { const v = parseInt(e.target.value, 10); setPerPage(v); persist(PAGE_SIZE_KEY, String(v)); setPage(1); }} className="h-7 rounded-lg border border-zinc-700 bg-zinc-900 px-1 text-[11px] text-zinc-200">
                        <option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option>
                    </select>
                    <select aria-label="Sort" value={sort} onChange={(e) => { const v = e.target.value as typeof sort; setSort(v); persist(SORT_STORAGE_KEY, v); }} className="h-7 rounded-lg border border-zinc-700 bg-zinc-900 px-1 text-[11px] text-zinc-200">
                        <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title</option>
                    </select>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <button type="button" aria-label="Toggle year grouping" onClick={() => { const v = !groupByYear; setGroupByYear(v); persist(GROUP_STORAGE_KEY, String(v)); }} className={chipBtn(groupByYear)}><LucideCalendar className="mr-1 h-3 w-3" />Year</button>
                    <div className="flex rounded-lg border border-zinc-700/80 bg-zinc-950/90 p-0.5" role="group" aria-label="View mode">
                        <button type="button" aria-label="Grid view" aria-pressed={viewMode === 'grid'} onClick={() => { setViewMode('grid'); persist(VIEW_STORAGE_KEY, 'grid'); }} className={`${toggleBtn} ${viewMode === 'grid' ? 'border-indigo-700 bg-zinc-900 text-indigo-400' : 'border-transparent bg-transparent hover:bg-zinc-900/80 hover:text-zinc-100'}`}><LucideLayoutGrid className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button type="button" aria-label="List view" aria-pressed={viewMode === 'list'} onClick={() => { setViewMode('list'); persist(VIEW_STORAGE_KEY, 'list'); }} className={`${toggleBtn} ${viewMode === 'list' ? 'border-indigo-700 bg-zinc-900 text-indigo-400' : 'border-transparent bg-transparent hover:bg-zinc-900/80 hover:text-zinc-100'}`}><LucideList className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button type="button" aria-label="Timeline view" aria-pressed={viewMode === 'timeline'} onClick={() => { setViewMode('timeline'); persist(VIEW_STORAGE_KEY, 'timeline'); }} className={`${toggleBtn} ${viewMode === 'timeline' ? 'border-indigo-700 bg-zinc-900 text-indigo-400' : 'border-transparent bg-transparent hover:bg-zinc-900/80 hover:text-zinc-100'}`}><LucideClock className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button type="button" aria-label="Calendar view" aria-pressed={viewMode === 'calendar'} onClick={() => { setViewMode('calendar'); persist(VIEW_STORAGE_KEY, 'calendar'); }} className={`${toggleBtn} ${viewMode === 'calendar' ? 'border-indigo-700 bg-zinc-900 text-indigo-400' : 'border-transparent bg-transparent hover:bg-zinc-900/80 hover:text-zinc-100'}`}><LucideCalendar className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button type="button" aria-label="Map view" aria-pressed={viewMode === 'map'} onClick={() => { setViewMode('map'); persist(VIEW_STORAGE_KEY, 'map'); }} className={`${toggleBtn} ${viewMode === 'map' ? 'border-indigo-700 bg-zinc-900 text-indigo-400' : 'border-transparent bg-transparent hover:bg-zinc-900/80 hover:text-zinc-100'}`}><LucideMapPin className="h-3.5 w-3.5" strokeWidth={2} /></button>
                    </div>
                </div>
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-zinc-500">Impact:</span>
                {(['', 'very-low', 'low', 'medium', 'large', 'huge'] as const).map((v) => (
                    <button key={v} type="button" aria-label={`Filter impact ${v || 'all'}`} onClick={() => setEventImpact(v as never)} className={chipBtn(eventImpact === v)}>{v || 'All'}</button>
                ))}
                <span className="ml-2 text-[10px] text-zinc-500">Range:</span>
                {[{ k: '7d', l: '7d' }, { k: '30d', l: '30d' }, { k: 'thisYear', l: 'This year' }, { k: 'clear', l: 'Clear' }].map((p) => (
                    <button key={p.k} type="button" aria-label={`Date preset ${p.l}`} onClick={() => setPreset(p.k)} className="inline-flex h-6 items-center rounded-full border border-zinc-700 bg-zinc-900 px-2 text-[10px] text-zinc-300 hover:bg-zinc-800">{p.l}</button>
                ))}
            </div>

            {loading && <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-[260px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />))}</div>}

            {!loading && list.length === 0 && (
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 px-4 py-10 text-center">
                    <p className="text-sm text-zinc-300">{hasActiveFilters ? 'No events match filters.' : 'No life events yet.'}</p>
                    {hasActiveFilters && <button type="button" aria-label="Clear filters" onClick={() => clearFilters()} className="mt-3 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs text-white hover:bg-indigo-700">Clear filters</button>}
                </div>
            )}

            {!loading && viewMode === 'calendar' && list.length > 0 && (
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 p-2">
                    <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={calendarEvents} height="auto" eventClick={(info) => { const id = info.event.id; if (id) navigate(`/user/life-events?action=edit&id=${id}`); }} headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }} />
                    <p className="mt-1 text-[10px] text-zinc-500">Click an event to edit. Dates link to Maps via address on the detail page.</p>
                </div>
            )}

            {!loading && viewMode === 'timeline' && list.length > 0 && (
                <div className="relative rounded-xl border border-zinc-700/80 bg-zinc-900 p-3">
                    <div className="absolute left-4 top-3 bottom-3 w-px bg-zinc-700" />
                    <div className="flex flex-col gap-3">
                        {sorted.map((it) => {
                            const dt = DateTime.fromISO(it.eventDateUtc);
                            const label = dt.isValid ? dt.toFormat('dd MMM yyyy') : '—';
                            const rel = dt.isValid ? dt.toRelative() ?? '' : '';
                            return (
                                <div key={it._id} className="relative flex gap-3 pl-6">
                                    <div className="absolute left-2 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-indigo-600 bg-zinc-900" />
                                    <div className="min-w-[90px] shrink-0">
                                        <div className="text-xs font-medium text-zinc-100">{label}</div>
                                        <div className="text-[10px] text-zinc-500">{rel}</div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <ComponentLifeEventItem lifeEventObj={it} layout="list" onCopyAddress={copyAddress} />
                                        {it.address && (
                                            <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(it.address)}`} target="_blank" rel="noreferrer" aria-label="Open in Maps" className="mt-1 inline-flex text-[10px] text-indigo-400 hover:text-indigo-300">Open in Maps ↗</a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!loading && viewMode === 'map' && list.length > 0 && (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {sorted.map((it) => (
                        <div key={it._id} className="rounded-xl border border-zinc-700/80 bg-zinc-900 p-2">
                            <ComponentLifeEventItem lifeEventObj={it} layout="list" onCopyAddress={copyAddress} />
                            {it.lat != null && it.lng != null && (
                                <div className="mt-2 overflow-hidden rounded-lg border border-zinc-700">
                                    <iframe title={`map-${it._id}`} aria-label="Mini map" className="h-[160px] w-full border-0" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${it.lng - 0.01}%2C${it.lat - 0.01}%2C${it.lng + 0.01}%2C${it.lat + 0.01}&layer=mapnik&marker=${it.lat}%2C${it.lng}`} />
                                    <div className="flex items-center justify-between bg-zinc-950 px-2 py-1">
                                        <span className="truncate text-[10px] text-zinc-400">{it.address ?? `${it.lat}, ${it.lng}`}</span>
                                        <a href={`https://www.openstreetmap.org/?mlat=${it.lat}&mlon=${it.lng}#map=15/${it.lat}/${it.lng}`} target="_blank" rel="noreferrer" aria-label="Open in Maps" className="text-[10px] text-indigo-400">Open</a>
                                    </div>
                                </div>
                            )}
                            { (it.lat == null || it.lng == null) && it.address && (
                                <div className="mt-2 rounded-lg border border-zinc-700 bg-zinc-950 p-2">
                                    <div className="text-xs text-zinc-200">{it.address}</div>
                                    <div className="mt-1 flex gap-1">
                                        <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(it.address)}`} target="_blank" rel="noreferrer" aria-label="Open address in Maps" className="rounded bg-indigo-600 px-2 py-1 text-[10px] text-white">Open in Maps</a>
                                        <button type="button" aria-label="Copy address" onClick={() => copyAddress(it.address ?? '')} className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">Copy</button>
                                        <a href={`/user/maps`} aria-label="Go to Maps" className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">Maps app</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && grouped && list.length > 0 && (viewMode === 'grid' || viewMode === 'list') && grouped.map(([year, items]) => (
                <div key={year} className="mb-3">
                    <div className="mb-1.5 text-xs font-semibold text-zinc-400">{year} · {items.length}</div>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'flex flex-col gap-2'}>
                        {items.map((it) => <ComponentLifeEventItem key={it._id} lifeEventObj={it} layout={viewMode} onCopyAddress={copyAddress} />)}
                    </div>
                </div>
            ))}

            {!loading && !grouped && viewMode === 'grid' && list.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 xl:grid-cols-3 2xl:grid-cols-4">
                    {sorted.map((it) => <ComponentLifeEventItem key={it._id} lifeEventObj={it} layout="grid" onCopyAddress={copyAddress} />)}
                </div>
            )}
            {!loading && !grouped && viewMode === 'list' && list.length > 0 && (
                <div className="flex flex-col gap-2 sm:gap-1.5">
                    {sorted.map((it) => <ComponentLifeEventItem key={it._id} lifeEventObj={it} layout="list" onCopyAddress={copyAddress} />)}
                </div>
            )}

            {totalCount >= 1 && viewMode !== 'calendar' && (
                <div className="mt-3 flex w-full items-center justify-center px-1 pb-2 sm:mt-4">
                    <ReactPaginate breakLabel="…" nextLabel="›" onPageChange={(e) => { setPage(e.selected + 1); document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' }); }} marginPagesDisplayed={1} pageRangeDisplayed={2} pageCount={Math.ceil(totalCount / perPage)} previousLabel="‹" renderOnZeroPageCount={null} forcePage={page - 1} containerClassName="flex max-w-full flex-wrap items-center justify-center gap-1" pageLinkClassName="min-w-[2rem] rounded-lg border border-zinc-700/80 bg-zinc-900 px-2 py-1 text-center text-[11px] font-medium text-zinc-300 hover:bg-zinc-800" previousLinkClassName="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800" nextLinkClassName="rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800" breakLinkClassName="px-1 text-[11px] text-zinc-400" activeLinkClassName="!border-indigo-600 !bg-indigo-600 text-white" />
                </div>
            )}
            <div id="messagesScrollDown" />
        </div>
    );
};
export default ComponentLifeEventsList;
