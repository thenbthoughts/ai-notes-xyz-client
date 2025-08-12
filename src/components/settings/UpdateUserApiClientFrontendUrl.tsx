import { Fragment, useEffect } from "react"
import axiosCustom from "../../config/axiosCustom";
import { useAtomValue } from "jotai";
import stateJotaiAuthAtom from "../../jotai/stateJotaiAuth";

const UpdateUserApiClientFrontendUrl = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);

    const updateUserApiClientFrontendUrl = async () => {
        let clientFrontendUrl = window.location.origin;
        console.log('clientFrontendUrl', clientFrontendUrl);

        try {
            // if auth is valid
            if (authState.isLoggedIn === 'true') {
                // do nothing
            } else {
                return;
            }

            const today = new Date().toDateString();
            console.log('today', today)
            const lastFetchDate = localStorage.getItem('updateUserApiClientFrontendUrl');
            if (lastFetchDate === today) {
                return; // Skip fetch if already done today
            }

            const resultUser = await axiosCustom.post('/api/user/api-keys/updateUserApiClientFrontendUrl', {
                clientFrontendUrl: clientFrontendUrl,
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

    useEffect(() => {
        updateUserApiClientFrontendUrl()
    }, [authState.isLoggedIn])

    return (
        <Fragment />
    )
}

export default UpdateUserApiClientFrontendUrl;