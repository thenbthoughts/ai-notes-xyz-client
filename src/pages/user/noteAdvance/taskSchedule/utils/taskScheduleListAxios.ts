import { AxiosRequestConfig } from "axios";
import axiosCustom from "../../../../../config/axiosCustom";

export const taskScheduleAddAxios = async () => {
    try {
        const config = {
            method: 'post',
            url: `/api/task-schedule/crud/taskScheduleAdd`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                title: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                taskType: 'taskAdd',
            },
        } as AxiosRequestConfig;

        const response = await axiosCustom.request(config);
        const doc = response.data.doc;
        
        if (typeof doc._id === 'string') {
            if (doc._id.length === 24) {
                return {
                    success: 'Success',
                    error: '',
                    recordId: doc._id,
                };
            }
        }

        return {
            success: '',
            error: 'An error occurred while adding the task schedule. Please try again.',
            recordId: '',
        };
    } catch (error) {
        console.error(error);
        alert('An error occurred while adding the life event. Please try again.');
        return {
            success: false,
            error: 'An error occurred while adding the life event. Please try again.',
            recordId: '',
        };
    }
}