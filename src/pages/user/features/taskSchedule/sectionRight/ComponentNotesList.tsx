import { useState, useEffect, Fragment, useRef } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useAtomValue, useSetAtom } from 'jotai';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { ITaskSchedule } from '../../../../../types/pages/tsTaskSchedule.ts';
import ComponentNotesItem from './ComponentNotesItem.tsx';
import ReactPaginate from 'react-paginate';
import { LucideEye, LucidePlus, LucidePlusCircle } from 'lucide-react';
import { taskScheduleAddAxios } from '../utils/taskScheduleListAxios.ts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
    jotaiTaskScheduleFilterIsActive,
    jotaiTaskScheduleFilterShouldSendEmail,
    jotaiTaskScheduleFilterTaskType,
    jotaiTaskScheduleListRefresh,
    jotaiTaskScheduleSearchDescription,
    jotaiTaskScheduleSearchTitle,
} from '../stateJotai/taskScheduleStateJotai.ts';

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

    const shortcutClass =
        'inline-flex items-center gap-1 rounded-sm border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-900 shadow-sm hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60';

    return (
        <Fragment>
            {submitIsAdding ? (
                <span className={`${shortcutClass} cursor-wait`}>
                    {showTextEditOrView ? (
                        <LucideEye className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                    ) : (
                        <LucidePlusCircle className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                    )}
                    Creating…
                </span>
            ) : (
                <button type="button" className={shortcutClass} onClick={() => void addAiDailySummary()}>
                    {showTextEditOrView ? (
                        <LucideEye className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                        <LucidePlusCircle className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    AI daily summary
                </button>
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

    const shortcutClass =
        'inline-flex items-center gap-1 rounded-sm border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-900 shadow-sm hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60';

    return (
        <Fragment>
            {submitIsAdding ? (
                <span className={`${shortcutClass} cursor-wait`}>
                    {showTextEditOrView ? (
                        <LucideEye className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                    ) : (
                        <LucidePlusCircle className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                    )}
                    Creating…
                </span>
            ) : (
                <button type="button" className={shortcutClass} onClick={() => void addAiDailyTask()}>
                    {showTextEditOrView ? (
                        <LucideEye className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                        <LucidePlusCircle className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    Suggest daily tasks
                </button>
            )}
        </Fragment>
    );
};

const ComponentNotesList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as ITaskSchedule[]);
    const [page, setPage] = useState(1);

    const taskType = useAtomValue(jotaiTaskScheduleFilterTaskType);
    const isActive = useAtomValue(jotaiTaskScheduleFilterIsActive);
    const shouldSendEmail = useAtomValue(jotaiTaskScheduleFilterShouldSendEmail);
    const searchTitle = useAtomValue(jotaiTaskScheduleSearchTitle);
    const searchDescription = useAtomValue(jotaiTaskScheduleSearchDescription);
    const listRefresh = useAtomValue(jotaiTaskScheduleListRefresh);
    const setTaskScheduleListRefresh = useSetAtom(jotaiTaskScheduleListRefresh);

    const filterKey = JSON.stringify({
        taskType,
        isActive,
        shouldSendEmail,
        searchTitle,
        searchDescription,
    });
    const prevFilterKeyRef = useRef(filterKey);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        const filterChanged = prevFilterKeyRef.current !== filterKey;
        prevFilterKeyRef.current = filterKey;
        const pageToRequest = filterChanged ? 1 : page;
        if (filterChanged && page !== 1) {
            setPage(1);
        }

        const data: Record<string, unknown> = {
            page: pageToRequest,
            perPage,
        };
        if (taskType.trim() !== '') {
            data.taskType = taskType;
        }
        if (isActive !== '') {
            data.isActive = isActive;
        }
        if (shouldSendEmail !== '') {
            data.shouldSendEmail = shouldSendEmail;
        }
        const titleTrim = searchTitle.trim();
        if (titleTrim !== '') {
            data.title = titleTrim;
        }
        const descTrim = searchDescription.trim();
        if (descTrim !== '') {
            data.description = descTrim;
        }

        const fetchList = async () => {
            try {
                const config = {
                    method: 'post',
                    url: `/api/task-schedule/crud/taskScheduleGet`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data,
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
                if (!axios.isCancel(error)) {
                    console.error(error);
                }
            }
        };

        fetchList();
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [page, filterKey, listRefresh]);

    const taskScheduleAddAxiosLocal = async () => {
        try {
            const result = await taskScheduleAddAxios();
            if (result.success !== '') {
                setTaskScheduleListRefresh((n: number) => n + 1);
                navigate(`/user/task-schedule?action=edit&id=${result.recordId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const goToTop = () => {
        document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderCount = () => {
        return (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-sm border border-zinc-200 bg-white px-2 py-1.5 shadow-sm">
                <button
                    type="button"
                    onClick={() => void taskScheduleAddAxiosLocal()}
                    className="inline-flex items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                >
                    <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add
                </button>
                <span className="text-xs text-zinc-600">
                    <span className="font-semibold text-zinc-900">{totalCount}</span> jobs
                </span>
                {totalCount === 0 && (
                    <span className="text-xs font-medium text-amber-700">No results</span>
                )}
                <ComponentScheduleButtonDailySummary />
                <ComponentScheduleButtonDailyTask />
            </div>
        );
    };

    return (
        <div>
            <div id="messagesScrollUp" />
            {renderCount()}
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
                {list.map((taskScheduleObj) => (
                    <div key={taskScheduleObj._id}>
                        <ComponentNotesItem taskScheduleObj={taskScheduleObj} />
                    </div>
                ))}
            </div>
            {totalCount >= 1 && (
                <div className="mt-3 flex w-full items-center justify-center">
                    <ReactPaginate
                        breakLabel="…"
                        nextLabel="›"
                        onPageChange={(e) => {
                            setPage(e.selected + 1);
                            goToTop();
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={2}
                        pageCount={Math.max(1, Math.ceil(totalCount / perPage))}
                        previousLabel="‹"
                        renderOnZeroPageCount={null}
                        forcePage={page - 1}
                        containerClassName="flex flex-wrap items-center justify-center gap-1"
                        pageLinkClassName="min-w-[1.75rem] rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-center text-[11px] text-zinc-700 hover:bg-zinc-50"
                        previousLinkClassName="rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-50"
                        nextLinkClassName="rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-50"
                        breakLinkClassName="px-1 text-[11px] text-zinc-400"
                        activeLinkClassName="border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600"
                    />
                </div>
            )}
            <div id="messagesScrollDown" />
        </div>
    );
};

export default ComponentNotesList;