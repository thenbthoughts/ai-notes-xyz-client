import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../../config/axiosCustom.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucideArrowLeft, LucideCopy, LucideMessageSquare, LucidePlus, LucideSave, LucideSettings, LucideTrash, LucideX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSetAtom } from 'jotai';
import htmlToMarkdown from '@wcj/html-to-markdown';

import { jotaiStateNotesWorkspaceRefresh } from '../../stateJotai/notesStateJotai.ts';
import { INotes } from '../../../../../../types/pages/tsNotes.ts';
import QuillEditorCustom1 from '../../../../../../components/quillJs/QuillEditorCustom1/QuillEditorCustom1.tsx';
import CommentCommonComponent from '../../../../../../components/commentCommonComponent/CommentCommonComponent.tsx';


const ComponentNotesEditWorkspace = ({
    workspaceId,
    setWorkspaceId,
}: {
    workspaceId: string;
    setWorkspaceId: (workspaceId: string) => void;
}) => {
    interface NotesWorkspaceItem {
        _id: string;
        title: string;
    }
    const [workspaces, setWorkspaces] = useState<NotesWorkspaceItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: NotesWorkspaceItem[]
                }>('/api/notes-workspace/crud/notesWorkspaceGet');
                setWorkspaces(result.data.docs);
            } catch (err) {
                toast.error('Failed to load workspaces');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div>
            {loading && (
                <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value=""
                    onChange={() => { }}
                >
                    <option value="000000000000000000000000">Loading...</option>
                </select>
            )}
            {!loading && (
                <div className="mb-4">
                    <label className="block text-sm font-medium pb-2">
                        Workspace
                        <Link
                            to={'/user/notes-workspace'}
                            className="ml-2 p-0 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 inline-block text-sm"
                        >
                            <LucideSettings className="inline-block m-1"
                                size={'20px'}
                            />
                        </Link>
                    </label>
                    <select
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={workspaceId}
                        onChange={(e) => {
                            // Handle workspace selection
                            setWorkspaceId(e.target.value);
                        }}
                    >
                        {workspaces.map((workspace) => (
                            <option key={workspace._id} value={workspace._id}>
                                {workspace.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

const ComponentNotesEdit = ({
    notesObj
}: {
    notesObj: INotes
}) => {
    const setWorkspaceRefresh = useSetAtom(jotaiStateNotesWorkspaceRefresh);
    const navigate = useNavigate();

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    })

    const [formData, setFormData] = useState({
        title: notesObj.title,
        description: notesObj.description,
        isStar: notesObj.isStar,
        tags: notesObj.tags,
        aiTags: notesObj.aiTags,
        aiSummary: notesObj.aiSummary,
        aiSuggestions: notesObj.aiSuggestions,
        tagsInput: '', // Temporary field for tag input
        notesWorkspaceId: notesObj.notesWorkspaceId,
    } as {
        title: string;
        description: string;
        isStar: boolean;
        tags: string[];
        aiTags: string[];
        aiSummary: string;
        aiSuggestions: string;
        tagsInput: string; // Temporary field for tag input
        notesWorkspaceId: string;
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
                url: `/api/notes/crud/notesEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    "_id": notesObj._id,
                },
            } as AxiosRequestConfig;
            await axiosCustom.request(config);
            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Note updated successfully!');
            setWorkspaceRefresh(prev => prev + 1);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the note. Please try again later.')
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the note. Please try again later.',
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
                url: `/api/notes/crud/notesDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: notesObj._id,
                },
            };

            await axiosCustom.request(config);

            setWorkspaceRefresh(prev => prev + 1);
            toast.success('Note deleted successfully!');
            navigate(`/user/notes?workspace=${notesObj.notesWorkspaceId}`);
        } catch (error) {
            console.error(error);
        }
    }

    const openAiChatWithNote = async () => {
        try {
            const resultThread = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: false,
                    isAutoAiContextSelectEnabled: false,

                    // selected model
                    aiModelProvider: 'openrouter',
                    aiModelName: 'openrouter/auto',
                }
            );

            const tempThreadId = resultThread?.data?.thread?._id;
           
            const markdownContent = await htmlToMarkdown({
                html: formData.description,
            });
            const content = `Note: ${markdownContent}`;
            await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
                threadId: tempThreadId,
                type: "text",
                content: content,
                visibility: 'public',
                tags: [],
                imagePathsArr: []
            });

            // redirect
            const redirectUrl = `/user/chat?id=${tempThreadId}`;
            navigate(redirectUrl);
        } catch (error) {
            console.error(error);
            toast.error('Error chatting with AI. Please try again.');
        }
    }

    const renderButtonAction = () => {
        return (
            <div className="flex gap-2 pt-3 pb-5">
                <button
                    type="button"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={openAiChatWithNote}
                >
                    <LucideMessageSquare className="w-4 h-4" />
                    Open AI Chat with Note
                </button>
            </div>
        )
    }

    const renderEditFields = () => {
        return (
            <div className="space-y-4">
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

                {/* field -> workspace */}
                <div>
                    <ComponentNotesEditWorkspace
                        workspaceId={formData.notesWorkspaceId}
                        setWorkspaceId={(workspaceId: string) => setFormData({ ...formData, notesWorkspaceId: workspaceId })}
                    />
                </div>

                {/* field -> title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <div className="flex items-center mt-1">
                        {formData?.title.length >= 1 && formData.title.includes("Empty Note") && (
                            <button
                                type="button"
                                className="text-sm bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 p-2 mt-1 rounded-md"
                                onClick={() => setFormData({ ...formData, title: '' })}
                                aria-label="Clear title"
                            >
                                Clear
                                <LucideX
                                    className="w-4 h-4 inline-block ml-2"
                                    style={{
                                        position: 'relative',
                                        top: '-2px',
                                    }}
                                />
                            </button>
                        )}
                        {formData?.title.length >= 1 && (
                            <button
                                type="button"
                                className="text-sm bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 p-2 mt-1 rounded-md ml-2"
                                onClick={() => {
                                    navigator.clipboard.writeText(formData.title);
                                    toast.success('Title copied to clipboard!');
                                }}
                                aria-label="Copy title"
                            >
                                Copy
                                <LucideCopy
                                    className="w-4 h-4 inline-block ml-2"
                                    style={{
                                        position: 'relative',
                                        top: '-2px',
                                    }}
                                />
                            </button>
                        )}
                    </div>

                </div>

                {/* field -> description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    {/* <textarea
                        value={formData.description}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={10}
                    /> */}
                    <QuillEditorCustom1
                        value={formData.description}
                        setValue={(value) => setFormData({ ...formData, description: value })}
                    />
                </div>

                {/* field -> comments */}
                <div>
                    <CommentCommonComponent
                        commentType="note"
                        recordId={notesObj._id}
                    />
                </div>

                {/* field -> tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow-sm border border-yellow-200">
                                {tag}
                                <button
                                    type="button"
                                    className="ml-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1"
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
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
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
                            className="mt-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
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
                </div>

                {/* field -> ai tags */}
                {formData.aiTags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">AI Tags</label>
                        <div className="mt-2">
                            {formData.aiTags.map((tag, index) => (
                                <div key={index} className="inline-block bg-gray-100 rounded-md p-1 px-2 text-sm text-gray-600 mb-2 mr-2">
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
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-700 text-sm whitespace-pre-line break-words">
                            {formData.aiSummary}
                        </div>
                    </div>
                )}

                {/* field -> ai suggestions */}
                {formData.aiSuggestions.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">AI Suggestions</label>
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-700 text-sm whitespace-pre-line break-words">
                            {formData.aiSuggestions}
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
                        className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                    >
                        <LucideArrowLeft className="w-4 h-4 inline-block mr-2" />
                        Saving...
                    </button>
                </div>
            )}
            {!requestEdit.loading && (
                <div className="flex justify-between my-4">
                    <Link
                        to={`/user/notes?workspace=${notesObj.notesWorkspaceId}`}
                        className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                    >
                        <LucideArrowLeft className="w-4 h-4 inline-block mr-2" />
                        Back
                    </Link>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
                            onClick={() => {
                                deleteRecord();
                            }}
                        >
                            <LucideTrash
                                className="w-4 h-4 inline-block mr-2"
                                style={{
                                    position: 'relative',
                                    top: '-2px',
                                }}
                            />
                            Delete
                        </button>
                        <button
                            className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200"
                            onClick={() => {
                                editRecord();
                            }}
                            aria-label="Save"
                        >
                            <LucideSave
                                className="w-4 h-4 inline-block mr-2"
                                style={{
                                    position: 'relative',
                                    top: '-2px',
                                }}
                            />
                            Save
                        </button>
                    </div>
                </div>
            )}

            {renderButtonAction()}

            {renderEditFields()}

        </div>
    )
}

const ComponentNotesEditWrapper = ({
    recordId
}: {
    recordId: string;
}) => {
    const navigate = useNavigate();
    const [list, setList] = useState([] as INotes[]);
    const [loading, setLoading] = useState(false);
    const setWorkspaceRefresh = useSetAtom(jotaiStateNotesWorkspaceRefresh);

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
                url: `/api/notes/crud/notesGet`,
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
            setWorkspaceRefresh(prev => prev + 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // Set loading to false after the fetch is complete
        }
    }

    return (
        <div className='bg-white rounded p-4'>
            <h1 className="text-3xl font-bold text-gray-800 my-4">Notes {'->'} Edit</h1>
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
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                                navigate('/user/notes');
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
            {!loading && list.length === 1 && (
                <div>
                    <ComponentNotesEdit
                        notesObj={list[0]}
                    />
                </div>
            )}
        </div>
    )
};

export default ComponentNotesEditWrapper;