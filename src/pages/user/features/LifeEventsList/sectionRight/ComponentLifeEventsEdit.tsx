import { DateTime } from 'luxon';
import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideArrowLeft, LucidePlus, LucideSave } from 'lucide-react';
import toast from 'react-hot-toast';
import ComponentLifeEventsEditCategory from './ComponentLifeEventsEditCategory/ComponentLifeEventsEditCategory.tsx';
import ComponentLifeEventsEditCategorySub from './ComponentLifeEventsEditCategory/ComponentLifeEventsEditCategorySub.tsx';
import CommentCommonComponent from '../../../../../components/commentCommonComponent/CommentCommonComponent.tsx';
import CommonComponentAiKeywords from '../../../../../components/commonComponent/commonComponentAiKeywords/CommonComponentAiKeywords.tsx';
import CommonComponentAiFaq from '../../../../../components/commonComponent/commonComponentAiFaq/CommonComponentAiFaq.tsx';
import SpeechToTextComponent from '../../../../../components/componentCommon/SpeechToTextComponent.tsx';

const ComponentLifeEventsEdit = ({
    lifeEventObj
}: {
    lifeEventObj: tsLifeEventsItem
}) => {
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
    } as {
        // fields
        title: string;
        description: string;
        categoryId: string;
        categorySubId: string;
        isStar: boolean;
        eventImpact: string;

        // identification - pagination
        eventDateUtc: string;

        // ai tags
        aiTags: string[];
        aiSummary: string;

        // ai category and sub category
        aiCategory: string;
        aiSubCategory: string;
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
        // if return true that means valid.
        // if return false that means not valid.

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
            return; // Exit the function if the form is not valid
        }

        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const config = {
                method: 'post',
                url: `/api/life-events/crud/lifeEventsEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
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

    const fieldClass =
        'mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:p-2.5';

    const renderEditFields = () => {
        return (
            <div className="space-y-3 sm:space-y-4">

                {/* field -> event date utc */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Event Date *</label>
                    <input
                        type="date"
                        value={formData.eventDateUtc?.substring(0, 10)} // Format the date for the input
                        className={fieldClass}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                eventDateUtc: new Date(e.target.value).toISOString().substring(0, 10)
                            })
                        }}
                    />
                    {formError.eventDateUtc.length >= 1 && <p className="mt-1 text-sm text-red-600">{formError.eventDateUtc}</p>}
                </div>

                {/* field -> is star */}
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="checkbox"
                        id="life-event-starred"
                        checked={formData.isStar}
                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                        onChange={(e) => setFormData({ ...formData, isStar: e.target.checked })}
                    />
                    <label htmlFor="life-event-starred" className="text-sm font-medium text-zinc-800">
                        Starred
                    </label>
                </div>

                {/* field -> title */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Title *</label>
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

                {/* field -> description */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Description</label>
                    <textarea
                        value={formData.description}
                        className={`${fieldClass} min-h-[8rem] resize-y sm:min-h-[10rem]`}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={10}
                    />
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

                {/* category */}
                <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <label className="text-sm font-medium text-zinc-800">Category</label>
                        <Link
                            to={'/user/life-events?action=category'}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm transition hover:bg-indigo-500"
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

                {/* sub category */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Subcategory</label>
                    <ComponentLifeEventsEditCategorySub
                        value={formData.categorySubId}
                        onChange={(e) => {
                            setFormData({ ...formData, categorySubId: e.target.value })
                        }}
                        categoryId={formData.categoryId}
                    />
                </div>

                {/* impact */}
                <div>
                    <label className="block text-sm font-medium text-zinc-800">Event Impact *</label>
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

                {/* field -> ai tags */}
                {formData.aiTags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-800">AI Tags</label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2">
                            {formData.aiTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-block rounded-lg border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 sm:text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* field -> ai summary */}
                {formData.aiSummary.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-800">AI Summary</label>
                        <div className="mt-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-2.5 text-sm whitespace-pre-line break-words text-zinc-800 sm:mt-2 sm:p-3">
                            {formData.aiSummary}
                        </div>
                    </div>
                )}

                {/* field -> ai category and sub category */}
                {formData.aiCategory.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-800">AI Category</label>
                        <div className="mt-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-2.5 text-sm whitespace-pre-line break-words text-zinc-800 sm:mt-2 sm:p-3">
                            {formData?.aiCategory}
                            {formData?.aiSubCategory.length > 0 && (
                                <span className="px-2 text-zinc-500 sm:px-3">{' ->'}</span>
                            )}
                            {formData?.aiSubCategory}
                        </div>
                    </div>
                )}

                {/* field -> ai keyword */}
                <div className="[&_.rounded-sm]:rounded-xl">
                    <CommonComponentAiKeywords
                        sourceId={lifeEventObj._id}
                        metadataSourceType="lifeEvents"
                    />
                </div>

                {/* field -> ai faq */}
                <div className="[&_.rounded-sm]:rounded-xl">
                    <CommonComponentAiFaq
                        sourceId={lifeEventObj._id}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm sm:p-3 md:p-4">
            {requestEdit.loading && (
                <div className="mb-2 flex justify-between border-b border-zinc-100 pb-2 sm:mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
                        <LucideArrowLeft className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                        Saving…
                    </span>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2 sm:mb-3">
                    <Link
                        to="/user/life-events"
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-white px-2 py-1 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
                    >
                        <LucideArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                        Back
                    </Link>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-600/20 bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 sm:px-3 sm:py-1.5"
                        onClick={() => {
                            editRecord();
                        }}
                        aria-label="Save"
                    >
                        <LucideSave className="h-3.5 w-3.5" strokeWidth={2} />
                        Save
                    </button>
                </div>
            )}

            {renderEditFields()}

            <div className="mt-4 border-t border-zinc-100 pt-4 sm:mt-6 sm:pt-5">
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
        fetchList();
    }, [
        recordId,
    ])

    const fetchList = async () => {
        setLoading(true); // Set loading to true before the fetch
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
            setLoading(false); // Set loading to false after the fetch is complete
        }
    }

    return (
        <div>
            {loading && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white py-10 shadow-sm">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
                    <p className="text-xs text-zinc-600">Loading…</p>
                </div>
            )}
            {!loading && list.length === 0 && (
                <div className="rounded-xl border border-zinc-200/80 bg-white px-4 py-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-700">Record does not exist.</p>
                    <button
                        type="button"
                        className="mt-3 inline-flex rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
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