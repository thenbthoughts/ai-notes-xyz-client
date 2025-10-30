import { useState, useEffect, Fragment } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { ITaskSchedule } from '../../../../../types/pages/tsTaskSchedule.ts';
import ComponentNotesItem from './ComponentNotesItem.tsx';
import ReactPaginate from 'react-paginate';
import { LucideEye, LucidePlusCircle, PlusCircle } from 'lucide-react';
import { taskScheduleAddAxios } from '../utils/taskScheduleListAxios.ts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const perPage = 20;

const ComponentScheduleButtonDailySummary = () => {
    const navigate = useNavigate();

    const [submitIsAdding, setSubmitIsAdding] = useState(false);
    const [showTextEditOrView, setShowTextEditOrView] = useState(false);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 100,
                    taskType: 'generatedDailySummaryByAi',
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data.docs)) {
                if (response.data.docs.length > 0) {
                    const doc = response.data.docs[0];
                    if (typeof doc._id === 'string') {
                        if (doc._id.length === 24) {
                            setShowTextEditOrView(true);
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const addAiDailySummary = async () => {
        setSubmitIsAdding(true);
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 100,

                    taskType: 'generatedDailySummaryByAi',
                },
            } as AxiosRequestConfig;

            // get the first record
            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data.docs)) {
                if (response.data.docs.length > 0) {
                    const doc = response.data.docs[0];
                    if (typeof doc._id === 'string') {
                        if (doc._id.length === 24) {
                            // redirect to the edit page
                            navigate(`/user/task-schedule?action=edit&id=${doc._id}`);
                            return;
                        }
                    }
                }
            }


            // create a new record
            const result = await taskScheduleAddAxios();
            if (result.error !== '') {
                // show error message
                toast.error(result.error);
                return;
            }

            // edit the record
            const configEdit = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: result.recordId,
                    title: `Generated User Daily Summary (AI)`,
                    taskType: 'generatedDailySummaryByAi',

                    // schedule time
                    timezoneName: 'Asia/Kolkata',
                    timezoneOffset: 330,
                    cronExpressionArr: ['0 9 * * *'],

                    // schedule execution time
                    scheduleExecutionTimeArr: [new Date().toISOString()],
                },
            } as AxiosRequestConfig;

            const responseEdit = await axiosCustom.request(configEdit);
            const docEdit = responseEdit.data;
            if (typeof docEdit._id === 'string') {
                if (docEdit._id.length === 24) {
                    // redirect to the edit page
                    navigate(`/user/task-schedule?action=edit&id=${docEdit._id}`);
                    return;
                }
            }

            // show error message
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } finally {
            setSubmitIsAdding(false);
        }
    };

    return (
        <Fragment>
            {submitIsAdding ? (
                <div
                    className="inline-block bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-blue-200 m-1 cursor-pointer"
                >
                    <div className="flex items-center">
                        {
                            showTextEditOrView ? (
                                <LucideEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            ) : (
                                <LucidePlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            )
                        }
                        <span className="text-blue-700">Creating...</span>
                    </div>
                </div>
            ) : (
                <div
                    className="inline-block bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-blue-200 m-1 cursor-pointer"
                    onClick={() => {
                        addAiDailySummary();
                    }}
                >
                    <div className="flex items-center">
                        {
                            showTextEditOrView ? (
                                <LucideEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            ) : (
                                <LucidePlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            )
                        }
                        <span className="text-blue-700">AI Daily Summary</span>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

const ComponentScheduleButtonDailyTask = () => {
    const navigate = useNavigate();

    const [submitIsAdding, setSubmitIsAdding] = useState(false);
    const [showTextEditOrView, setShowTextEditOrView] = useState(false);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 100,
                    taskType: 'suggestDailyTasksByAi',
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data.docs)) {
                if (response.data.docs.length > 0) {
                    const doc = response.data.docs[0];
                    if (typeof doc._id === 'string') {
                        if (doc._id.length === 24) {
                            setShowTextEditOrView(true);
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const addAiDailyTask = async () => {
        setSubmitIsAdding(true);
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 100,

                    taskType: 'suggestDailyTasksByAi',
                },
            } as AxiosRequestConfig;

            // get the first record
            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data.docs)) {
                if (response.data.docs.length > 0) {
                    const doc = response.data.docs[0];
                    if (typeof doc._id === 'string') {
                        if (doc._id.length === 24) {
                            // redirect to the edit page
                            navigate(`/user/task-schedule?action=edit&id=${doc._id}`);
                            return;
                        }
                    }
                }
            }


            // create a new record
            const result = await taskScheduleAddAxios();
            if (result.error !== '') {
                // show error message
                toast.error(result.error);
                return;
            }

            // edit the record
            const configEdit = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleEdit`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: result.recordId,
                    title: `Suggest User Daily Task (AI)`,
                    taskType: 'suggestDailyTasksByAi',

                    // schedule time
                    timezoneName: 'Asia/Kolkata',
                    timezoneOffset: 330,
                    cronExpressionArr: ['0 9 * * *'],

                    // schedule execution time
                    scheduleExecutionTimeArr: [new Date().toISOString()],
                },
            } as AxiosRequestConfig;

            const responseEdit = await axiosCustom.request(configEdit);
            const docEdit = responseEdit.data;
            if (typeof docEdit._id === 'string') {
                if (docEdit._id.length === 24) {
                    // redirect to the edit page
                    navigate(`/user/task-schedule?action=edit&id=${docEdit._id}`);
                    return;
                }
            }

            // show error message
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } finally {
            setSubmitIsAdding(false);
        }
    };

    return (
        <Fragment>
            {submitIsAdding ? (
                <div
                    className="inline-block bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-blue-200 m-1 cursor-pointer"
                >
                    <div className="flex items-center">
                        {
                            showTextEditOrView ? (
                                <LucideEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            ) : (
                                <LucidePlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            )
                        }
                        <span className="text-blue-700">Creating...</span>
                    </div>
                </div>
            ) : (
                <div
                    className="inline-block bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-blue-200 m-1 cursor-pointer"
                    onClick={() => {
                        addAiDailyTask();
                    }}
                >
                    <div className="flex items-center">
                        {
                            showTextEditOrView ? (
                                <LucideEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            ) : (
                                <LucidePlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            )
                        }
                        <span className="text-blue-700">Suggest Daily Tasks</span>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

const ComponentNotesList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as ITaskSchedule[]);
    const [page, setPage] = useState(1);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [page]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: page,
                    perPage: perPage,
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            setList(tempArr);

            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count;
            }
            setTotalCount(tempTotalCount);
        } catch (error) {
            console.error(error);
        }
    };

    const taskScheduleAddAxiosLocal = async () => {
        try {
            const result = await taskScheduleAddAxios();
            if (result.success !== '') {
                navigate(`/user/task-schedule?action=edit&id=${result.recordId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderCount = () => {
        return (
            <div>
                <div className="mb-4">
                    {/* button -> add schedule -> schedule */}
                    <div className="inline-block bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-blue-200 m-1">
                        <button onClick={taskScheduleAddAxiosLocal} className="flex items-center">
                            <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                            <span className="text-base sm:text-lg font-bold text-blue-700 tracking-wide">{totalCount}</span>
                            <span className="ml-2 text-gray-700 font-medium text-sm sm:text-base">Schedule</span>
                            {totalCount === 0 && (
                                <span className="ml-2 sm:ml-4 text-red-500 font-semibold text-sm sm:text-base">No result</span>
                            )}
                        </button>
                    </div>

                    {/* button -> add schedule -> ai daily diary */}
                    <ComponentScheduleButtonDailySummary />

                    {/* button -> add schedule -> ai daily task */}
                    <ComponentScheduleButtonDailyTask />
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* div scroll up */}
            <div id='messagesScrollUp' />
            {renderCount()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((taskScheduleObj) => (
                    <div key={taskScheduleObj._id}>
                        <ComponentNotesItem taskScheduleObj={taskScheduleObj} />
                    </div>
                ))}
            </div>
            {totalCount >= 1 && (
                <div className="w-full flex justify-center items-center">
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="next >"
                        onPageChange={(e) => {
                            setPage(e.selected);
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="< previous"
                        renderOnZeroPageCount={null}
                        forcePage={page}
                        containerClassName="flex flex-wrap justify-center items-center gap-1 sm:space-x-1"
                        pageClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousLinkClassName="text-gray-700 px-2 sm:px-3"
                        nextClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        nextLinkClassName="text-gray-700 px-2 sm:px-3"
                        breakClassName="border border-gray-300 rounded-sm text-base sm:text-lg m-0.5"
                        breakLinkClassName="text-gray-700 px-2 sm:px-3"
                        activeLinkClassName="bg-blue-500 text-white"
                        pageLinkClassName="text-gray-700 px-2 sm:px-3"
                    />
                </div>
            )}
            {/* div scroll down */}
            <div id='messagesScrollDown' />
        </div>
    );
};

export default ComponentNotesList;