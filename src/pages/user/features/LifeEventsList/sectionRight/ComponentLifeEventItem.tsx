import { LucideCalendar, LucideCpu, LucideEdit, LucideExpand, LucideFile, LucideImage, LucideStar, LucideTrash2, LucideCopy, LucideMessageCircle, LucideMapPin, LucideArchive } from 'lucide-react';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents';
import { Link } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom';
import { Fragment, useState } from 'react';
import envKeys from '../../../../../config/envKeys';
import { DateTime } from 'luxon';
import toast from 'react-hot-toast';
import { useSetAtom } from 'jotai';
import { jotaiStateLifeEventAiCategory } from '../stateJotai/lifeEventStateJotai';
import { lifeEventAddAxios } from '../utils/lifeEventsListAxios';

export type LifeEventItemLayout = 'grid' | 'list';

const ComponentLifeEventItem = ({ lifeEventObj, layout = 'list', onCopyAddress = () => {} }: { lifeEventObj: tsLifeEventsItem; layout?: LifeEventItemLayout; onCopyAddress?: (addr: string) => void }) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [isExpandedDescription, setIsExpandedDescription] = useState(false);
    const [isExpandedAiSummary, setIsExpandedAiSummary] = useState(false);
    const [star, setStar] = useState(lifeEventObj.isStar);
    const [archived, setArchived] = useState(!!lifeEventObj.isArchived);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const setAiCat = useSetAtom(jotaiStateLifeEventAiCategory);

    const getImpactStr = () => {
        if (lifeEventObj.eventImpact === 'very-low') return 'Very Low';
        if (lifeEventObj.eventImpact === 'low') return 'Low';
        if (lifeEventObj.eventImpact === 'medium') return 'Medium';
        if (lifeEventObj.eventImpact === 'large') return 'Large';
        if (lifeEventObj.eventImpact === 'huge') return 'Huge';
        return 'Very Low';
    };
    const getCategoryStr = () => {
        const c = lifeEventObj.categoryArr.length > 0 ? lifeEventObj.categoryArr[0].name : '';
        const s = lifeEventObj.categorySubArr.length > 0 ? lifeEventObj.categorySubArr[0].name : '';
        if (c && s) return `${c} > ${s}`;
        return c;
    };
    const getAiCategoryStr = () => {
        try {
            if (lifeEventObj.aiCategory.length > 0 && lifeEventObj.aiSubCategory.length > 0) return `AI: ${lifeEventObj.aiCategory} > ${lifeEventObj.aiSubCategory}`;
            if (lifeEventObj.aiCategory.length > 0) return `AI: ${lifeEventObj.aiCategory}`;
        } catch (e) { console.error(e); }
        return '';
    };
    const doDelete = async () => {
        try {
            await axiosCustom.request({ method: 'post', url: `/api/life-events/crud/lifeEventsDelete`, headers: { 'Content-Type': 'application/json' }, data: { _id: lifeEventObj._id } });
            setIsDeleted(true); toast.success('Deleted'); setConfirmOpen(false);
        } catch (e) { console.error(e); toast.error('Delete failed'); }
    };
    const toggleStar = async () => {
        const next = !star; setStar(next);
        try { await axiosCustom.request({ method: 'post', url: `/api/life-events/crud/lifeEventsEdit`, headers: { 'Content-Type': 'application/json' }, data: { _id: lifeEventObj._id, isStar: next } }); toast.success(next ? 'Starred' : 'Unstarred'); } catch (e) { console.error(e); setStar(!next); toast.error('Failed'); }
    };
    const toggleArchive = async () => {
        const next = !archived; setArchived(next);
        try { await axiosCustom.request({ method: 'post', url: `/api/life-events/crud/lifeEventsEdit`, headers: { 'Content-Type': 'application/json' }, data: { _id: lifeEventObj._id, isArchived: next } }); toast.success(next ? 'Archived' : 'Unarchived'); } catch (e) { console.error(e); setArchived(!next); toast.error('Failed'); }
    };
    const duplicate = async () => {
        try {
            const res = await lifeEventAddAxios();
            if (res.success !== '') {
                await axiosCustom.request({ method: 'post', url: `/api/life-events/crud/lifeEventsEdit`, headers: { 'Content-Type': 'application/json' }, data: { _id: res.recordId, title: `${lifeEventObj.title} (copy)`, description: lifeEventObj.description, eventImpact: lifeEventObj.eventImpact, categoryId: lifeEventObj.categoryId, categorySubId: lifeEventObj.categorySubId, placeName: lifeEventObj.placeName ?? '', address: lifeEventObj.address ?? '', lat: lifeEventObj.lat ?? null, lng: lifeEventObj.lng ?? null } });
                toast.success('Duplicated');
            }
        } catch (e) { console.error(e); toast.error('Duplicate failed'); }
    };
    const getFileUrl = (fileUrl: string) => `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${fileUrl}`;
    const comments = lifeEventObj?.comments ?? [];
    const firstImageIndex = comments.findIndex((c) => c.fileType === 'image');
    const firstImage = firstImageIndex >= 0 ? comments[firstImageIndex] : undefined;
    const firstImageUrl = firstImage ? getFileUrl(firstImage.fileUrl) : null;
    const listStripFiles = firstImageIndex >= 0 ? comments.filter((_, i) => i !== firstImageIndex) : comments;
    const extraFileCount = Math.max(0, comments.length - (firstImage ? 1 : 0));
    const chip = 'inline-flex items-center rounded-md border px-1 py-px text-[9px] font-medium leading-tight sm:text-[10px]';
    const dt = DateTime.fromISO(lifeEventObj.eventDateUtc);
    const dateLabel = dt.isValid ? dt.toFormat('dd/MM/yyyy') : '—';
    const age = (() => { if (!dt.isValid) return null; const now = DateTime.now(); const diff = now.diff(dt, 'years').years; if (diff < 0) return null; return `${Math.floor(diff)}y`; })();

    const renderFileStrip = (files: typeof comments) => (
        <div className="mb-1 overflow-x-auto whitespace-nowrap pb-0.5">
            {files.map((fileObj, fileIndex) => (
                <Fragment key={fileIndex}>
                    {fileObj.fileType === 'image' && <button type="button" aria-label="Open image" onClick={() => setLightbox(getFileUrl(fileObj.fileUrl))} className="mr-1 inline-block"><img src={getFileUrl(fileObj.fileUrl)} alt="" className="inline-block max-h-[88px] max-w-[88px] rounded-md border border-zinc-700/90 object-cover" /></button>}
                    {fileObj.fileType === 'video' && <video src={getFileUrl(fileObj.fileUrl)} controls className="mr-1 inline-block max-h-[88px] max-w-[88px] rounded-md border border-zinc-700/90 object-cover" />}
                    {fileObj.fileType === 'audio' && <audio src={getFileUrl(fileObj.fileUrl)} controls className="mr-1 inline-block w-[120px] rounded-md" />}
                    {fileObj.fileType === 'file' && <div className="mr-1 inline-block align-middle"><a href={getFileUrl(fileObj.fileUrl)} target="_blank" rel="noopener noreferrer"><LucideFile className="h-8 w-8 text-zinc-400" strokeWidth={1.5} /></a></div>}
                </Fragment>
            ))}
        </div>
    );
    const metaChips = (compact: boolean) => {
        const cat = getCategoryStr(); const aiCat = getAiCategoryStr(); const tags = lifeEventObj.aiTags ?? []; const tagLimit = compact ? 2 : tags.length;
        return (
            <div className={`flex flex-wrap gap-0.5 ${compact ? 'mt-1' : 'my-1'}`}>
                <span className={`${chip} border-zinc-700 bg-zinc-950 text-zinc-200`}>{dateLabel}</span>
                {age && <span className={`${chip} border-zinc-700 bg-zinc-800 text-zinc-300`}>{age}</span>}
                <span className={`${chip} border-zinc-700/80 bg-zinc-900 text-zinc-400`}>{getImpactStr()}</span>
                {comments.length > 0 && <span className={`${chip} border-zinc-700 bg-zinc-900 text-zinc-300`}><LucideMessageCircle className="mr-px h-2.5 w-2.5" />{comments.length}</span>}
                <button type="button" aria-label={star ? 'Unstar' : 'Star'} onClick={() => void toggleStar()} className={`${chip} ${star ? 'border-amber-600 bg-amber-500 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-400'}`}><LucideStar className="mr-px h-2.5 w-2.5" strokeWidth={2} fill={star ? 'currentColor' : 'none'} /></button>
                {archived && <span className={`${chip} border-zinc-700 bg-zinc-800 text-amber-300`}><LucideArchive className="mr-px h-2.5 w-2.5" />archived</span>}
                {cat !== '' && <span className={`${chip} max-w-full border-zinc-700/90 bg-zinc-900 text-zinc-300 ${compact ? 'truncate' : ''}`} title={cat}>{cat}</span>}
                {aiCat !== '' && <button type="button" aria-label="Filter by AI category" onClick={() => { setAiCat(lifeEventObj.aiCategory); toast.success('Filtered by AI category'); }} className={`${chip} max-w-full border-indigo-700/80 bg-indigo-950 text-indigo-200 ${compact ? 'truncate' : ''}`} title={aiCat}>{compact ? aiCat.replace(/^AI:\s*/, '') : aiCat}</button>}
                {tags.slice(0, tagLimit).map((t, i) => <span className={`${chip} border-zinc-700/80 bg-zinc-800/90 text-zinc-300`} key={i}>{t}</span>)}
                {compact && tags.length > tagLimit && <span className={`${chip} border-zinc-700 bg-zinc-800 text-zinc-400`}>+{tags.length - tagLimit}</span>}
                {lifeEventObj.placeName && <span className={`${chip} border-emerald-800 bg-emerald-950 text-emerald-200`}><LucideMapPin className="mr-px h-2.5 w-2.5" />{lifeEventObj.placeName}</span>}
            </div>
        );
    };
    const actionIconBtn = 'inline-flex h-7 w-7 items-center justify-center rounded-md border text-zinc-400 transition-colors hover:bg-zinc-800';
    const actionTextBtn = 'inline-flex h-7 items-center gap-0.5 rounded-md border px-1.5 text-[10px] font-medium transition-colors sm:text-[11px]';
    const expandedBlocks = (<>{isExpandedDescription && <div className="mt-1 whitespace-pre-wrap rounded-md border border-zinc-700/90 bg-zinc-950/90 p-1.5 text-[10px] leading-relaxed text-zinc-200 sm:text-xs" dangerouslySetInnerHTML={{ __html: lifeEventObj.description }} />}{isExpandedAiSummary && <p className="mt-1 whitespace-pre-wrap rounded-md border border-indigo-800 bg-indigo-950/50 p-1.5 text-[10px] leading-relaxed text-zinc-200 sm:text-xs">{lifeEventObj.aiSummary}</p>}{lifeEventObj.address && <div className="mt-1 flex flex-wrap items-center gap-1 rounded-md border border-emerald-800 bg-emerald-950/30 px-1.5 py-1"><LucideMapPin className="h-3 w-3 text-emerald-400" /><span className="max-w-[180px] truncate text-[10px] text-zinc-200">{lifeEventObj.address}</span><a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(lifeEventObj.address)}`} target="_blank" rel="noreferrer" aria-label="Open address in Maps" className="rounded bg-emerald-700 px-1 py-px text-[9px] text-white">Maps</a><button type="button" aria-label="Copy address" onClick={() => onCopyAddress(lifeEventObj.address ?? '')} className="rounded border border-zinc-700 px-1 py-px text-[9px] text-zinc-300">Copy</button><a href="/user/maps" aria-label="Go to Maps app" className="rounded border border-zinc-700 px-1 py-px text-[9px] text-zinc-300">App</a></div>}{lifeEventObj.lat != null && lifeEventObj.lng != null && <div className="mt-1 overflow-hidden rounded-md border border-zinc-700"><iframe title={`mini-${lifeEventObj._id}`} aria-label="Mini map" className="h-[120px] w-full border-0" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${lifeEventObj.lng - 0.008}%2C${lifeEventObj.lat - 0.008}%2C${lifeEventObj.lng + 0.008}%2C${lifeEventObj.lat + 0.008}&layer=mapnik&marker=${lifeEventObj.lat}%2C${lifeEventObj.lng}`} /></div>}</>);
    const renderGrid = () => (
        <>
            <div className="relative h-[104px] shrink-0 overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-indigo-950/30">
                {firstImageUrl ? <button type="button" aria-label="Open image" onClick={() => setLightbox(firstImageUrl)} className="h-full w-full"><img src={firstImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform" /></button> : <div className="flex h-full items-center justify-center text-zinc-500"><LucideCalendar className="h-9 w-9" strokeWidth={1.25} /></div>}
                {extraFileCount > 0 && <span className="absolute bottom-1 right-1 rounded-md bg-zinc-900/75 px-1 py-px text-[9px] text-white">+{extraFileCount} files</span>}
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-1.5">
                <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-snug text-zinc-100">{lifeEventObj.title}</h3>
                {metaChips(true)}
                <div className="mt-auto flex items-center justify-between gap-0.5 border-t border-zinc-800 pt-1.5">
                    <div className="flex gap-0.5">
                        {lifeEventObj.description.trim().length >= 1 && <button type="button" aria-label={isExpandedDescription ? 'Hide description' : 'Show description'} className={`${actionIconBtn} ${isExpandedDescription ? 'border-indigo-700 bg-indigo-950 text-indigo-300' : 'border-zinc-700 bg-zinc-900'}`} onClick={() => setIsExpandedDescription(!isExpandedDescription)}><LucideExpand className="h-3.5 w-3.5" strokeWidth={2} /></button>}
                        {lifeEventObj.aiSummary.trim().length >= 1 && <button type="button" aria-label="Toggle AI summary" className={`${actionIconBtn} ${isExpandedAiSummary ? 'border-indigo-700 bg-indigo-950 text-indigo-200' : 'border-indigo-700/80 bg-indigo-950/80 text-indigo-300'}`} onClick={() => setIsExpandedAiSummary(!isExpandedAiSummary)}><LucideCpu className="h-3.5 w-3.5" strokeWidth={2} /></button>}
                        <button type="button" aria-label="Duplicate" onClick={() => void duplicate()} className={`${actionIconBtn} border-zinc-700 bg-zinc-900`}><LucideCopy className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button type="button" aria-label={archived ? 'Unarchive' : 'Archive'} onClick={() => void toggleArchive()} className={`${actionIconBtn} ${archived ? 'border-amber-700 bg-amber-950 text-amber-300' : 'border-zinc-700 bg-zinc-900'}`}><LucideArchive className="h-3.5 w-3.5" strokeWidth={2} /></button>
                    </div>
                    <div className="flex gap-0.5">
                        <Link to={`/user/life-events?action=edit&id=${lifeEventObj._id}`} aria-label="Edit" className={`${actionIconBtn} border-zinc-700 bg-zinc-900 hover:text-indigo-300`}><LucideEdit className="h-3.5 w-3.5" strokeWidth={2} /></Link>
                        <button type="button" aria-label="Delete" className={`${actionIconBtn} border-red-900 bg-zinc-900 text-red-400 hover:bg-red-950`} onClick={() => setConfirmOpen(true)}><LucideTrash2 className="h-3.5 w-3.5" strokeWidth={2} /></button>
                    </div>
                </div>
                {expandedBlocks}
            </div>
        </>
    );
    const renderList = () => (
        <>
            <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row sm:gap-2">
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-zinc-800 to-zinc-900 sm:h-auto sm:w-[72px] sm:self-stretch">
                    {firstImageUrl ? <button type="button" aria-label="Open image" onClick={() => setLightbox(firstImageUrl)} className="h-full w-full"><img src={firstImageUrl} alt="" className="h-full w-full object-cover sm:min-h-[4.5rem]" /></button> : <div className="flex h-full min-h-[4rem] items-center justify-center text-zinc-500 sm:min-h-0"><LucideImage className="h-7 w-7" strokeWidth={1.25} /></div>}
                    {extraFileCount > 0 && <span className="absolute bottom-0.5 right-0.5 rounded bg-zinc-900/70 px-1 text-[8px] text-white">+{extraFileCount}</span>}
                </div>
                <div className="min-w-0 flex-1">
                    {listStripFiles.length > 0 ? renderFileStrip(listStripFiles) : null}
                    <h3 className="text-xs font-semibold leading-snug text-zinc-100 sm:text-sm">{lifeEventObj.title}</h3>
                    {metaChips(false)}
                    <div className="action-buttons mt-1 flex flex-wrap gap-0.5">
                        {lifeEventObj.description.trim().length >= 1 && <button type="button" aria-label="Toggle description" className={`${actionTextBtn} ${isExpandedDescription ? 'border-indigo-700 bg-indigo-950 text-indigo-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'}`} onClick={() => setIsExpandedDescription(!isExpandedDescription)}><LucideExpand className="h-3 w-3" strokeWidth={2} />{isExpandedDescription ? 'Hide' : 'Description'}</button>}
                        {lifeEventObj.aiSummary.trim().length >= 1 && <button type="button" aria-label="Toggle AI summary" className={`${actionTextBtn} border-indigo-700 bg-indigo-950 text-indigo-200`} onClick={() => setIsExpandedAiSummary(!isExpandedAiSummary)}><LucideCpu className="h-3 w-3" strokeWidth={2} />AI summary</button>}
                        <button type="button" aria-label="Duplicate" onClick={() => void duplicate()} className={`${actionTextBtn} border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800`}><LucideCopy className="h-3 w-3" strokeWidth={2} />Duplicate</button>
                        <button type="button" aria-label={archived ? 'Unarchive' : 'Archive'} onClick={() => void toggleArchive()} className={`${actionTextBtn} ${archived ? 'border-amber-700 bg-amber-950 text-amber-200' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'}`}><LucideArchive className="h-3 w-3" strokeWidth={2} />{archived ? 'Unarchive' : 'Archive'}</button>
                        <Link to={`/user/life-events?action=edit&id=${lifeEventObj._id}`} aria-label="Edit" className={`${actionTextBtn} border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800`}><LucideEdit className="h-3 w-3" strokeWidth={2} />Edit</Link>
                        <button type="button" aria-label="Delete" className={`${actionTextBtn} border-red-900 bg-zinc-900 text-red-400 hover:bg-red-950`} onClick={() => setConfirmOpen(true)}><LucideTrash2 className="h-3 w-3" strokeWidth={2} />Delete</button>
                    </div>
                    {expandedBlocks}
                </div>
            </div>
        </>
    );
    const cardShell = layout === 'grid' ? 'group flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-sm hover:border-indigo-700/60' : 'rounded-xl border border-zinc-700/80 bg-zinc-900 p-2 shadow-sm sm:p-2.5';
    return (
        <div className={`${cardShell} ${archived ? 'opacity-75' : ''}`}>
            {isDeleted && <div className="rounded-md border border-red-900 bg-red-950 p-1.5 text-[10px] font-medium text-red-300">This item has been deleted.</div>}
            {!isDeleted && <Fragment>{layout === 'grid' ? renderGrid() : renderList()}</Fragment>}
            {confirmOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-4"><h3 className="text-sm font-semibold text-zinc-100">Delete event?</h3><p className="mt-1 text-xs text-zinc-400">This cannot be undone.</p><div className="mt-4 flex justify-end gap-2"><button type="button" aria-label="Cancel" onClick={() => setConfirmOpen(false)} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300">Cancel</button><button type="button" aria-label="Confirm delete" onClick={() => void doDelete()} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white">Delete</button></div></div></div>}
            {lightbox && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}><img src={lightbox} alt="" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" /></div>}
        </div>
    );
};
export default ComponentLifeEventItem;
