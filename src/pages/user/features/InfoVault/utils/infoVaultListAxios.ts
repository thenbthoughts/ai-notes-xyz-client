import { AxiosRequestConfig } from "axios";
import axiosCustom from "../../../../../config/axiosCustom";

export const infoVaultAddAxios = async () => {
    try {
        const config = {
            method: 'post',
            url: `/api/info-vault/crud/infoVaultAdd`,
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
            error: 'An error occurred while adding the info vault. Please try again.',
            recordId: '',
        };
    } catch (error) {
        console.error(error);
        alert('An error occurred while adding the info vault. Please try again.');
        return {
            success: false,
            error: 'An error occurred while adding the info vault. Please try again.',
            recordId: '',
        };
    }
}