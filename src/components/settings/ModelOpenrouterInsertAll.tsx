import { Fragment, useEffect } from "react"
import axiosCustom from "../../config/axiosCustom";

const ModelOpenrouterInsertAll = () => {

    useEffect(() => {
        const fetchData = async () => {
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
                
            }
            
        }
        fetchData()
    }, [])

    return (
        <Fragment />
    )
}

export default ModelOpenrouterInsertAll;