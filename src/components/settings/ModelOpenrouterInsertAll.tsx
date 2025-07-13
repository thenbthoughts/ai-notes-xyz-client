import { Fragment, useEffect } from "react"
import axiosCustom from "../../config/axiosCustom";

const ModelOpenrouterInsertAll = () => {

    const fetchDataOpenrouter = async () => {
        try {
            const today = new Date().toDateString();
            console.log('today', today)
            const lastFetchDate = localStorage.getItem('modelOpenrouterLastFetch');
            if (lastFetchDate === today) {
                return; // Skip fetch if already done today
            }
            const resultUser = await axiosCustom.post('/api/dynamic-data/model-openrouter/modelOpenrouterAdd', {
            }, {
                withCredentials: true,
                timeout: 10000, // Set timeout to 10 seconds
            });
            console.log(resultUser)
            // set the last fetch date
            localStorage.setItem('modelOpenrouterLastFetch', today);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchDataGroq = async () => {
        try {
            const today = new Date().toDateString();
            console.log('today', today)
            const lastFetchDate = localStorage.getItem('modelGroqLastFetch');
            if (lastFetchDate === today) {
                return; // Skip fetch if already done today
            }
            const resultUser = await axiosCustom.post('/api/dynamic-data/model-groq/modelGroqAdd', {
            }, {
                withCredentials: true,
                timeout: 10000, // Set timeout to 10 seconds
            });
            console.log(resultUser)
            // set the last fetch date
            localStorage.setItem('modelGroqLastFetch', today);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useEffect(() => {
        fetchDataOpenrouter()
        fetchDataGroq()
    }, [])

    return (
        <Fragment />
    )
}

export default ModelOpenrouterInsertAll;