import { useEffect } from "react";
import { useAtom, useAtomValue } from 'jotai';
import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../jotai/stateJotaiAuth';
import axiosCustom from '../config/axiosCustom';

const RefreshToken = () => {
    const [authState, setAuthState] = useAtom(stateJotaiAuthAtom);
    const authStateReload = useAtomValue(stateJotaiAuthReloadAtom);

    // useEffects
    useEffect(() => {
        if (authState.isLoggedIn === 'pending') {
            refreshToken();
        }
    }, []);

    useEffect(() => {
        const intervalId = setInterval(refreshToken, 60000); // Call refreshToken every minute (60000 milliseconds)
        return () => clearInterval(intervalId); // Clear the interval when the component unmounts
    }, []);

    useEffect(() => {
        refreshToken();
    }, [authStateReload])

    const refreshToken = async () => {
        const tempData = {
            isLoggedIn: 'true' as "pending" | "true" | "false",
            apiKeyGroqValid: false,
            apiKeyOpenrouterValid: false,
            apiKeyS3Valid: false,
            apiKeyOllamaValid: false,
            apiKeyQdrantValid: false,
            smtpValid: false,
            clientFrontendUrl: '',
        };

        try {
            const resultUser = await axiosCustom.post('/api/user/crud/refresh-token', {}, {
                withCredentials: true,
                timeout: 10000, // Set timeout to 10 seconds
            });

            const userInfoFromApi = resultUser.data.user;
            if (userInfoFromApi) {
                if (typeof userInfoFromApi?.apiKeyGroqValid === 'boolean') {
                    tempData.apiKeyGroqValid = userInfoFromApi?.apiKeyGroqValid;
                }
                if (typeof userInfoFromApi?.apiKeyOpenrouterValid === 'boolean') {
                    tempData.apiKeyOpenrouterValid = userInfoFromApi?.apiKeyOpenrouterValid;
                }
                if (typeof userInfoFromApi?.apiKeyS3Valid === 'boolean') {
                    tempData.apiKeyS3Valid = userInfoFromApi?.apiKeyS3Valid;
                }
                if (typeof userInfoFromApi?.apiKeyOllamaValid === 'boolean') {
                    tempData.apiKeyOllamaValid = userInfoFromApi?.apiKeyOllamaValid;
                }
                if (typeof userInfoFromApi?.apiKeyQdrantValid === 'boolean') {
                    tempData.apiKeyQdrantValid = userInfoFromApi?.apiKeyQdrantValid;
                }
                if (typeof userInfoFromApi?.smtpValid === 'boolean') {
                    tempData.smtpValid = userInfoFromApi?.smtpValid;
                }
                if (typeof userInfoFromApi?.clientFrontendUrl === 'string') {
                    tempData.clientFrontendUrl = userInfoFromApi?.clientFrontendUrl;
                }
            }

            setAuthState(tempData);
        } catch (error) {
            console.error('Refresh token failed:', error);
            setAuthState({
                isLoggedIn: 'false',
                apiKeyGroqValid: false,
                apiKeyOpenrouterValid: false,
                apiKeyS3Valid: false,
                apiKeyOllamaValid: false,
                apiKeyQdrantValid: false,
                smtpValid: false,
                clientFrontendUrl: '',
            });
        }
    };

    return <></>;
};

export default RefreshToken;
