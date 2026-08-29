import axios from 'axios';

import envKeys from './envKeys';

const axiosCustom = axios.create({
    baseURL: envKeys.API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosCustom;
