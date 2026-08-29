import { useState, useEffect, useMemo, useRef } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { IInfoVault } from '../../../../../types/pages/tsInfoVault.ts';
import ComponentInfoVaultItem from './ComponentInfoVaultItem.tsx';
import ComponentInfoVaultGraphMini from './ComponentInfoVaultGraphMini.tsx';
import ReactPaginate from 'react-paginate';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { LucideLayoutGrid, LucideList, LucidePlus, LucideSearchX, LucideUpload, LucideNetwork, LucideAlertTriangle } from 'lucide-react';
import { infoVaultAddAxios } from '../utils/infoVaultListAxios.ts';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { DateTime } from 'luxon';
import {
    jotaiStateInfoVaultArchivedFilter,
    jotaiStateInfoVaultIsStar,
    jotaiStateInfoVaultRelationshipFilter,
    jotaiStateInfoVaultSearch,
    jotaiStateInfoVaultTypeFilter,
} from '../stateJotai/infoVaultStateJotai.ts';

const LS_GROUP = 'iv_groupHeaders';
const LS_SORT = 'iv_sort';
const LS_GRAPH = 'iv_showGraph';
const readLS = (k: string, def: string) => {
    try { const v = localStorage.getItem(k); return v !== null ? v : def; } catch { return def; }
};
const writeLS = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { } };

type SortOpt = 'recent' | 'name' | 'favorite';

const ComponentInfoVaultList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as IInfoVault[]);
    const [page, setPage] = useState(1);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [perPage, setPerPage] = useState(12);
    const [groupHeaders, setGroupHeaders] = useState(() => readLS(LS_GROUP, 'false') === 'true');
    const [sort, setSort] = useState<SortOpt>(() => (readLS(LS_SORT, 'recent') as SortOpt));
    const [showGraph, setShowGraph] = useState(() => readLS(LS_GRAPH, 'false') === 'true');
    const [loading, setLoading] = useState(false);
    const csvRef = useRef<HTMLInputElement>(null);
    const vcfRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useAtom(jotaiStateInfoVaultSearch);
    const [isFavorite, setIsFavorite] = useAtom(jotaiStateInfoVaultIsStar);
    const [infoVaultTypeFilter, setInfoVaultTypeFilter] = useAtom(jotaiStateInfoVaultTypeFilter);
    const [relationshipTypeFilter, setRelationshipTypeFilter] = useAtom(jotaiStateInfoVaultRelationshipFilter);
    const [isArchivedFilter, setIsArchivedFilter] = useAtom(jotaiStateInfoVaultArchivedFilter);

    useEffect(() => { writeLS(LS_GROUP, String(groupHeaders)); }, [groupHeaders]);
    useEffect(() => { writeLS(LS_SORT, sort); }, [sort]);
    useEffect(() => { writeLS(LS_GRAPH, String(showGraph)); }, [showGraph]);

    useEffect(() => {
        const c: CancelTokenSource = axios.CancelToken.source();
        void fetchList({ axiosCancelTokenSource: c });
        return () => { c.cancel('cancel'); };
    }, [refreshRandomNum, page, perPage]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [searchTerm, isFavorite, infoVaultTypeFilter, relationshipTypeFilter, isArchivedFilter]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/info-vault/crud/infoVaultGet`,
                headers: { 'Content-Type': 'application/json' },
                data: {
                    page, perPage, search: searchTerm, isFavorite,
                    ...(infoVaultTypeFilter ? { infoVaultType: infoVaultTypeFilter } : {}),
                    ...(relationshipTypeFilter ? { relationshipType: relationshipTypeFilter } : {}),
                    ...(isArchivedFilter ? { isArchived: isArchivedFilter } : {}),
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;
            const response = await axiosCustom.request(config);
            setList(Array.isArray(response.data.docs) ? response.data.docs : []);
            setTotalCount(typeof response.data.count === 'number' ? response.data.count : 0);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const notesAddAxiosLocal = async () => {
        try {
            const result = await infoVaultAddAxios();
            if (result.success !== '') { navigate(`/user/info-vault?action=edit&id=${result.recordId}`); }
        } catch (error) { console.error(error); }
    };

    const clearFilters = () => {
        setSearchTerm(''); setIsFavorite(''); setInfoVaultTypeFilter(''); setRelationshipTypeFilter(''); setIsArchivedFilter('');
    };

    const hasFilters = searchTerm !== '' || isFavorite !== '' || infoVaultTypeFilter !== '' || relationshipTypeFilter !== '' || isArchivedFilter !== '';
    const archivedCount = useMemo(() => list.filter((x) => x.isArchived).length, [list]);

    const overdueCount = useMemo(() => {
        let c = 0;
        list.forEach((x) => {
            if (!x.lastContactDate) { return; }
            const dt = DateTime.fromJSDate(new Date(x.lastContactDate));
            if (!dt.isValid) { return; }
            let th: number | null = null;
            if (x.contactFrequency === 'daily') { th = 1; }
            if (x.contactFrequency === 'weekly') { th = 7; }
            if (x.contactFrequency === 'monthly') { th = 30; }
            if (x.contactFrequency === 'yearly') { th = 365; }
            if (th === null) { return; }
            const days = Math.floor(DateTime.now().diff(dt, 'days').days);
            if (days > th) { c += 1; }
        });
        return c;
    }, [list]);

    const sorted = useMemo(() => {
        const arr = [...list];
        arr.sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) { return a.isFavorite ? -1 : 1; }
            if (sort === 'name') { return a.name.localeCompare(b.name); }
            if (sort === 'recent') { return new Date(b.updatedAtUtc).getTime() - new Date(a.updatedAtUtc).getTime(); }
            return 0;
        });
        return arr;
    }, [list, sort]);

    const grouped = useMemo(() => {
        if (!groupHeaders) { return null; }
        const m = new Map<string, IInfoVault[]>();
        sorted.forEach((x) => {
            const k = (x.name?.[0] || '#').toUpperCase();
            const arr = m.get(k) || [];
            arr.push(x);
            m.set(k, arr);
        });
        return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [sorted, groupHeaders]);

    const parseCsvText = (text: string) => {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) { return [] as Array<Record<string, string>>; }
        const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const idxName = header.indexOf('name');
        const idxCompany = header.indexOf('company');
        const idxJob = header.indexOf('jobtitle');
        const idxJob2 = header.indexOf('job_title');
        const idxTags = header.indexOf('tags');
        const idxNotes = header.indexOf('notes');
        const idxType = header.indexOf('type');
        const idxRel = header.indexOf('relationship');
        const out: Array<Record<string, string>> = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            if (idxName >= 0) { row.name = cols[idxName] || ''; } else { row.name = cols[0] || ''; }
            if (idxCompany >= 0) { row.company = cols[idxCompany] || ''; }
            if (idxJob >= 0) { row.jobTitle = cols[idxJob] || ''; }
            if (idxJob2 >= 0 && !row.jobTitle) { row.jobTitle = cols[idxJob2] || ''; }
            if (idxTags >= 0) { row.tags = cols[idxTags] || ''; }
            if (idxNotes >= 0) { row.notes = cols[idxNotes] || ''; }
            if (idxType >= 0) { row.infoVaultType = cols[idxType] || ''; }
            if (idxRel >= 0) { row.relationshipType = cols[idxRel] || ''; }
            if (row.name) { out.push(row); }
        }
        return out;
    };

    const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { return; }
        try {
            const text = await file.text();
            const rowsRaw = parseCsvText(text);
            if (rowsRaw.length === 0) { toast.error('No valid rows in CSV'); return; }
            const rows = rowsRaw.map((r) => ({ name: r.name, company: r.company || '', jobTitle: r.jobTitle || '', tags: r.tags ? r.tags.split(';').map((t) => t.trim()).filter(Boolean) : [], notes: r.notes || '', infoVaultType: r.infoVaultType || '', relationshipType: r.relationshipType || '' }));
            const res = await axiosCustom.request({ method: 'post', url: '/api/info-vault/crud/infoVaultImport', data: { rows } });
            toast.success(`Imported ${res.data.createdCount} entries`);
            setRefreshRandomNum(Math.random());
        } catch { toast.error('CSV import failed'); }
        if (csvRef.current) { csvRef.current.value = ''; }
    };

    const parseVcfText = (text: string) => {
        const cards = text.split('BEGIN:VCARD');
        const out: Array<Record<string, string>> = [];
        cards.forEach((c) => {
            if (!c.includes('FN:')) { return; }
            const lines = c.split(/\r?\n/);
            let fn = '';
            let org = '';
            let title = '';
            let note = '';
            lines.forEach((l) => {
                if (l.startsWith('FN:')) { fn = l.slice(3).trim(); }
                if (l.startsWith('ORG:')) { org = l.slice(4).trim(); }
                if (l.startsWith('TITLE:')) { title = l.slice(6).trim(); }
                if (l.startsWith('NOTE:')) { note = l.slice(5).trim().replace(/\\n/g, ' '); }
            });
            if (fn) { out.push({ name: fn, company: org, jobTitle: title, notes: note }); }
        });
        return out;
    };

    const handleVcfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { return; }
        try {
            const text = await file.text();
            const rowsRaw = parseVcfText(text);
            if (rowsRaw.length === 0) { toast.error('No contacts in vCard'); return; }
            const rows = rowsRaw.map((r) => ({ name: r.name, company: r.company || '', jobTitle: r.jobTitle || '', notes: r.notes || '', infoVaultType: 'contact' }));
            const res = await axiosCustom.request({ method: 'post', url: '/api/info-vault/crud/infoVaultImport', data: { rows } });
            toast.success(`Imported ${res.data.createdCount} contacts`);
            setRefreshRandomNum(Math.random());
        } catch { toast.error('vCard import failed'); }
        if (vcfRef.current) { vcfRef.current.value = ''; }
    };

    const goToTop = () => { document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' }); };

    return (
        <div>
            <Helmet><title>Info Vault</title></Helmet>
            <div id="messagesScrollUp" />
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1.5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => { void notesAddAxiosLocal(); }} aria-label="Add entry" className="inline-flex items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700">
                        <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />Add
                    </button>
                    <span className="text-xs text-zinc-400"><span className="font-semibold text-zinc-100">{totalCount}</span> entries</span>
                    {archivedCount > 0 && <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">{archivedCount} archived</span>}
                    {overdueCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 px-2 py-0.5 text-[10px] font-medium text-amber-200"><LucideAlertTriangle className="h-3 w-3" />{overdueCount} overdue</span>}
                    <select aria-label="Sort" value={sort} onChange={(e) => { setSort(e.target.value as SortOpt); }} className="rounded-sm border border-zinc-700 bg-zinc-900 px-1 py-1 text-xs text-zinc-200">
                        <option value="recent">Recent</option>
                        <option value="name">Name A-Z</option>
                        <option value="favorite">Favorites first</option>
                    </select>
                    <select aria-label="Page size" value={String(perPage)} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded-sm border border-zinc-700 bg-zinc-900 px-1 py-1 text-xs text-zinc-200">
                        <option value="12">12 / page</option>
                        <option value="24">24 / page</option>
                        <option value="48">48 / page</option>
                    </select>
                    <label className="inline-flex items-center gap-1 text-xs text-zinc-400"><input type="checkbox" checked={groupHeaders} onChange={(e) => { setGroupHeaders(e.target.checked); }} aria-label="Toggle A-Z headers" /> A-Z headers</label>
                    <button type="button" aria-label="Toggle graph" onClick={() => { setShowGraph(!showGraph); }} className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs ${showGraph ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}><LucideNetwork className="h-3.5 w-3.5" />Graph</button>
                </div>
                <div className="flex items-center gap-1">
                    <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFile} aria-label="CSV file input" />
                    <input ref={vcfRef} type="file" accept=".vcf" className="hidden" onChange={handleVcfFile} aria-label="vCard file input" />
                    <button type="button" aria-label="Import CSV" onClick={() => { csvRef.current?.click(); }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"><LucideUpload className="h-3.5 w-3.5" />CSV</button>
                    <button type="button" aria-label="Import vCard" onClick={() => { vcfRef.current?.click(); }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"><LucideUpload className="h-3.5 w-3.5" />vCard</button>
                    <div className="inline-flex rounded-sm border border-zinc-700 p-0.5" role="group" aria-label="List or grid layout">
                        <button type="button" onClick={() => { setViewMode('list'); }} aria-label="List view" aria-pressed={viewMode === 'list'} className={`inline-flex items-center justify-center rounded-sm p-1.5 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}><LucideList className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button type="button" onClick={() => { setViewMode('grid'); }} aria-label="Grid view" aria-pressed={viewMode === 'grid'} className={`inline-flex items-center justify-center rounded-sm p-1.5 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}><LucideLayoutGrid className="h-3.5 w-3.5" strokeWidth={2} /></button>
                    </div>
                </div>
            </div>

            {showGraph && (
                <div className="mb-2">
                    <ComponentInfoVaultGraphMini docs={sorted} />
                </div>
            )}

            {loading && (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-1.5'}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-sm border border-zinc-700 bg-zinc-900 p-3"><div className="h-4 w-2/3 rounded bg-zinc-800" /><div className="mt-2 h-3 w-full rounded bg-zinc-800" /><div className="mt-2 h-6 w-20 rounded bg-zinc-800" /></div>
                    ))}
                </div>
            )}

            {!loading && sorted.length === 0 && (
                <div className="rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-10 text-center">
                    <LucideSearchX className="mx-auto h-8 w-8 text-zinc-600" />
                    <p className="mt-2 text-sm font-medium text-zinc-200">No entries found</p>
                    <p className="text-xs text-zinc-400">Try adjusting filters or create a new entry</p>
                    {hasFilters && <button type="button" onClick={() => { clearFilters(); toast.success('Filters cleared'); }} aria-label="Clear filters" className="mt-3 rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800">Clear filters</button>}
                </div>
            )}

            {!loading && grouped && sorted.length > 0 && (
                <div className="space-y-3">
                    {grouped.map(([letter, items]) => (
                        <div key={letter}>
                            <div className="mb-1 text-xs font-bold tracking-widest text-zinc-500">{letter}</div>
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-1.5'}>
                                {items.map((obj) => <ComponentInfoVaultItem key={obj._id} infoVaultObj={obj} onRefresh={() => { setRefreshRandomNum(Math.random()); }} searchTerm={searchTerm} />)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && !grouped && sorted.length > 0 && (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-1.5'}>
                    {sorted.map((obj) => <ComponentInfoVaultItem key={obj._id} infoVaultObj={obj} onRefresh={() => { setRefreshRandomNum(Math.random()); }} searchTerm={searchTerm} />)}
                </div>
            )}

            {totalCount >= 1 && (
                <div className="mt-3 flex w-full items-center justify-center">
                    <ReactPaginate breakLabel="…" nextLabel="›" onPageChange={(e) => { setPage(e.selected + 1); goToTop(); }} marginPagesDisplayed={1} pageRangeDisplayed={2} pageCount={Math.ceil(totalCount / perPage)} previousLabel="‹" renderOnZeroPageCount={null} forcePage={page - 1} containerClassName="flex flex-wrap items-center justify-center gap-1" pageLinkClassName="min-w-[1.75rem] rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-center text-[11px] text-zinc-700 hover:bg-zinc-800" previousLinkClassName="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-800" nextLinkClassName="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-800" breakLinkClassName="px-1 text-[11px] text-zinc-400" activeLinkClassName="border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600" />
                </div>
            )}
            <div id="messagesScrollDown" />
        </div>
    );
};

export default ComponentInfoVaultList;
