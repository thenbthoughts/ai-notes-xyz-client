import { DebounceInput } from 'react-debounce-input';
import { useNavigate } from 'react-router-dom';

import { notesAddAxios } from '../utils/notesListAxios.ts';

import { jotaiStateNotesSearch, jotaiStateNotesIsStar, jotaiStateNotesWorkspaceId } from '../stateJotai/notesStateJotai.ts';
import { useAtom, useAtomValue } from 'jotai';

import ComponentFolderAndFileList from './ComponentFolderAndFileList.tsx';
import ComponentNotesWorkspace from './ComponentNotesWorkspace.tsx';

const ComponentNotesLeft = () => {
    const navigate = useNavigate();
    const workspaceId = useAtomValue(jotaiStateNotesWorkspaceId);
    const [searchTerm, setSearchTerm] = useAtom(jotaiStateNotesSearch);
    const [isStar, setIsStar] = useAtom(jotaiStateNotesIsStar);

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

    const clearFilters = () => {
        setSearchTerm('');
        setIsStar('');
    };

    return (
        <div className="py-6 px-2">

            <h1 className="text-2xl font-bold mb-5 text-indigo-700">Notes</h1>

            <div className="flex space-x-2 mb-4">
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                    onClick={notesAddAxiosLocal}
                >+ Add</button>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                    onClick={clearFilters}
                >Clear Filters</button>
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