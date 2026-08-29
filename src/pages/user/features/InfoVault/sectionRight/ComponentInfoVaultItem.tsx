import { LucideEdit, LucideStar, LucideTrash2, LucideCopy, LucideGlobe, LucideMapPin, LucideUser, LucideBuilding, LucideCalendar, LucideDownload, LucideClock, LucideAlertTriangle } from 'lucide-react';
import { IInfoVault } from '../../../../../types/pages/tsInfoVault';
import { Link } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom';
import { Fragment, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { DateTime } from 'luxon';

const typeIcon = (t: string) => {
    if (t === 'contact') { return <LucideUser className="h-3 w-3" />; }
    if (t === 'place') { return <LucideMapPin className="h-3 w-3" />; }
    if (t === 'event') { return <LucideCalendar className="h-3 w-3" />; }
    if (t === 'product' || t === 'asset') { return <LucideBuilding className="h-3 w-3" />; }
    return <LucideGlobe className="h-3 w-3" />;
};

const escapeReg = (s: string) => {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const ComponentInfoVaultItem = ({ infoVaultObj, onRefresh, searchTerm }: { infoVaultObj: IInfoVault; onRefresh?: () => void; searchTerm?: string; }) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [isExpandedDescription, setIsExpandedDescription] = useState(false);
    const [isExpandedAiSummary, setIsExpandedAiSummary] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [fav, setFav] = useState(infoVaultObj.isFavorite);

    const highlight = (text: string) => {
        const term = (searchTerm || '').trim();
        if (!term) { return text; }
        const parts = text.split(new RegExp(`(${escapeReg(term)})`, 'gi'));
        if (parts.length === 1) { return text; }
        return (
            <span>
                {parts.map((p, idx) => {
                    if (p.toLowerCase() === term.toLowerCase()) {
                        return <mark key={idx} className="rounded-sm bg-amber-300 px-0.5 text-zinc-900">{p}</mark>;
                    }
                    return <span key={idx}>{p}</span>;
                })}
            </span>
        );
    };

    const initials = useMemo(() => {
        const n = infoVaultObj.name || '';
        const parts = n.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) { return '?'; }
        if (parts.length === 1) { return parts[0].slice(0, 2).toUpperCase(); }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [infoVaultObj.name]);

    const lastContactRelative = useMemo(() => {
        if (!infoVaultObj.lastContactDate) { return null; }
        const dt = DateTime.fromJSDate(new Date(infoVaultObj.lastContactDate));
        if (!dt.isValid) { return null; }
        return dt.toRelative();
    }, [infoVaultObj.lastContactDate]);

    const overdueInfo = useMemo(() => {
        if (!infoVaultObj.lastContactDate) { return { overdue: false, daysSince: null as number | null }; }
        const dt = DateTime.fromJSDate(new Date(infoVaultObj.lastContactDate));
        if (!dt.isValid) { return { overdue: false, daysSince: null as number | null }; }
        const freq = infoVaultObj.contactFrequency || '';
        let threshold: number | null = null;
        if (freq === 'daily') { threshold = 1; }
        if (freq === 'weekly') { threshold = 7; }
        if (freq === 'monthly') { threshold = 30; }
        if (freq === 'yearly') { threshold = 365; }
        if (threshold === null) { return { overdue: false, daysSince: null as number | null }; }
        const daysSince = Math.floor(DateTime.now().diff(dt, 'days').days);
        if (daysSince > threshold) { return { overdue: true, daysSince }; }
        return { overdue: false, daysSince };
    }, [infoVaultObj.lastContactDate, infoVaultObj.contactFrequency]);

    const toggleFav = async () => {
        try {
            await axiosCustom.request({ method: 'post', url: '/api/info-vault/crud/infoVaultEdit', data: { _id: infoVaultObj._id, isFavorite: !fav } });
            setFav(!fav); toast.success(!fav ? 'Starred' : 'Unstarred');
        } catch { toast.error('Failed'); }
    };

    const doDelete = async () => {
        try {
            await axiosCustom.request({ method: 'post', url: '/api/info-vault/crud/infoVaultDelete', data: { _id: infoVaultObj._id } });
            setIsDeleted(true); setConfirmOpen(false); toast.success('Deleted');
        } catch { toast.error('Delete failed'); }
    };

    const duplicate = async () => {
        try {
            const res = await axiosCustom.request({ method: 'post', url: '/api/info-vault/crud/infoVaultAdd', data: {} });
            const newId = res.data?.doc?._id || res.data?.recordId || res.data?.id;
            if (newId) {
                await axiosCustom.request({ method: 'post', url: '/api/info-vault/crud/infoVaultEdit', data: { _id: newId, name: `${infoVaultObj.name} (copy)`, notes: infoVaultObj.notes, tags: infoVaultObj.tags, infoVaultType: infoVaultObj.infoVaultType } });
                toast.success('Duplicated');
                if (onRefresh) { onRefresh(); }
            } else { toast.error('Duplicate failed'); }
        } catch { toast.error('Duplicate failed'); }
    };

    const exportVcard = () => {
        const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${infoVaultObj.name}`, `ORG:${infoVaultObj.company || ''}`, `TITLE:${infoVaultObj.jobTitle || ''}`, `NOTE:${(infoVaultObj.notes || '').replace(/\n/g, '\\n')}`, 'END:VCARD'];
        const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${infoVaultObj.name || 'contact'}.vcf`; a.click(); URL.revokeObjectURL(a.href); toast.success('vCard exported');
    };

    const chip = 'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium';

    const renderItem = () => {
        return (
            <Fragment>
                <div className="flex items-start gap-2">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {infoVaultObj.photoUrl ? <img src={infoVaultObj.photoUrl} alt={infoVaultObj.name} className="h-full w-full object-cover" /> : initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold leading-snug text-zinc-100 flex items-center gap-1">
                            <span className="inline-flex items-center gap-1">{typeIcon(infoVaultObj.infoVaultType)} {highlight(infoVaultObj.name)}</span>
                            <button type="button" aria-label={fav ? 'Unstar' : 'Star'} onClick={() => { void toggleFav(); }} className={fav ? 'text-amber-400' : 'text-zinc-600 hover:text-amber-400'}><LucideStar className="h-3.5 w-3.5" fill={fav ? 'currentColor' : 'none'} /></button>
                        </h3>
                        {(infoVaultObj.company || infoVaultObj.jobTitle) && <p className="truncate text-xs text-zinc-400">{highlight([infoVaultObj.company, infoVaultObj.jobTitle].filter(Boolean).join(' · '))}</p>}
                    </div>
                </div>

                <div className="my-1.5 flex flex-wrap gap-1">
                    <span className={`${chip} border-zinc-700 bg-zinc-950 text-zinc-400`}>Created {new Date(infoVaultObj.createdAtUtc).toLocaleDateString()}</span>
                    <span className={`${chip} border-zinc-700 bg-zinc-900 text-zinc-400`}>Updated {new Date(infoVaultObj.updatedAtUtc).toLocaleDateString()}</span>
                    <span className={`${chip} border-zinc-700 bg-zinc-900 text-zinc-400 capitalize`}>{infoVaultObj.infoVaultType || 'other'}</span>
                    {infoVaultObj.isBlocked && <span className={`${chip} border-red-800 bg-red-950 text-red-300`}>Blocked</span>}
                    {infoVaultObj.isArchived && <span className={`${chip} border-zinc-700 bg-zinc-800 text-zinc-400`}>Archived</span>}
                    <span className={`${chip} border-sky-800 bg-sky-950 text-sky-200`}>{infoVaultObj.contactFrequency || 'rarely'}</span>
                    {lastContactRelative && <span className={`${chip} ${overdueInfo.overdue ? 'border-red-700 bg-red-950 text-red-200' : 'border-zinc-700 bg-zinc-900 text-zinc-400'} flex gap-1`}><LucideClock className="h-3 w-3" />{lastContactRelative}{overdueInfo.overdue ? <span className="inline-flex items-center gap-0.5"><LucideAlertTriangle className="h-3 w-3" />overdue {overdueInfo.daysSince}d</span> : null}</span>}
                    {fav && <span className={`${chip} border-amber-700 bg-amber-950 text-amber-200`}><LucideStar className="mr-0.5 h-3 w-3" fill="currentColor" />Starred</span>}
                    {infoVaultObj.tags.map((tagStr, tagIndex) => <span className={`${chip} border-emerald-700 bg-emerald-950 text-emerald-200`} key={tagIndex}>{highlight(tagStr)}</span>)}
                    {infoVaultObj.aiTags.map((tagStr, tagIndex) => <span className={`${chip} border-indigo-700 bg-indigo-950 text-indigo-200`} key={tagIndex}>{highlight(tagStr)}</span>)}
                </div>

                {infoVaultObj.notes && <p className="mb-1 line-clamp-2 text-xs text-zinc-400">{highlight(infoVaultObj.notes.slice(0, 160))}</p>}

                <div className="action-buttons mt-2 flex flex-wrap gap-1">
                    {infoVaultObj.notes.trim().length >= 1 && <button type="button" aria-label="Toggle notes" className="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800" onClick={() => { setIsExpandedDescription(!isExpandedDescription); }}>{isExpandedDescription ? 'Hide notes' : 'Notes'}</button>}
                    {infoVaultObj.aiSummary.trim().length >= 1 && <button type="button" aria-label="Toggle AI summary" className="rounded-sm border border-indigo-700 bg-indigo-950 px-2 py-0.5 text-[11px] font-medium text-indigo-200 hover:bg-indigo-900" onClick={() => { setIsExpandedAiSummary(!isExpandedAiSummary); }}>AI summary</button>}
                    <Link to={`/user/info-vault?action=edit&id=${infoVaultObj._id}`} aria-label="Edit" className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800"><LucideEdit className="h-3 w-3" />Edit</Link>
                    <button type="button" aria-label="Duplicate entry" onClick={() => { void duplicate(); }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-800"><LucideCopy className="h-3 w-3" />Duplicate</button>
                    <button type="button" aria-label="Export vCard" onClick={() => { exportVcard(); }} className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200 hover:bg-zinc-800"><LucideDownload className="h-3 w-3" />vCard</button>
                    <button type="button" aria-label="Delete entry" className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800 hover:bg-red-100" onClick={() => { setConfirmOpen(true); }}><LucideTrash2 className="h-3 w-3" />Delete</button>
                </div>

                {isExpandedDescription && <p className="mb-2 mt-1.5 whitespace-pre-wrap rounded-sm border border-zinc-700 bg-zinc-950/80 p-2 text-xs text-zinc-200">{highlight(infoVaultObj.notes)}</p>}
                {isExpandedAiSummary && <p className="mb-2 mt-1.5 whitespace-pre-wrap rounded-sm border border-indigo-800 bg-indigo-950/50 p-2 text-xs text-zinc-200">{highlight(infoVaultObj.aiSummary)}</p>}

                {confirmOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-sm rounded-sm border border-zinc-700 bg-zinc-900 p-4">
                            <h4 className="text-sm font-semibold text-zinc-100">Delete entry?</h4>
                            <p className="mt-1 text-xs text-zinc-400">This cannot be undone.</p>
                            <div className="mt-4 flex justify-end gap-2">
                                <button type="button" aria-label="Cancel delete" onClick={() => { setConfirmOpen(false); }} className="rounded-sm border border-zinc-700 px-3 py-1 text-xs text-zinc-200">Cancel</button>
                                <button type="button" aria-label="Confirm delete" onClick={() => { void doDelete(); }} className="rounded-sm bg-red-600 px-3 py-1 text-xs text-white">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </Fragment>
        );
    };

    return (
        <div className={`rounded-sm border bg-zinc-900 px-2.5 py-2 shadow-sm ${infoVaultObj.isBlocked ? 'border-red-900 opacity-60' : 'border-zinc-700'} ${infoVaultObj.isArchived ? 'opacity-80' : ''}`}>
            {isDeleted && <div className="rounded-sm border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-700">This item has been deleted.</div>}
            {!isDeleted && <Fragment>{renderItem()}</Fragment>}
        </div>
    );
};

export default ComponentInfoVaultItem;
