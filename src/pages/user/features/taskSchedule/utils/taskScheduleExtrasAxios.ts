import { AxiosRequestConfig } from "axios";
import axiosCustom from "../../../../../config/axiosCustom";

export const taskScheduleDuplicateAxios = async (id: string) => {
    const config = {
        method: 'post',
        url: `/api/task-schedule/crud/taskScheduleDuplicate`,
        headers: { 'Content-Type': 'application/json' },
        data: { _id: id },
    } as AxiosRequestConfig;
    const res = await axiosCustom.request(config);
    return res.data;
};

export const taskScheduleRunNowAxios = async (id: string) => {
    const config = {
        method: 'post',
        url: `/api/task-schedule/crud/taskScheduleRunNow`,
        headers: { 'Content-Type': 'application/json' },
        data: { _id: id },
    } as AxiosRequestConfig;
    const res = await axiosCustom.request(config);
    return res.data;
};

export const taskScheduleTestSendAxios = async (id: string) => {
    const config = {
        method: 'post',
        url: `/api/task-schedule/crud/taskScheduleTestSend`,
        headers: { 'Content-Type': 'application/json' },
        data: { _id: id },
    } as AxiosRequestConfig;
    const res = await axiosCustom.request(config);
    return res.data;
};

export const taskScheduleHistoryAxios = async (id: string, page: number, perPage: number) => {
    const config = {
        method: 'post',
        url: `/api/task-schedule/crud/taskScheduleHistory`,
        headers: { 'Content-Type': 'application/json' },
        data: { _id: id, page, perPage },
    } as AxiosRequestConfig;
    const res = await axiosCustom.request(config);
    return res.data as { executedTimeArr: string[]; totalExecuted: number; executedTimes: number; pendingLogs: Array<{ _id: string; taskType: string; taskStatus: string; createdAtUtc: string; taskOutputStr: string }> };
};

export const taskScheduleBulkAxios = async (ids: string[], action: string) => {
    const config = {
        method: 'post',
        url: `/api/task-schedule/crud/taskScheduleBulkAction`,
        headers: { 'Content-Type': 'application/json' },
        data: { ids, action },
    } as AxiosRequestConfig;
    const res = await axiosCustom.request(config);
    return res.data;
};
