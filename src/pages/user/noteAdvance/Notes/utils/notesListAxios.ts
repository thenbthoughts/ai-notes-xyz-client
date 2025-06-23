import { AxiosRequestConfig } from "axios";
import axiosCustom from "../../../../../config/axiosCustom";

export const notesAddAxios = async () => {
    try {
        const config = {
            method: 'post',
            url: `/api/notes/crud/notesAdd`,
            headers: {
                'Content-Type': 'application/json',
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
            error: 'An error occurred while adding the life event. Please try again.',
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