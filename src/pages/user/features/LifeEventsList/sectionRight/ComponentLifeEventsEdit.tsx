import { DateTime } from 'luxon';
import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideArrowLeft, LucidePlus, LucideSave, LucideCopy, LucideMapPin, LucideSparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ComponentLifeEventsEditCategory from './ComponentLifeEventsEditCategory/ComponentLifeEventsEditCategory.tsx';
import ComponentLifeEventsEditCategorySub from './ComponentLifeEventsEditCategory/ComponentLifeEventsEditCategorySub.tsx';
import CommentCommonComponent from '../../../../../components/commentCommonComponent/CommentCommonComponent.tsx';
import CommonComponentAiKeywords from '../../../../../components/commonComponent/commonComponentAiKeywords/CommonComponentAiKeywords.tsx';
import CommonComponentAiFaq from '../../../../../components/commonComponent/commonComponentAiFaq/CommonComponentAiFaq.tsx';
import SpeechToTextComponent from '../../../../../components/componentCommon/SpeechToTextComponent.tsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ComponentLifeEventsEdit = ({
    lifeEventObj
}: {
    lifeEventObj: tsLifeEventsItem
}) => {
    const initialHash = JSON.stringify({ t: lifeEventObj.title, d: lifeEventObj.description, c: lifeEventObj.categoryId, cs: lifeEventObj.categorySubId, imp: lifeEventObj.eventImpact, star: lifeEventObj.isStar, date: lifeEventObj.eventDateUtc.substring(0, 10), place: lifeEventObj.placeName ?? '', addr: lifeEventObj.address ?? '', lat: lifeEventObj.lat ?? null, lng: lifeEventObj.lng ?? null, arch: !!lifeEventObj.isArchived });
    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    })

    const [formData, setFormData] = useState({
        title: lifeEventObj.title,
        description: lifeEventObj.description,
        categoryId: lifeEventObj.categoryId,
        categorySubId: lifeEventObj.categorySubId,
        eventImpact: lifeEventObj.eventImpact,
        isStar: lifeEventObj.isStar,
        eventDateUtc: lifeEventObj.eventDateUtc.substring(0, 10),
        aiTags: lifeEventObj.aiTags,
        aiSummary: lifeEventObj.aiSummary,
        aiCategory: lifeEventObj.aiCategory || '',
        aiSubCategory: lifeEventObj.aiSubCategory || '',
        placeName: lifeEventObj.placeName || '',
        address: lifeEventObj.address || '',
        lat: lifeEventObj.lat ?? null,
        lng: lifeEventObj.lng ?? null,
        isArchived: !!lifeEventObj.isArchived,
    } as {
        title: string;
        description: string;
        categoryId: string;
        categorySubId: string;
        isStar: boolean;
        eventImpact: string;
        eventDateUtc: string;
        aiTags: string[];
        aiSummary: string;
        aiCategory: string;
        aiSubCategory: string;
        placeName: string;
        address: string;
        lat: number | null;
        lng: number | null;
        isArchived: boolean;
    });

    const [formError, setFormError] = useState({
        title: '',
        description: '',
        categoryId: '',
        categorySubId: '',
        eventImpact: '',
        isStar: '',
        eventDateUtc: '',
    } as {
        title: string;
        description: string;
        categoryId: string;
        categorySubId: string;
        eventImpact: string;
        isStar: string;
        eventDateUtc: string;
    });

    const validateForm = async () => {
        let isValid = true;
        const newFormError = {
            title: '',
            description: '',
            categoryId: '',
            categorySubId: '',
            eventImpact: '',
            isStar: '',
            eventDateUtc: '',
        };

        if (typeof formData.title !== 'string' || formData.title.trim() === '') {
            newFormError.title = 'Title is required.';
            isValid = false;
        }

        const date = DateTime.fromISO(formData.eventDateUtc);
        if (!date.isValid || date.year >= 9999) {
            newFormError.eventDateUtc = 'Event date is invalid.';
            isValid = false;
        }

        setFormError(newFormError);
        return isValid;
    };

    const editRecord = async () => {
        const isValid = await validateForm();
        if (!isValid) {
            toast.error('Please fix the errors in the form before submitting.');
            return;
        }

        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const dt = DateTime.fromISO(formData.eventDateUtc);
            const iso = dt.isValid ? dt.toUTC().toISO() ?? formData.eventDateUtc : formData.eventDateUtc;
            const config = {
                method: 'post',
                url: `/api/life-events/crud/lifeEventsEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    eventDateUtc: iso,
                    "_id": lifeEventObj._id,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);

            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Life event updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the life event. Please try again later.')
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the life event. Please try again later.',
            });
        }
    }

    const generateSummary = () => {
        try {
            const plain = formData.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (!plain) { toast.error('Add description first'); return; }
            const words = plain.split(' ');
            let summary = words.slice(0, 30).join(' ');
            if (words.length > 30) summary += '…';
            const meta: string[] = [];
            if (formData.placeName) meta.push(`at ${formData.placeName}`);
            if (formData.address) meta.push(`(${formData.address})`);
            if (meta.length) summary += ` ${meta.join(' ')}`;
            setFormData({ ...formData, aiSummary: summary });
            toast.success('AI summary generated');
        } catch { toast.error('Failed'); }
    };

    const copySummary = async () => {
        try { await navigator.clipboard.writeText(formData.aiSummary); toast.success('Summary copied'); } catch { toast.error('Copy failed'); }
    };

    const fieldClass =
        'mt-1 block w-full rounded-lg border border-zinc-700/90 bg-zinc-900 p-2 text-sm text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:p-2.5';

    const renderEditFields = () => {
        return (
            <div className="space-y-3 sm:space-y-4">

                <div>
                    <label className="block text-sm font-medium text-zinc-200">Event Date *</label>
                    <input
                        type="date"
                        value={formData.eventDateUtc?.substring(0, 10)}
                        className={fieldClass}
                        onChange={(e) => {
                            const d = DateTime.fromISO(e.target.value);
                            setFormData({
                                ...formData,
                                eventDateUtc: d.isValid ? d.toISODate() ?? '' : e.target.value
                            })
                        }}
                    />
                    {formError.eventDateUtc.length >= 1 && <p className="mt-1 text-sm text-red-600">{formError.eventDateUtc}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="checkbox"
                        id="life-event-starred"
                        checked={formData.isStar}
                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                        onChange={(e) => setFormData({ ...formData, isStar: e.target.checked })}
                    />
                    <label htmlFor="life-event-starred" className="text-sm font-medium text-zinc-200">
                        Starred
                    </label>
                    <span className="mx-2 text-zinc-600">|</span>
                    <input
                        type="checkbox"
                        id="life-event-archived"
                        checked={formData.isArchived}
                        className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500/25"
                        onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                    />
                    <label htmlFor="life-event-archived" className="text-sm font-medium text-zinc-200">
                        Archived
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-200">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        className={fieldClass}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    {formError.title.length >= 1 && <p className="mt-1 text-sm text-red-600">{formError.title}</p>}
                    <div className="mt-1.5 sm:mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, title: formData.title + ' ' + text })
                                }
                            }}
                            parentEntityId={lifeEventObj._id}
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <label className="block text-sm font-medium text-zinc-200">Description (rich)</label>
                        <span className="text-[10px] text-zinc-500">{formData.description.replace(/<[^>]*>/g, '').length} chars</span>
                    </div>
                    <div className="rounded-lg border border-zinc-700/90 bg-zinc-900">
                        <ReactQuill theme="snow" value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} className="[&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-zinc-100" />
                    </div>
                    <div className="mt-1.5 sm:mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, description: formData.description + ' ' + text })
                                }
                            }}
                            parentEntityId={lifeEventObj._id}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-200"><LucideMapPin className="h-4 w-4 text-emerald-400" /> Place & address</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400">Place name</label>
                            <input value={formData.placeName} onChange={(e) => setFormData({ ...formData, placeName: e.target.value })} placeholder="e.g. Taj Mahal" className={fieldClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400">Address</label>
                            <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street, city, country" className={fieldClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400">Latitude</label>
                            <input type="number" value={formData.lat ?? ''} onChange={(e) => setFormData({ ...formData, lat: e.target.value === '' ? null : parseFloat(e.target.value) })} placeholder="28.6139" className={fieldClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400">Longitude</label>
                            <input type="number" value={formData.lng ?? ''} onChange={(e) => setFormData({ ...formData, lng: e.target.value === '' ? null : parseFloat(e.target.value) })} placeholder="77.2090" className={fieldClass} />
                        </div>
                    </div>
                    {formData.address && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(formData.address)}`} target="_blank" rel="noreferrer" aria-label="Open in Maps" className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">Open in Maps</a>
                            <a href="/user/maps" aria-label="Go to Maps" className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300">Maps app</a>
                            <button type="button" aria-label="Copy address" onClick={async () => { try { await navigator.clipboard.writeText(formData.address); toast.success('Copied'); } catch { toast.error('Copy failed'); } }} className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300">Copy</button>
                        </div>
                    )}
                    {formData.lat != null && formData.lng != null && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-zinc-700">
                            <iframe title="preview map" aria-label="Mini map preview" className="h-[180px] w-full border-0" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.lng - 0.01}%2C${formData.lat - 0.01}%2C${formData.lng + 0.01}%2C${formData.lat + 0.01}&layer=mapnik&marker=${formData.lat}%2C${formData.lng}`} />
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <label className="text-sm font-medium text-zinc-200">Category</label>
                        <Link
                            to={'/user/life-events?action=category'}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm transition hover:bg-indigo-9500"
                            title="Manage categories"
                        >
                            <LucidePlus className="h-4 w-4" strokeWidth={2} />
                        </Link>
                    </div>
                    <ComponentLifeEventsEditCategory
                        value={formData.categoryId}
                        onChange={(e) => {
                            setFormData({ ...formData, categoryId: e.target.value })
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-200">Subcategory</label>
                    <ComponentLifeEventsEditCategorySub
                        value={formData.categorySubId}
                        onChange={(e) => {
                            setFormData({ ...formData, categorySubId: e.target.value })
                        }}
                        categoryId={formData.categoryId}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-200">Event Impact *</label>
                    <select
                        value={formData.eventImpact}
                        className={fieldClass}
                        onChange={(e) => setFormData({ ...formData, eventImpact: e.target.value })}
                    >
                        <option value="very-low">Very Low</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="huge">Huge</option>
                    </select>
                    {formError.eventImpact.length >= 1 && <p className="mt-1 text-sm text-red-600">{formError.eventImpact}</p>}
                </div>

                <div className="rounded-xl border border-indigo-800/60 bg-indigo-950/30 p-3">
                    <div className="mb-1 flex items-center justify-between">
                        <label className="block text-sm font-medium text-zinc-200">AI Summary</label>
                        <div className="flex gap-1">
                            <button type="button" aria-label="Generate AI summary" onClick={() => generateSummary()} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"><LucideSparkles className="h-3 w-3" />Generate</button>
                            <button type="button" aria-label="Copy summary" onClick={() => void copySummary()} className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"><LucideCopy className="h-3 w-3" />Copy</button>
                        </div>
                    </div>
                    <textarea value={formData.aiSummary} onChange={(e) => setFormData({ ...formData, aiSummary: e.target.value })} rows={3} placeholder="AI summary will appear here" className={`${fieldClass} min-h-[72px]`} />
                    <p className="mt-1 text-[10px] text-zinc-500">Generated locally from description + place; saved with the event.</p>
                </div>

                {formData.aiTags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-200">AI Tags</label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2">
                            {formData.aiTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-block rounded-lg border border-zinc-700/80 bg-zinc-950 px-2 py-0.5 text-xs font-medium text-zinc-300 sm:text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {formData.aiCategory.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-200">AI Category</label>
                        <div className="mt-1.5 rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-2.5 text-sm whitespace-pre-line break-words text-zinc-200 sm:mt-2 sm:p-3">
                            {formData?.aiCategory}
                            {formData?.aiSubCategory.length > 0 && (
                                <span className="px-2 text-zinc-500 sm:px-3">{' ->'}</span>
                            )}
                            {formData?.aiSubCategory}
                        </div>
                    </div>
                )}

                <div className="[&_.rounded-sm]:rounded-xl">
                    <CommonComponentAiKeywords
                        sourceId={lifeEventObj._id}
                        metadataSourceType="lifeEvents"
                    />
                </div>

                <div className="[&_.rounded-sm]:rounded-xl">
                    <CommonComponentAiFaq
                        sourceId={lifeEventObj._id}
                    />
                </div>
            </div>
        )
    }

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            const cur = JSON.stringify({ t: formData.title, d: formData.description, c: formData.categoryId, cs: formData.categorySubId, imp: formData.eventImpact, star: formData.isStar, date: formData.eventDateUtc, place: formData.placeName, addr: formData.address, lat: formData.lat, lng: formData.lng, arch: formData.isArchived });
            if (cur !== initialHash) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [formData, initialHash]);

    return (
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 p-2 shadow-sm sm:p-3 md:p-4">
            {requestEdit.loading && (
                <div className="mb-2 flex justify-between border-b border-zinc-800 pb-2 sm:mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-950 px-2 py-1 text-xs font-medium text-zinc-400">
                        <LucideArrowLeft className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                        Saving…
                    </span>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2 sm:mb-3">
                    <Link
                        to="/user/life-events"
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-200 shadow-sm hover:bg-zinc-800"
                    >
                        <LucideArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                        Back
                    </Link>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-600/20 bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-9500 sm:px-3 sm:py-1.5"
                        onClick={() => {
                            void editRecord();
                        }}
                        aria-label="Save"
                    >
                        <LucideSave className="h-3.5 w-3.5" strokeWidth={2} />
                        Save
                    </button>
                </div>
            )}

            {renderEditFields()}

            <div className="mt-4 border-t border-zinc-800 pt-4 sm:mt-6 sm:pt-5">
                <CommentCommonComponent
                    commentType="lifeEvent"
                    recordId={lifeEventObj._id}
                />
            </div>

        </div>
    )
}

const ComponentLifeEventsEditWrapper = ({
    recordId
}: {
    recordId: string;
}) => {
    const navigate = useNavigate();
    const [list, setList] = useState([] as tsLifeEventsItem[]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void fetchList();
    }, [
        recordId,
    ])

    const fetchList = async () => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/life-events/crud/lifeEventsGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    recordId: recordId
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            setLoading(false);
            setList(tempArr);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {loading && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900 py-10 shadow-sm">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-600" />
                    <p className="text-xs text-zinc-400">Loading…</p>
                </div>
            )}
            {!loading && list.length === 0 && (
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-900 px-4 py-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-700">Record does not exist.</p>
                    <button
                        type="button"
                        className="mt-3 inline-flex rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 shadow-sm hover:bg-zinc-800"
                        onClick={() => navigate('/user/life-events')}
                    >
                        Back to list
                    </button>
                </div>
            )}
            {!loading && list.length === 1 && <ComponentLifeEventsEdit lifeEventObj={list[0]} />}
        </div>
    );
};

export default ComponentLifeEventsEditWrapper;
