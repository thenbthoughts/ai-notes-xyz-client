import { DebounceInput } from 'react-debounce-input';
import { useNavigate } from 'react-router-dom';

import { lifeEventAddAxios } from '../utils/lifeEventsListAxios.ts';

import { jotaiStateLifeEventSearch, jotaiStateLifeEventCategory, jotaiStateLifeEventCategorySub, jotaiStateLifeEventIsStar, jotaiStateLifeEventImpact, jotaiStateLifeEventDateRange } from '../stateJotai/lifeEventStateJotai.ts';
import { useAtom, useSetAtom } from 'jotai';
import ComponentFilterCategory from './ComponentFilterCategory.tsx';
import ComponentFilterCategorySub from './ComponentFilterCategorySub.tsx';

const ComponentChatHistory = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useAtom(jotaiStateLifeEventSearch);
    const setCategory = useSetAtom(jotaiStateLifeEventCategory);
    const setSubcategory = useSetAtom(jotaiStateLifeEventCategorySub);
    const [isStar, setIsStar] = useAtom(jotaiStateLifeEventIsStar);
    const [impact, setImpact] = useAtom(jotaiStateLifeEventImpact);
    const [dateRange, setDateRange] = useAtom(jotaiStateLifeEventDateRange); // Added date range state

    // Fetch chat threads from API

    const lifeEventAddAxiosLocal = async () => {
        try {
            const result = await lifeEventAddAxios();
            if (result.success !== '') {
                navigate(`/user/life-events?action=edit&id=${result.recordId}`)
            }
        } catch (error) {
            console.error(error);
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setCategory('');
        setSubcategory('');
        setIsStar('');
        setImpact('');
        setDateRange({ startDate: null, endDate: null });
    };

    return (
        <div className="py-6 px-4">

            <h1 className="text-2xl font-bold mb-5 text-indigo-700">Life Events</h1>

            <div className="flex space-x-2 mb-4">
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                    onClick={lifeEventAddAxiosLocal}
                >+ Add</button>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                    onClick={clearFilters}
                >Clear Filters</button>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                >Ai Extract</button>
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

            {/* filter -> category */}
            <ComponentFilterCategory />

            {/* filter -> subcategory */}
            <ComponentFilterCategorySub />

            {/* filter -> date range */}
            <div className="mb-4">
                <label className="block text-sm font-medium">Date Range</label>
                <input
                    type="date"
                    className="p-2 border border-gray-300 rounded-lg block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: new Date(e.target.value) })}
                />
                <input
                    type="date"
                    className="p-2 border border-gray-300 rounded-lg block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2"
                    value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: new Date(e.target.value) })}
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

            {/* impact */}
            <div className="mb-4">
                <span className="font-medium">Event impact:</span><br />
                <div>
                    <label className="block">
                        <input
                            type="radio"
                            value="all"
                            checked={impact === ''}
                            onChange={() => setImpact('')}
                            className="mr-2"
                        />
                        All
                    </label>
                    <label className="block">
                        <input
                            type="radio"
                            value="very-low"
                            checked={impact === 'very-low'}
                            onChange={() => setImpact('very-low')}
                            className="mr-2"
                        />
                        Very Low
                    </label>
                    <label className="block">
                        <input
                            type="radio"
                            value="low"
                            checked={impact === 'low'}
                            onChange={() => setImpact('low')}
                            className="mr-2"
                        />
                        Low
                    </label>
                    <label className="block">
                        <input
                            type="radio"
                            value="medium"
                            checked={impact === 'medium'}
                            onChange={() => setImpact('medium')}
                            className="mr-2"
                        />
                        Medium
                    </label>
                    <label className="block">
                        <input
                            type="radio"
                            value="large"
                            checked={impact === 'large'}
                            onChange={() => setImpact('large')}
                            className="mr-2"
                        />
                        Large
                    </label>
                    <label className="block">
                        <input
                            type="radio"
                            value="huge"
                            checked={impact === 'huge'}
                            onChange={() => setImpact('huge')}
                            className="mr-2"
                        />
                        Huge
                    </label>
                </div>
            </div>

        </div>
    );
};

const ComponentChatHistoryRender = () => {
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
                    <ComponentChatHistory />
                </div>
            </div>
        </div>
    );
};

const ComponentChatHistoryModelRender = () => {
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
                        <ComponentChatHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

export {
    ComponentChatHistoryRender,
    ComponentChatHistoryModelRender,
};
// export default ComponentChatHistoryModelRender;