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
        console.log(date);
        console.log(date.year);
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

    const renderEditFields = () => {
        return (
            <div className="space-y-4">

                {/* field -> event date utc */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Event Date *</label>
                    <input
                        type="date"
                        value={formData.eventDateUtc?.substring(0, 10)} // Format the date for the input
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                eventDateUtc: new Date(e.target.value).toISOString().substring(0, 10)
                            })
                        }}
                    />
                    {formError.eventDateUtc.length >= 1 && <p className="text-red-500 text-sm">{formError.eventDateUtc}</p>}
                </div>

                {/* field -> is star */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Is Starred</label>
                    <input
                        type="checkbox"
                        checked={formData.isStar}
                        className="mt-1"
                        onChange={(e) => setFormData({ ...formData, isStar: e.target.checked })}
                    />
                </div>

                {/* field -> title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    {formError.title.length >= 1 && <p className="text-red-500 text-sm">{formError.title}</p>}
                </div>

                {/* field -> description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={formData.description}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={10}
                    />
                </div>

                {/* category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Category
                        <Link
                            to={'/user/life-events?action=category'}
                            className="ml-2 p-0 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 transition duration-300 inline-block text-sm"
                        >
                            <LucidePlus className="inline-block m-1"
                                size={'20px'}
                            />
                        </Link>
                    </label>
                    <ComponentLifeEventsEditCategory
                        value={formData.categoryId}
                        onChange={(e) => {
                            setFormData({ ...formData, categoryId: e.target.value })
                        }}
                    />
                </div>

                {/* sub category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sub Category</label>
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
                    <label className="block text-sm font-medium text-gray-700">Event Impact *</label>
                    <select
                        value={formData.eventImpact}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, eventImpact: e.target.value })}
                    >
                        <option value="very-low">Very Low</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="huge">Huge</option>
                    </select>
                    {formError.eventImpact.length >= 1 && <p className="text-red-500 text-sm">{formError.eventImpact}</p>}
                </div>

                {/* field -> ai tags */}
                {formData.aiTags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">AI Tags</label>
                        <div className="mt-2">
                            {formData.aiTags.map((tag, index) => (
                                <div key={index} className="inline-block bg-gray-100 rounded-sm p-1 px-2 text-sm text-gray-600 mb-2 mr-2">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* field -> ai summary */}
                {formData.aiSummary.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">AI Summary</label>
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-sm p-3 text-gray-700 text-sm whitespace-pre-line break-words">
                            {formData.aiSummary}
                        </div>
                    </div>
                )}

                {/* field -> ai category and sub category */}
                {formData.aiCategory.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">AI Category</label>
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-sm p-3 text-gray-700 text-sm whitespace-pre-line break-words">
                            {formData?.aiCategory}
                            {formData?.aiSubCategory.length > 0 && (
                                <span className='text-gray-500 px-3'>
                                    {' ->'}
                                </span>
                            )}
                            {formData?.aiSubCategory}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            {requestEdit.loading && (
                <div className="flex justify-between my-4">
                    <button
                        className="px-3 py-1 rounded-sm bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                    >
                        <LucideArrowLeft className="w-4 h-4 inline-block mr-2" />
                        Saving...
                    </button>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="flex justify-between my-4">
                    <Link
                        to={'/user/life-events'}
                        className="px-3 py-1 rounded-sm bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                    >
                        <LucideArrowLeft className="w-4 h-4 inline-block mr-2" />
                        Back
                    </Link>
                    <button
                        className="px-3 py-1 rounded-sm bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200"
                        onClick={() => {
                            editRecord();
                        }}
                        aria-label="Save"
                    >
                        <LucideSave className="w-4 h-4 inline-block mr-2" />
                        Save
                    </button>
                </div>
            )}

            {renderEditFields()}

            <CommentCommonComponent
                commentType="lifeEvent"
                recordId={lifeEventObj._id}
            />

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
            console.log(response.data);
            console.log(response.data.docs);

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
        <div className='bg-white rounded-sm p-4'>
            <h1 className="text-3xl font-bold text-gray-800 my-4">Life Events {'->'} Edit</h1>
            {loading && (
                <div className="text-center">
                    <p className="text-lg text-blue-500">Loading...</p>
                    <div className="loader"></div>
                </div>
            )}
            {!loading && list.length === 0 && (
                <div>
                    <div className="text-center">
                        <p className="text-lg text-red-500">Record does not exist.</p>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
                            onClick={() => {
                                navigate('/user/life-events');
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
            {!loading && list.length === 1 && (
                <div>
                    <ComponentLifeEventsEdit
                        lifeEventObj={list[0]}
                    />
                </div>
            )}
        </div>
    )
};

export default ComponentLifeEventsEditWrapper;