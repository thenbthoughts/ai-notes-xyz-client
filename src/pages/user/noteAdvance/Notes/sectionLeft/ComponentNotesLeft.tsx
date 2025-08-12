import { DebounceInput } from 'react-debounce-input';
import { useNavigate } from 'react-router-dom';

import { notesAddAxios } from '../utils/notesListAxios.ts';

import { jotaiStateNotesSearch, jotaiStateNotesIsStar, jotaiStateNotesWorkspaceId } from '../stateJotai/notesStateJotai.ts';
import { useAtom } from 'jotai';

import ComponentFolderAndFileList from './ComponentFolderAndFileList.tsx';
import ComponentNotesWorkspace from './ComponentNotesWorkspace.tsx';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { AxiosRequestConfig } from 'axios';
import { LucideList, LucidePlus, LucideRefreshCcw } from 'lucide-react';

const ComponentNotesLeft = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useAtom(jotaiStateNotesSearch);
    const [isStar, setIsStar] = useAtom(jotaiStateNotesIsStar);
    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateNotesWorkspaceId);
    // Fetch chat threads from API

    const notesAddAxiosLocal = async () => {
        try {
            const result = await notesAddAxios({
                notesWorkspaceId: workspaceId,
            });
            if (result.success !== '') {
                navigate(`/user/notes?action=edit&id=${result.recordId}`)
            }
        } catch (error) {
            console.error(error);
        }
    }

    const openRandomNote = async () => {
        try {
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    openRandomNotes: 'true',
                },
            } as AxiosRequestConfig;
    
            const response = await axiosCustom.request(config);

            if(response.data.docs.length === 0) {
                return {
                    success: '',
                    error: 'No notes found. Please add a note first.',
                    recordId: '',
                };
            }

            const doc = response.data.docs[0];
            
            if (typeof doc._id === 'string') {
                if (doc._id.length === 24) {
                    // redirect to edit page
                    navigate(`/user/notes?action=edit&id=${doc._id}`)

                    // set workspace id
                    setWorkspaceId(doc.notesWorkspaceId);
                }
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while adding the notes. Please try again.');
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setIsStar('');
    };

    return (
        <div className="py-6 px-2">

            <h1 className="text-2xl font-bold mb-5 text-indigo-700">Notes</h1>

            {/* buttons -> add, random, clear */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
                    onClick={notesAddAxiosLocal}
                >
                    <LucidePlus size={14} />
                    Add
                </button>
                <button
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
                    onClick={openRandomNote}
                >
                    <LucideRefreshCcw size={14} />
                    Random
                </button>
                <button
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
                    onClick={clearFilters}
                >
                    <LucideList size={14} />
                    Clear
                </button>
            </div>

            {/* Workspace */}
            <ComponentNotesWorkspace />

            {/* Notes */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-4 text-indigo-600">Notes:</h2>
                <ComponentFolderAndFileList />
            </div>

            {/* Chat Options Title */}
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Filters</h2>

            {/* filter */}
            <div className="mb-4">
                <label className="block text-sm font-medium">Search:</label>
                <DebounceInput
                    debounceTimeout={500}
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
            </div>

            <div className="mb-4">
                <span className="mr-2 text-lg font-semibold">Is Started</span>
                <div>
                    <label className="items-center mr-4">
                        <input
                            type="radio"
                            value="true"
                            checked={isStar === ''}
                            onChange={() => setIsStar('')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">All</span>
                    </label>
                </div>
                <div>
                    <label className="items-center mr-4">
                        <input
                            type="radio"
                            value="true"
                            checked={isStar === 'true'}
                            onChange={() => setIsStar('true')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">Yes</span>
                    </label>
                </div>
                <div>
                    <label className="items-center">
                        <input
                            type="radio"
                            value="false"
                            checked={isStar === 'false'}
                            onChange={() => setIsStar('false')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">No</span>
                    </label>
                </div>
            </div>

        </div>
    );
};

const ComponentNotesLeftRender = () => {
    return (
        // Main container with light background, padding, rounded corners and max width for presentation
        <div
            style={{
                paddingTop: '10px',
                paddingBottom: '10px',
            }}
        >
            <div
                className="bg-white rounded-lg shadow-md"
                style={{
                    paddingTop: '10px',
                    paddingBottom: '10px',
                }}
            >
                <div
                    style={{
                        height: 'calc(100vh - 100px)',
                        overflowY: 'auto',
                    }}
                    className="pt-3 pb-5"
                >
                    <ComponentNotesLeft />
                </div>
            </div>
        </div>
    );
};

const ComponentNotesLeftModelRender = () => {
    return (
        // Main container with light background, padding, rounded corners and max width for presentation
        <div
            style={{
                position: 'fixed',
                left: 0,
                top: '60px',
                width: '300px',
                maxWidth: 'calc(100% - 50px)',
                zIndex: 1001,
            }}
        >
            <div>
                <div
                    className="bg-gray-100 shadow-md"
                    style={{
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    }}
                >
                    <div
                        style={{
                            height: 'calc(100vh - 60px)',
                            overflowY: 'auto',
                        }}
                        className="pt-3 pb-5"
                    >
                        <ComponentNotesLeft />
                    </div>
                </div>
            </div>
        </div>
    );
};

export {
    ComponentNotesLeftRender,
    ComponentNotesLeftModelRender,
};
// export default ComponentChatHistoryModelRender;