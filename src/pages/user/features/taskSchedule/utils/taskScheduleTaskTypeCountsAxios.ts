import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';

export type TaskScheduleTaskTypeCountRow = {
    taskType: string;
    count: number;
};

export const taskScheduleTaskTypeCountsAxios = async (): Promise<{
    total: number;
    byTaskType: TaskScheduleTaskTypeCountRow[];
} | null> => {
    try {
        const config = {
            method: 'post',
            url: `/api/task-schedule/crud/taskScheduleTaskTypeCounts`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {},
        } as AxiosRequestConfig;

        const response = await axiosCustom.request(config);
        const { total, byTaskType } = response.data;
        if (typeof total === 'number' && Array.isArray(byTaskType)) {
            return { total, byTaskType };
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};
