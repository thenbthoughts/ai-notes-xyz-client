import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideArrowLeft, LucidePlus, LucideSave, LucideTrash } from 'lucide-react';
import toast from 'react-hot-toast';

import { IInfoVault } from '../../../../../../types/pages/tsInfoVault.ts';
import ComponentInfoVaultCustomField from './ComponentInfoVaultCustomField.tsx';
import ComponentInfoVaultEmail from './ComponentInfoVaultEmail.tsx';
import ComponentInfoVaultPhone from './ComponentInfoVaultPhone.tsx';
import ComponentInfoVaultWebsite from './ComponentInfoVaultWebsite.tsx';
import ComponentInfoVaultSignificantDate from './ComponentInfoVaultSignificantDate.tsx';
import ComponentInfoVaultAddress from './ComponentInfoVaultAddress.tsx';
import CommentCommonComponent from '../../../../../../components/commentCommonComponent/CommentCommonComponent.tsx';
import CommonComponentAiKeywords from '../../../../../../components/commonComponent/commonComponentAiKeywords/CommonComponentAiKeywords.tsx';
import CommonComponentAiFaq from '../../../../../../components/commonComponent/commonComponentAiFaq/CommonComponentAiFaq.tsx';
import SpeechToTextComponent from '../../../../../../components/componentCommon/SpeechToTextComponent.tsx';

const ComponentInfoVaultEdit = ({
    infoVaultObj
}: {
    infoVaultObj: IInfoVault
}) => {
    const navigate = useNavigate();

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    })

    const [formData, setFormData] = useState({
        infoVaultType: infoVaultObj.infoVaultType || '',
        infoVaultSubType: infoVaultObj.infoVaultSubType || '',
        name: infoVaultObj.name,
        nickname: infoVaultObj.nickname || '',
        photoUrl: infoVaultObj.photoUrl || '',
        company: infoVaultObj.company || '',
        jobTitle: infoVaultObj.jobTitle || '',
        department: infoVaultObj.department || '',
        notes: infoVaultObj.notes,
        tags: infoVaultObj.tags,
        isFavorite: infoVaultObj.isFavorite,
        relationshipType: infoVaultObj.relationshipType || 'other',
        lastContactDate: infoVaultObj.lastContactDate ? new Date(infoVaultObj.lastContactDate).toISOString().split('T')[0] : '',
        contactFrequency: infoVaultObj.contactFrequency || 'rarely',
        aiTags: infoVaultObj.aiTags,
        aiSummary: infoVaultObj.aiSummary,
        aiSuggestions: infoVaultObj.aiSuggestions,
        tagsInput: '', // Temporary field for tag input
    } as {
        infoVaultType: string;
        infoVaultSubType: string;
        name: string;
        nickname: string;
        photoUrl: string;
        company: string;
        jobTitle: string;
        department: string;
        notes: string;
        tags: string[];
        isFavorite: boolean;
        relationshipType: string;
        lastContactDate: string;
        contactFrequency: string;
        aiTags: string[];
        aiSummary: string;
        aiSuggestions: string;
        tagsInput: string; // Temporary field for tag input
    });

    const editRecord = async () => {
        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const config = {
                method: 'post',
                url: `/api/info-vault/crud/infoVaultEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    "_id": infoVaultObj._id,
                },
            } as AxiosRequestConfig;
            await axiosCustom.request(config);
            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Info Vault updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the info vault. Please try again later.')
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the info vault. Please try again later.',
            });
        }
    }

    const deleteRecord = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                return;
            }

            const config = {
                method: 'post',
                url: `/api/info-vault/crud/infoVaultDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: infoVaultObj._id,
                },
            };

            await axiosCustom.request(config);

            toast.success('Info Vault deleted successfully!');
            navigate('/user/info-vault');
        } catch (error) {
            console.error(error);
        }
    }

    const renderEditFields = () => {
        return (
            <div className="space-y-3 text-sm">
                {/* field -> info vault type */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-zinc-700">Type *</label>
                    <div className="space-y-2">
                        {[
                            { value: "myself", label: "Myself" },
                            { value: "contact", label: "Contact" },
                            { value: "place", label: "Place" },
                            { value: "event", label: "Event" },
                            { value: "document", label: "Document" },
                            { value: "product", label: "Product" },
                            { value: "asset", label: "Asset" },
                            { value: "media", label: "Media" },
                            { value: "other", label: "Other" }
                        ].map((option) => (
                            <label key={option.value} className="px-2 font-semibold">
                                <input
                                    type="radio"
                                    name="infoVaultType"
                                    value={option.value}
                                    checked={formData.infoVaultType === option.value}
                                    onChange={(e) => setFormData({ ...formData, infoVaultType: e.target.value })}
                                    className="mr-2"
                                    required
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    {/* field -> info vault sub type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sub Type</label>
                        <input
                            type="text"
                            value={formData.infoVaultSubType || ''}
                            className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                            onChange={(e) => setFormData({ ...formData, infoVaultSubType: e.target.value })}
                            placeholder="e.g., Friend, Colleague, Restaurant, Conference, Invoice, Software, Car, Photo..."
                        />
                        <div className="mt-2">
                            <SpeechToTextComponent
                                onTranscriptionComplete={(text: string) => {
                                    if (text.trim() !== '') {
                                        setFormData({ ...formData, infoVaultSubType: formData.infoVaultSubType + ' ' + text })
                                    }
                                }}
                                parentEntityId={infoVaultObj._id}
                            />
                        </div>
                    </div>
                </div>

                {/* field -> is star */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Is Starred</label>
                    <input
                        type="checkbox"
                        checked={formData.isFavorite}
                        className="mt-1"
                        onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    />
                </div>

                {/* field -> title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <span className="text-xs text-gray-500">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, name: formData.name + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </span>
                </div>

                {/* field -> nickname */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nickname</label>
                    <input
                        type="text"
                        value={formData.nickname}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    />
                    <div className="mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, nickname: formData.nickname + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </div>
                </div>

                {/* field -> photo URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Photo URL</label>
                    <input
                        type="url"
                        value={formData.photoUrl}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                    />
                </div>

                {/* field -> company */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                        type="text"
                        value={formData.company}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                    <div className="mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, company: formData.company + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </div>
                </div>

                {/* field -> job title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                        type="text"
                        value={formData.jobTitle}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                    <div className="mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, jobTitle: formData.jobTitle + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </div>
                </div>

                {/* field -> department */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                        type="text"
                        value={formData.department}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                    <div className="mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, department: formData.department + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </div>
                </div>

                {/* field -> description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        value={formData.notes}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={10}
                    />
                    <div className="mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, notes: formData.notes + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                    <ComponentInfoVaultCustomField infoVaultId={infoVaultObj._id} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Emails</label>
                    <ComponentInfoVaultEmail infoVaultId={infoVaultObj._id} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phones</label>
                    <ComponentInfoVaultPhone infoVaultId={infoVaultObj._id} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Websites</label>
                    <ComponentInfoVaultWebsite infoVaultId={infoVaultObj._id} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Significant Dates</label>
                    <ComponentInfoVaultSignificantDate infoVaultId={infoVaultObj._id} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Addresses</label>
                    <ComponentInfoVaultAddress infoVaultId={infoVaultObj._id} />
                </div>

                {/* field -> tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-sm shadow-sm border border-yellow-200">
                                {tag}
                                <button
                                    type="button"
                                    className="ml-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-sm px-1"
                                    style={{ fontSize: '1rem', lineHeight: 1, marginLeft: 4 }}
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            tags: formData.tags.filter((_, i) => i !== idx)
                                        });
                                    }}
                                    aria-label={`Remove tag ${tag}`}
                                >
                                    X
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.tagsInput || ''}
                            className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                            onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
                            onKeyDown={e => {
                                if ((e.key === 'Enter' || e.key === ',') && formData.tagsInput && formData.tagsInput.trim() !== '') {
                                    e.preventDefault();
                                    const newTag = formData.tagsInput.trim();
                                    if (!formData.tags.includes(newTag)) {
                                        setFormData({
                                            ...formData,
                                            tags: [...formData.tags, newTag],
                                            tagsInput: ''
                                        });
                                    } else {
                                        setFormData({ ...formData, tagsInput: '' });
                                    }
                                }
                            }}
                            placeholder="Type a tag and press Enter or Comma"
                        />
                        <button
                            type="button"
                            className="mt-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            onClick={() => {
                                if (formData.tagsInput && formData.tagsInput.trim() !== '') {
                                    const newTag = formData.tagsInput.trim();
                                    if (!formData.tags.includes(newTag)) {
                                        setFormData({
                                            ...formData,
                                            tags: [...formData.tags, newTag],
                                            tagsInput: ''
                                        });
                                    } else {
                                        setFormData({ ...formData, tagsInput: '' });
                                    }
                                }
                            }}
                            aria-label="Add tag"
                        >
                            <LucidePlus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-2">
                        <SpeechToTextComponent
                            onTranscriptionComplete={(text: string) => {
                                if (text.trim() !== '') {
                                    setFormData({ ...formData, tagsInput: formData.tagsInput + ' ' + text })
                                }
                            }}
                            parentEntityId={infoVaultObj._id}
                        />
                    </div>
                </div>

                {/* field -> relationship type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship Type</label>
                    <select
                        value={formData.relationshipType}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                    >
                        <option value="myself">Myself</option>
                        <option value="personal">Personal</option>
                        <option value="professional">Professional</option>
                        <option value="family">Family</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* field -> last contact date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Contact Date</label>
                    <input
                        type="date"
                        value={formData.lastContactDate}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                    />
                </div>

                {/* field -> contact frequency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Frequency</label>
                    <select
                        value={formData.contactFrequency}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, contactFrequency: e.target.value })}
                    >
                        <option value="">Select</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="rarely">Rarely</option>
                    </select>
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

                {/* field -> ai suggestions */}
                {formData.aiSuggestions.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">AI Suggestions</label>
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-sm p-3 text-gray-700 text-sm whitespace-pre-line break-words">
                            {formData.aiSuggestions}
                        </div>
                    </div>
                )}

                {/* field -> ai keyword */}
                <CommonComponentAiKeywords
                    sourceId={infoVaultObj._id}
                    metadataSourceType="infoVault"
                />

                {/* field -> ai faq */}
                <CommonComponentAiFaq
                    sourceId={infoVaultObj._id}
                />
            </div>
        )
    }

    return (
        <div className="rounded-sm border border-zinc-200 bg-white p-3 shadow-sm md:p-4">
            {requestEdit.loading && (
                <div className="mb-3 flex justify-between border-b border-zinc-100 pb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
                        <LucideArrowLeft className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                        Saving…
                    </span>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                    <Link
                        to="/user/info-vault"
                        className="inline-flex items-center gap-1 rounded-sm border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                        <LucideArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                        Back
                    </Link>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
                            onClick={() => {
                                deleteRecord();
                            }}
                        >
                            <LucideTrash className="h-3.5 w-3.5" strokeWidth={2} />
                            Delete
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                            onClick={() => {
                                editRecord();
                            }}
                            aria-label="Save"
                        >
                            <LucideSave className="h-3.5 w-3.5" strokeWidth={2} />
                            Save
                        </button>
                    </div>
                </div>
            )}

            {renderEditFields()}

            <CommentCommonComponent
                commentType="infoVault"
                recordId={infoVaultObj._id}
            />

        </div>
    )
}

const ComponentInfoVaultEditWrapper = ({
    recordId
}: {
    recordId: string;
}) => {
    const navigate = useNavigate();
    const [list, setList] = useState([] as IInfoVault[]);
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
                url: `/api/info-vault/crud/infoVaultGet`,
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
                <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-zinc-200 bg-white py-10 shadow-sm">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />
                    <p className="text-xs text-zinc-600">Loading…</p>
                </div>
            )}
            {!loading && list.length === 0 && (
                <div className="rounded-sm border border-zinc-200 bg-white px-4 py-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-700">Record does not exist.</p>
                    <button
                        type="button"
                        className="mt-3 inline-flex rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                        onClick={() => navigate('/user/info-vault')}
                    >
                        Back to list
                    </button>
                </div>
            )}
            {!loading && list.length === 1 && (
                <ComponentInfoVaultEdit infoVaultObj={list[0]} />
            )}
        </div>
    );
};

export default ComponentInfoVaultEditWrapper;