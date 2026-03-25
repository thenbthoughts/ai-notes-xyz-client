import { useAtom } from 'jotai';

import {
    jotaiTaskScheduleFilterIsActive,
    jotaiTaskScheduleFilterShouldSendEmail,
    jotaiTaskScheduleFilterTaskType,
    jotaiTaskScheduleSearchDescription,
    jotaiTaskScheduleSearchTitle,
    TaskScheduleTaskTypeFilter,
} from '../stateJotai/taskScheduleStateJotai.ts';

const TASK_TYPE_OPTIONS: { value: TaskScheduleTaskTypeFilter; label: string }[] = [
    { value: '', label: 'All types' },
    { value: 'taskAdd', label: 'Task add' },
    { value: 'notesAdd', label: 'Notes add' },
    { value: 'customRestApiCall', label: 'Custom REST API' },
    { value: 'generatedDailySummaryByAi', label: 'AI daily summary' },
    { value: 'suggestDailyTasksByAi', label: 'Suggest daily tasks (AI)' },
    { value: 'sendMyselfEmail', label: 'Send myself email' },
];

const ComponentNotesLeft = () => {
    const [taskType, setTaskType] = useAtom(jotaiTaskScheduleFilterTaskType);
    const [isActive, setIsActive] = useAtom(jotaiTaskScheduleFilterIsActive);
    const [shouldSendEmail, setShouldSendEmail] = useAtom(jotaiTaskScheduleFilterShouldSendEmail);
    const [searchTitle, setSearchTitle] = useAtom(jotaiTaskScheduleSearchTitle);
    const [searchDescription, setSearchDescription] = useAtom(jotaiTaskScheduleSearchDescription);

    return (
        <div className="py-6 px-2">

            <h1 className="text-2xl font-bold mb-5 text-indigo-700">Schedule</h1>

            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Filters</h2>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Task type</label>
                <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskScheduleTaskTypeFilter)}
                    className="w-full border border-gray-300 rounded-sm px-2 py-2 text-gray-800 bg-white"
                >
                    {TASK_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value || 'all'} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Status</span>
                <div>
                    <label className="items-center mr-4 inline-flex">
                        <input
                            type="radio"
                            checked={isActive === ''}
                            onChange={() => setIsActive('')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">All</span>
                    </label>
                </div>
                <div>
                    <label className="items-center mr-4 inline-flex">
                        <input
                            type="radio"
                            checked={isActive === 'active'}
                            onChange={() => setIsActive('active')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">Active</span>
                    </label>
                </div>
                <div>
                    <label className="items-center inline-flex">
                        <input
                            type="radio"
                            checked={isActive === 'inactive'}
                            onChange={() => setIsActive('inactive')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">Inactive</span>
                    </label>
                </div>
            </div>

            <div className="mb-4">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Email notification</span>
                <div>
                    <label className="items-center mr-4 inline-flex">
                        <input
                            type="radio"
                            checked={shouldSendEmail === ''}
                            onChange={() => setShouldSendEmail('')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">All</span>
                    </label>
                </div>
                <div>
                    <label className="items-center mr-4 inline-flex">
                        <input
                            type="radio"
                            checked={shouldSendEmail === 'true'}
                            onChange={() => setShouldSendEmail('true')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">Yes</span>
                    </label>
                </div>
                <div>
                    <label className="items-center inline-flex">
                        <input
                            type="radio"
                            checked={shouldSendEmail === 'false'}
                            onChange={() => setShouldSendEmail('false')}
                            className="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">No</span>
                    </label>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Search title</label>
                <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Contains…"
                    className="w-full border border-gray-300 rounded-sm px-2 py-2 text-gray-800"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Search description</label>
                <input
                    type="text"
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    placeholder="Contains…"
                    className="w-full border border-gray-300 rounded-sm px-2 py-2 text-gray-800"
                />
            </div>

        </div>
    );
};

const ComponentNotesLeftRender = () => {
    return (
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
