import { jotaiStateNotesIsStar } from '../stateJotai/notesStateJotai.ts';
import { useAtom } from 'jotai';

const ComponentNotesLeft = () => {
    const [isStar, setIsStar] = useAtom(jotaiStateNotesIsStar);

    return (
        <div className="py-6 px-2">

            <h1 className="text-2xl font-bold mb-5 text-indigo-700">Schedule</h1>

            {/* Chat Options Title */}
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Filters</h2>

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
        // Main container with light background, padding, rounded-sm corners and max width for presentation
        <div
            style={{
                paddingTop: '10px',
                paddingBottom: '10px',
            }}
        >
            <div
                className="bg-white rounded-sm shadow-md"
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
        // Main container with light background, padding, rounded-sm corners and max width for presentation
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