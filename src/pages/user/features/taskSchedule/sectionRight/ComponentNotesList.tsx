import { useState, useEffect, Fragment, useRef } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { ITaskSchedule } from '../../../../../types/pages/tsTaskSchedule.ts';
import ComponentNotesItem from './ComponentNotesItem.tsx';
import ReactPaginate from 'react-paginate';
import { Helmet } from 'react-helmet-async';
import { LucideEye, LucidePlus, LucidePlusCircle, LucideCopy, LucideLayoutTemplate } from 'lucide-react';
import { taskScheduleAddAxios } from '../utils/taskScheduleListAxios.ts';
import { taskScheduleDuplicateAxios, taskScheduleRunNowAxios, taskScheduleTestSendAxios, taskScheduleHistoryAxios } from '../utils/taskScheduleExtrasAxios.ts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    jotaiTaskScheduleFilterIsActive,
    jotaiTaskScheduleFilterShouldSendEmail,
    jotaiTaskScheduleFilterTaskType,
    jotaiTaskScheduleListRefresh,
    jotaiTaskScheduleSearchDescription,
    jotaiTaskScheduleSearchTitle,
    jotaiTaskScheduleSort,
} from '../stateJotai/taskScheduleStateJotai.ts';

const getStoredPerPage = (): number => {
    try {
        const v = localStorage.getItem('ts_perPage');
        if (v) {
            const n = parseInt(v, 10);
            if (n === 10 || n === 20 || n === 50) {
                return n;
            }
        }
    } catch {
        return 20;
    }
    return 20;
};

const setStoredPerPage = (n: number) => {
    try {
        localStorage.setItem('ts_perPage', String(n));
    } catch {
        return;
    }
};

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
                headers: { 'Content-Type': 'application/json' },
                data: { page: 1, perPage: 100, taskType: 'generatedDailySummaryByAi' },
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
    };
    const addAiDailySummary = async () => {
        setSubmitIsAdding(true);
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: { 'Content-Type': 'application/json' },
                data: { page: 1, perPage: 100, taskType: 'generatedDailySummaryByAi' },
            } as AxiosRequestConfig;
            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data.docs)) {
                if (response.data.docs.length > 0) {
                    const doc = response.data.docs[0];
                    if (typeof doc._id === 'string') {
                        if (doc._id.length === 24) {
                            navigate(`/user/task-schedule?action=edit&id=${doc._id}`);
                            return;
                        }
                    }
                }
            }
            const result = await taskScheduleAddAxios();
            if (result.error !== '') {
                toast.error(result.error);
                return;
            }
            const configEdit = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleEdit`,
                headers: { 'Content-Type': 'application/json' },
                data: { _id: result.recordId, title: `Generated User Daily Summary (AI)`, taskType: 'generatedDailySummaryByAi', timezoneName: 'Asia/Kolkata', timezoneOffset: 330, cronExpressionArr: ['0 9 * * *'], scheduleExecutionTimeArr: [new Date().toISOString()] },
            } as AxiosRequestConfig;
            const responseEdit = await axiosCustom.request(configEdit);
            const docEdit = responseEdit.data;
            if (typeof docEdit._id === 'string') {
                if (docEdit._id.length === 24) {
                    navigate(`/user/task-schedule?action=edit&id=${docEdit._id}`);
                    return;
                }
            }
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } finally {
            setSubmitIsAdding(false);
        }
    };
    const shortcutClass = 'inline-flex items-center gap-1 rounded-sm border border-indigo-700 bg-indigo-950 px-2 py-1 text-[11px] font-medium text-indigo-200 shadow-sm hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60';
    return (
        <Fragment>
            {submitIsAdding ? (
                <span className={`${shortcutClass} cursor-wait`}>
                    {showTextEditOrView ? (<LucideEye className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />) : (<LucidePlusCircle className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />)}
                    Creating…
                </span>
            ) : (
                <button type="button" aria-label="AI daily summary" className={shortcutClass} onClick={() => void addAiDailySummary()}>
                    {showTextEditOrView ? (<LucideEye className="h-3.5 w-3.5" strokeWidth={2} />) : (<LucidePlusCircle className="h-3.5 w-3.5" strokeWidth={2} />)}
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
                headers: { 'Content-Type': 'application/json' },
                data: { page: 1, perPage: 100, taskType: 'suggestDailyTasksByAi' },
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
    };
    const addAiDailyTask = async () => {
        setSubmitIsAdding(true);
        try {
            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleGet`,
                headers: { 'Content-Type': 'application/json' },
                data: { page: 1, perPage: 100, taskType: 'suggestDailyTasksByAi' },
            } as AxiosRequestConfig;
            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data.docs)) {
                if (response.data.docs.length > 0) {
                    const doc = response.data.docs[0];
                    if (typeof doc._id === 'string') {
                        if (doc._id.length === 24) {
                            navigate(`/user/task-schedule?action=edit&id=${doc._id}`);
                            return;
                        }
                    }
                }
            }
            const result = await taskScheduleAddAxios();
            if (result.error !== '') {
                toast.error(result.error);
                return;
            }
            const configEdit = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleEdit`,
                headers: { 'Content-Type': 'application/json' },
                data: { _id: result.recordId, title: `Suggest User Daily Task (AI)`, taskType: 'suggestDailyTasksByAi', timezoneName: 'Asia/Kolkata', timezoneOffset: 330, cronExpressionArr: ['0 9 * * *'], scheduleExecutionTimeArr: [new Date().toISOString()] },
            } as AxiosRequestConfig;
            const responseEdit = await axiosCustom.request(configEdit);
            const docEdit = responseEdit.data;
            if (typeof docEdit._id === 'string') {
                if (docEdit._id.length === 24) {
                    navigate(`/user/task-schedule?action=edit&id=${docEdit._id}`);
                    return;
                }
            }
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the task schedule. Please try again.');
        } finally {
            setSubmitIsAdding(false);
        }
    };
    const shortcutClass = 'inline-flex items-center gap-1 rounded-sm border border-violet-700 bg-violet-950 px-2 py-1 text-[11px] font-medium text-violet-200 shadow-sm hover:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-60';
    return (
        <Fragment>
            {submitIsAdding ? (
                <span className={`${shortcutClass} cursor-wait`}>
                    {showTextEditOrView ? (<LucideEye className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />) : (<LucidePlusCircle className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />)}
                    Creating…
                </span>
            ) : (
                <button type="button" aria-label="Suggest daily tasks" className={shortcutClass} onClick={() => void addAiDailyTask()}>
                    {showTextEditOrView ? (<LucideEye className="h-3.5 w-3.5" strokeWidth={2} />) : (<LucidePlusCircle className="h-3.5 w-3.5" strokeWidth={2} />)}
                    Suggest daily tasks
                </button>
            )}
        </Fragment>
    );
};

const TemplateGallery = ({ onCreated }: { onCreated: () => void }) => {
    const navigate = useNavigate();
    const [loadingKey, setLoadingKey] = useState('');
    const createTemplate = async (key: string) => {
        setLoadingKey(key);
        try {
            const result = await taskScheduleAddAxios();
            if (result.error !== '') {
                toast.error(result.error);
                return;
            }
            let payload: Record<string, unknown> = { _id: result.recordId };
            if (key === 'dailySummary') {
                payload = { ...payload, title: 'Daily Summary 9am', taskType: 'generatedDailySummaryByAi', timezoneName: 'Asia/Kolkata', timezoneOffset: 330, cronExpressionArr: ['0 9 * * *'] };
            } else if (key === 'dailyTask') {
                payload = { ...payload, title: 'Daily Task Suggestion 9am', taskType: 'suggestDailyTasksByAi', timezoneName: 'Asia/Kolkata', timezoneOffset: 330, cronExpressionArr: ['0 9 * * *'] };
            } else if (key === 'emailDaily') {
                payload = { ...payload, title: 'Email Reminder 8am', taskType: 'sendMyselfEmail', timezoneName: 'Asia/Kolkata', timezoneOffset: 330, cronExpressionArr: ['0 8 * * *'] };
            }
            const configEdit = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleEdit`,
                headers: { 'Content-Type': 'application/json' },
                data: payload,
            } as AxiosRequestConfig;
            const res = await axiosCustom.request(configEdit);
            if (res.data && typeof res.data._id === 'string') {
                toast.success('Template created');
                onCreated();
                navigate(`/user/task-schedule?action=edit&id=${res.data._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Template failed');
        } finally {
            setLoadingKey('');
        }
    };
    const btn = 'inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-700';
    return (
        <div className="mb-2 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-2">
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-200"><LucideLayoutTemplate className="h-3.5 w-3.5" />Template gallery</div>
            <div className="flex flex-wrap gap-1.5">
                <button type="button" aria-label="Create daily summary template" className={btn} onClick={() => void createTemplate('dailySummary')} disabled={loadingKey !== ''}>{loadingKey === 'dailySummary' ? 'Creating…' : 'Daily summary 9am'}</button>
                <button type="button" aria-label="Create daily task template" className={btn} onClick={() => void createTemplate('dailyTask')} disabled={loadingKey !== ''}>{loadingKey === 'dailyTask' ? 'Creating…' : 'Daily tasks 9am'}</button>
                <button type="button" aria-label="Create email daily template" className={btn} onClick={() => void createTemplate('emailDaily')} disabled={loadingKey !== ''}>{loadingKey === 'emailDaily' ? 'Creating…' : 'Email 8am'}</button>
            </div>
        </div>
    );
};

const getLogStatusClass = (status: string): string => {
    if (status === 'success') {
        return 'bg-emerald-950 text-emerald-200 border border-emerald-700';
    }
    if (status === 'failed') {
        return 'bg-red-950 text-red-200 border border-red-700';
    }
    return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
};

const HistoryModal = ({ id, onClose }: { id: string; onClose: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ executedTimeArr: string[]; totalExecuted: number; executedTimes: number; pendingLogs: Array<{ _id: string; taskType: string; taskStatus: string; createdAtUtc: string; taskOutputStr: string }> } | null>(null);
    const [page, setPage] = useState(1);
    const perPageHist = 10;
    useEffect(() => {
        let cancelled = false;
        const fetchHist = async () => {
            try {
                setLoading(true);
                const res = await taskScheduleHistoryAxios(id, page, perPageHist);
                if (!cancelled) {
                    setData(res);
                }
            } catch (error) {
                console.error(error);
                toast.error('History failed');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        void fetchHist();
        return () => { cancelled = true; };
    }, [id, page]);
    const copyRow = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied');
        } catch {
            toast.error('Copy failed');
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => onClose()}>
            <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">Execution history</h3>
                    <button type="button" aria-label="Close history" className="rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700" onClick={() => onClose()}>Close</button>
                </div>
                {loading && (<div className="space-y-2">{[0, 1, 2].map((k) => (<div key={k} className="h-8 animate-pulse rounded-sm bg-zinc-800" />))}</div>)}
                {!loading && data && (
                    <Fragment>
                        <div className="mb-3 rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs text-zinc-300">Total executed: <span className="font-semibold text-zinc-100">{data.executedTimes}</span> • Showing {data.executedTimeArr.length} of {data.totalExecuted}</div>
                        <div className="mb-3 overflow-x-auto rounded-sm border border-zinc-700">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-800 text-[11px] uppercase text-zinc-400">
                                    <tr><th className="px-2 py-1">#</th><th className="px-2 py-1">Executed at</th><th className="px-2 py-1">Copy</th></tr>
                                </thead>
                                <tbody>
                                    {data.executedTimeArr.length === 0 && (<tr><td colSpan={3} className="px-2 py-3 text-center text-zinc-500">No executions yet</td></tr>)}
                                    {data.executedTimeArr.map((iso, idx) => (
                                        <tr key={iso + idx} className="border-t border-zinc-800 text-zinc-200">
                                            <td className="px-2 py-1">{(page - 1) * perPageHist + idx + 1}</td>
                                            <td className="px-2 py-1">{new Date(iso).toLocaleString()}</td>
                                            <td className="px-2 py-1"><button type="button" aria-label="Copy executed time" className="rounded-sm border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[11px] hover:bg-zinc-700" onClick={() => void copyRow(iso)}><LucideCopy className="h-3 w-3 inline" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mb-3 flex items-center justify-between">
                            <button type="button" aria-label="Previous history page" disabled={page <= 1} className="rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                            <span className="text-xs text-zinc-400">Page {page}</span>
                            <button type="button" aria-label="Next history page" disabled={data.executedTimeArr.length < perPageHist} className="rounded-sm border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 disabled:opacity-50" onClick={() => setPage((p) => p + 1)}>Next</button>
                        </div>
                        <div className="rounded-sm border border-zinc-700 bg-zinc-950 p-2">
                            <div className="mb-1 text-xs font-medium text-zinc-200">Pending task log (last 20)</div>
                            <div className="max-h-40 overflow-y-auto">
                                {data.pendingLogs.length === 0 && (<div className="text-xs text-zinc-500">No pending logs</div>)}
                                {data.pendingLogs.map((log) => (
                                    <div key={log._id} className="flex items-center justify-between border-t border-zinc-800 py-1 text-[11px]">
                                        <span className="text-zinc-300">{log.taskType}</span>
                                        <span className={`rounded-sm px-1.5 py-0.5 text-[10px] ${getLogStatusClass(log.taskStatus)}`}>{log.taskStatus}</span>
                                        <span className="text-zinc-500">{log.createdAtUtc ? new Date(log.createdAtUtc).toLocaleString() : '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
};

const ComponentNotesList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as ITaskSchedule[]);
    const [page, setPage] = useState(1);
    const [perPageState, setPerPageState] = useState<number>(() => getStoredPerPage());
    const [historyId, setHistoryId] = useState('');
    const [loading, setLoading] = useState(false);
    const [sort, setSort] = useAtom(jotaiTaskScheduleSort);
    const taskType = useAtomValue(jotaiTaskScheduleFilterTaskType);
    const isActive = useAtomValue(jotaiTaskScheduleFilterIsActive);
    const shouldSendEmail = useAtomValue(jotaiTaskScheduleFilterShouldSendEmail);
    const searchTitle = useAtomValue(jotaiTaskScheduleSearchTitle);
    const searchDescription = useAtomValue(jotaiTaskScheduleSearchDescription);
    const listRefresh = useAtomValue(jotaiTaskScheduleListRefresh);
    const setTaskScheduleListRefresh = useSetAtom(jotaiTaskScheduleListRefresh);
    const filterKey = JSON.stringify({ taskType, isActive, shouldSendEmail, searchTitle, searchDescription });
    const prevFilterKeyRef = useRef(filterKey);
    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        const filterChanged = prevFilterKeyRef.current !== filterKey;
        prevFilterKeyRef.current = filterKey;
        const pageToRequest = filterChanged ? 1 : page;
        if (filterChanged && page !== 1) {
            setPage(1);
        }
        const data: Record<string, unknown> = { page: pageToRequest, perPage: perPageState };
        if (taskType.trim() !== '') { data.taskType = taskType; }
        if (isActive !== '') { data.isActive = isActive; }
        if (shouldSendEmail !== '') { data.shouldSendEmail = shouldSendEmail; }
        const titleTrim = searchTitle.trim();
        if (titleTrim !== '') { data.title = titleTrim; }
        const descTrim = searchDescription.trim();
        if (descTrim !== '') { data.description = descTrim; }
        const fetchList = async () => {
            try {
                setLoading(true);
                const config = { method: 'post', url: `/api/task-schedule/crud/taskScheduleGet`, headers: { 'Content-Type': 'application/json' }, data, cancelToken: axiosCancelTokenSource.token } as AxiosRequestConfig;
                const response = await axiosCustom.request(config);
                let tempArr = [];
                if (Array.isArray(response.data.docs)) { tempArr = response.data.docs; }
                if (sort === 'nextRunAsc') {
                    tempArr = [...tempArr].sort((a: ITaskSchedule, b: ITaskSchedule) => {
                        const ta = a.scheduleExecutionTimeArr && a.scheduleExecutionTimeArr[0] ? new Date(a.scheduleExecutionTimeArr[0]).getTime() : Number.MAX_SAFE_INTEGER;
                        const tb = b.scheduleExecutionTimeArr && b.scheduleExecutionTimeArr[0] ? new Date(b.scheduleExecutionTimeArr[0]).getTime() : Number.MAX_SAFE_INTEGER;
                        return ta - tb;
                    });
                } else if (sort === 'createdDesc') {
                    tempArr = [...tempArr].sort((a: ITaskSchedule, b: ITaskSchedule) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
                }
                setList(tempArr);
                let tempTotalCount = 0;
                if (typeof response.data.count === 'number') { tempTotalCount = response.data.count; }
                setTotalCount(tempTotalCount);
            } catch (error) {
                if (!axios.isCancel(error)) { console.error(error); }
            } finally {
                setLoading(false);
            }
        };
        fetchList();
        return () => { axiosCancelTokenSource.cancel('Operation canceled by the user.'); };
    }, [page, filterKey, listRefresh, perPageState, sort]);
    const taskScheduleAddAxiosLocal = async () => {
        try {
            const result = await taskScheduleAddAxios();
            if (result.success !== '') {
                setTaskScheduleListRefresh((n: number) => n + 1);
                navigate(`/user/task-schedule?action=edit&id=${result.recordId}`);
            }
        } catch (error) { console.error(error); }
    };
    const handleDuplicate = async (id: string) => {
        try {
            const res = await taskScheduleDuplicateAxios(id);
            if (res && res._id) {
                toast.success('Duplicated');
                setTaskScheduleListRefresh((n: number) => n + 1);
                navigate(`/user/task-schedule?action=edit&id=${res._id}`);
            } else {
                toast.success('Duplicated');
                setTaskScheduleListRefresh((n: number) => n + 1);
            }
        } catch (error) { console.error(error); toast.error('Duplicate failed'); }
    };
    const handleToggle = async (obj: ITaskSchedule) => {
        try {
            const config = { method: 'post', url: `/api/task-schedule/crud/taskScheduleEdit`, headers: { 'Content-Type': 'application/json' }, data: { _id: obj._id, isActive: !obj.isActive } } as AxiosRequestConfig;
            await axiosCustom.request(config);
            toast.success(obj.isActive ? 'Deactivated' : 'Activated');
            setTaskScheduleListRefresh((n: number) => n + 1);
        } catch (error) { console.error(error); toast.error('Toggle failed'); }
    };
    const handleRunNow = async (id: string) => {
        try {
            await taskScheduleRunNowAxios(id);
            toast.success('Run triggered');
            setTaskScheduleListRefresh((n: number) => n + 1);
        } catch (error) { console.error(error); toast.error('Run failed'); }
    };
    const handleTestSend = async (id: string) => {
        try {
            const res = await taskScheduleTestSendAxios(id);
            toast.success(res.message || 'Test queued');
        } catch (error) { console.error(error); toast.error('Test failed'); }
    };
    const goToTop = () => { document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' }); };
    const renderCount = () => {
        return (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1.5 shadow-sm">
                <button type="button" aria-label="Add schedule" onClick={() => void taskScheduleAddAxiosLocal()} className="inline-flex items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"><LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />Add</button>
                <span className="text-xs text-zinc-400"><span className="font-semibold text-zinc-100">{totalCount}</span> jobs</span>
                {totalCount === 0 && (<span className="text-xs font-medium text-amber-700">No results</span>)}
                <ComponentScheduleButtonDailySummary />
                <ComponentScheduleButtonDailyTask />
                <select aria-label="Per page" value={perPageState} onChange={(e) => { const n = parseInt(e.target.value, 10); setPerPageState(n); setStoredPerPage(n); setPage(1); }} className="rounded-sm border border-zinc-700 bg-zinc-800 px-1 py-1 text-xs text-zinc-200"><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option></select>
                <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-sm border border-zinc-700 bg-zinc-800 px-1 py-1 text-xs text-zinc-200"><option value="nextRunAsc">Next run ↑</option><option value="createdDesc">Newest</option></select>
            </div>
        );
    };
    return (
        <div>
            <Helmet><title>Schedule - AI Notes</title></Helmet>
            <div id="messagesScrollUp" />
            {renderCount()}
            <TemplateGallery onCreated={() => setTaskScheduleListRefresh((n: number) => n + 1)} />
            {loading && (<div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">{[0, 1, 2, 3].map((k) => (<div key={k} className="h-28 animate-pulse rounded-sm border border-zinc-700 bg-zinc-800" />))}</div>)}
            {!loading && list.length === 0 && (<div className="rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-8 text-center"><p className="text-sm font-medium text-zinc-200">No schedules found</p><p className="mt-1 text-xs text-zinc-500">Create one from template gallery or click Add</p><button type="button" aria-label="Create schedule" className="mt-3 inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700" onClick={() => void taskScheduleAddAxiosLocal()}><LucidePlus className="h-3.5 w-3.5" />Create schedule</button></div>)}
            {!loading && list.length > 0 && (
                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
                    {list.map((taskScheduleObj) => (
                        <div key={taskScheduleObj._id}><ComponentNotesItem taskScheduleObj={taskScheduleObj} onDuplicate={handleDuplicate} onToggleActive={handleToggle} onRunNow={handleRunNow} onHistory={(id) => setHistoryId(id)} onTestSend={handleTestSend} /></div>
                    ))}
                </div>
            )}
            {totalCount >= 1 && (
                <div className="mt-3 flex w-full items-center justify-center">
                    <ReactPaginate breakLabel="…" nextLabel="›" onPageChange={(e) => { setPage(e.selected + 1); goToTop(); }} marginPagesDisplayed={1} pageRangeDisplayed={2} pageCount={Math.max(1, Math.ceil(totalCount / perPageState))} previousLabel="‹" renderOnZeroPageCount={null} forcePage={page - 1} containerClassName="flex flex-wrap items-center justify-center gap-1" pageLinkClassName="min-w-[1.75rem] rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-center text-[11px] text-zinc-700 hover:bg-zinc-800" previousLinkClassName="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-800" nextLinkClassName="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-800" breakLinkClassName="px-1 text-[11px] text-zinc-400" activeLinkClassName="border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600" />
                </div>
            )}
            {historyId && (<HistoryModal id={historyId} onClose={() => setHistoryId('')} />)}
            <div id="messagesScrollDown" />
        </div>
    );
};

export default ComponentNotesList;
