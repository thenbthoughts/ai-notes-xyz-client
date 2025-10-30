import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import SettingHeader from "../SettingHeader";
import SettingDefaultEnvKeys from "./SettingDefaultEnvKeys";

import ComponentApiKeySet from "../../userhomepage/ComponentApiKeySet";

const SettingApiKey = () => {
    // location
    const [apiKeyGroq, setApiKeyGroq] = useState("");
    const [apiKeyOpenrouter, setApiKeyOpenrouter] = useState("");

    const [apiKeyS3AccessKeyId, setApiKeyS3AccessKeyId] = useState("");
    const [apiKeyS3BucketName, setApiKeyS3BucketName] = useState("");
    const [apiKeyS3Endpoint, setApiKeyS3Endpoint] = useState("");
    const [apiKeyS3Region, setApiKeyS3Region] = useState("");
    const [apiKeyS3SecretAccessKey, setApiKeyS3SecretAccessKey] = useState("");

    const [apiKeyOllamaEndpoint, setApiKeyOllamaEndpoint] = useState("");

    const [apiKeyQdrantEndpoint, setApiKeyQdrantEndpoint] = useState("");
    const [apiKeyQdrantPassword, setApiKeyQdrantPassword] = useState("");

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    // smtp
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPassword, setSmtpPassword] = useState("");
    const [smtpFrom, setSmtpFrom] = useState("");
    const [smtpTo, setSmtpTo] = useState("");

    // success or failed
    const [
        requestOpenrouter,
        setRequestOpenrouter,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    })
    const [
        requestGroq,
        setRequestGroq,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const [
        requestS3,
        setRequestS3,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const [
        requestOllama,
        setRequestOllama,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const [
        requestQdrant,
        setRequestQdrant,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const [
        requestSmtp,
        setRequestSmtp,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const handleUpdateOpenrouter = async () => {
        setRequestOpenrouter({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiOpenrouter`,
                {
                    apiKeyOpenrouter,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestOpenrouter({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }

            setRequestOpenrouter({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const handleUpdateGroq = async () => {
        setRequestGroq({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiGroq`,
                {
                    apiKeyGroq,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestGroq({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestGroq({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const handleUpdateS3 = async () => {
        setRequestS3({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiS3`,
                {
                    apiKeyS3Endpoint,
                    apiKeyS3Region,
                    apiKeyS3AccessKeyId,
                    apiKeyS3SecretAccessKey,
                    apiKeyS3BucketName,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestS3({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);
            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestS3({ loading: false, success: '', error: `${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const handleUpdateOllama = async () => {
        setRequestOllama({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiOllama`,
                {
                    apiKeyOllamaEndpoint,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestOllama({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestOllama({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const handleUpdateQdrant = async () => {
        setRequestQdrant({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiQdrant`,
                {
                    apiKeyQdrantEndpoint,
                    apiKeyQdrantPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestQdrant({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestQdrant({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const handleUpdateSmtp = async () => {
        setRequestSmtp({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiSmtp`,
                {
                    "smtpHost": smtpHost,
                    "smtpPort": smtpPort,
                    "smtpUser": smtpUser,
                    "smtpPassword": smtpPassword,

                    // fields send from email
                    "smtpFrom": smtpFrom,
                    "smtpTo": smtpTo
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestSmtp({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error: any) {
            console.error("Error updating user:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.error === 'string') {
                console.log(error?.response?.data?.error);
                errorStr = error?.response?.data?.error;
            }
            setRequestSmtp({ loading: false, success: '', error: `Error updating user. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    const renderApiKeys = () => {
        return (
            <div
                id="api-keys"
            >
                <h2 className="text-xl font-bold text-gray-900 py-2">Api Keys</h2>

                <div className="my-4">
                    <ComponentApiKeySet />
                </div>

                {/* Groq */}
                <div className="mb-4">
                    <label htmlFor="apiKeyGroq" className="block text-gray-700 font-bold mb-2">
                        Groq Api Key
                        {authState.apiKeyGroqValid ? (
                            <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                Valid
                            </span>
                        ) : (
                            <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                Not set
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        id="apiKeyGroq"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={apiKeyGroq}
                        onChange={(e) => setApiKeyGroq(e.target.value)}
                    />
                    <div className="mt-2">
                        {requestGroq.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!requestGroq.loading && requestGroq.success !== '' && (
                            <p className="text-green-500">API Key verified and saved successfully!</p>
                        )}
                        {!requestGroq.loading && requestGroq.error !== '' && (
                            <p className="text-red-500">Error verifying API Key. Please try again.</p>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateGroq}
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    >
                        Verify and save
                    </button>
                </div>

                {/* Openrouter */}
                <div className="mb-4">
                    <label htmlFor="apiKeyOpenrouter" className="block text-gray-700 font-bold mb-2">
                        Openrouter Api Key
                        {authState.apiKeyOpenrouterValid ? (
                            <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                Valid
                            </span>
                        ) : (
                            <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                Not set
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        id="apiKeyOpenrouter"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={apiKeyOpenrouter}
                        onChange={(e) => setApiKeyOpenrouter(e.target.value)}
                    />
                    <div className="mt-2">
                        {requestOpenrouter.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!requestOpenrouter.loading && requestOpenrouter.success !== '' && (
                            <p className="text-green-500">API Key verified and saved successfully!</p>
                        )}
                        {!requestOpenrouter.loading && requestOpenrouter.error !== '' && (
                            <p className="text-red-500">Error verifying API Key. Please try again.</p>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateOpenrouter}
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    >
                        Verify and save
                    </button>
                </div>

                {/* S3 */}
                <div className="mb-4">
                    <div>
                        <label htmlFor="apiKeyOpenrouter" className="block text-gray-700 font-bold mb-2">
                            S3 compatible Api Key
                            {authState.apiKeyS3Valid ? (
                                <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Valid
                                </span>
                            ) : (
                                <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Not set
                                </span>
                            )}
                        </label>
                    </div>

                    <div>
                        <label htmlFor="apiKeyS3Endpoint" className="block text-gray-700 font-bold mb-2">
                            S3 Endpoint
                        </label>
                        <input
                            type="text"
                            id="apiKeyS3Endpoint"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyS3Endpoint}
                            onChange={(e) => setApiKeyS3Endpoint(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="apiKeyS3Region" className="block text-gray-700 font-bold mb-2">
                            S3 Region
                        </label>
                        <input
                            type="text"
                            id="apiKeyS3Region"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyS3Region}
                            onChange={(e) => setApiKeyS3Region(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="apiKeyS3AccessKeyId" className="block text-gray-700 font-bold mb-2">
                            S3 Access Key ID
                        </label>
                        <input
                            type="text"
                            id="apiKeyS3AccessKeyId"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyS3AccessKeyId}
                            onChange={(e) => setApiKeyS3AccessKeyId(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="apiKeyS3SecretAccessKey" className="block text-gray-700 font-bold mb-2">
                            S3 Secret Access Key
                        </label>
                        <input
                            type="text"
                            id="apiKeyS3SecretAccessKey"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyS3SecretAccessKey}
                            onChange={(e) => setApiKeyS3SecretAccessKey(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="apiKeyS3BucketName" className="block text-gray-700 font-bold mb-2">
                            S3 Bucket Name
                        </label>
                        <input
                            type="text"
                            id="apiKeyS3BucketName"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyS3BucketName}
                            onChange={(e) => setApiKeyS3BucketName(e.target.value)}
                        />
                    </div>

                    <div className="mt-2">
                        {requestS3.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!requestS3.loading && requestS3.success !== '' && (
                            <p className="text-green-500">API Key verified and saved successfully!</p>
                        )}
                        {!requestS3.loading && requestS3.error !== '' && (
                            <p className="text-red-500 bg-red-100 p-1 rounded">{requestS3.error}</p>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateS3}
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    >
                        Verify and save
                    </button>
                </div>

                {/* Ollama */}
                <div className="mb-4">
                    <div>
                        <label htmlFor="apiKeyOllama" className="block text-gray-700 font-bold mb-2">
                            Ollama Api Key
                            {authState.apiKeyOllamaValid ? (
                                <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Valid
                                </span>
                            ) : (
                                <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Not set
                                </span>
                            )}
                        </label>
                    </div>

                    <div>
                        <label htmlFor="apiKeyOllamaEndpoint" className="block text-gray-700 font-bold mb-2">
                            Ollama Endpoint
                        </label>
                        <input
                            type="text"
                            id="apiKeyOllamaEndpoint"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyOllamaEndpoint}
                            onChange={(e) => setApiKeyOllamaEndpoint(e.target.value)}
                        />
                    </div>

                    <div className="mt-2">
                        {requestOllama.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!requestOllama.loading && requestOllama.success !== '' && (
                            <p className="text-green-500">API Key verified and saved successfully!</p>
                        )}
                        {!requestOllama.loading && requestOllama.error !== '' && (
                            <p className="text-red-500 bg-red-100 p-1 rounded">{requestOllama.error}</p>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateOllama}
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    >
                        Verify and save
                    </button>
                </div>

                {/* Qdrant */}
                <div className="mb-4">
                    <div>
                        <label htmlFor="apiKeyOllama" className="block text-gray-700 font-bold mb-2">
                            Qdrant Api Key
                            {authState.apiKeyQdrantValid ? (
                                <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Valid
                                </span>
                            ) : (
                                <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Not set
                                </span>
                            )}
                        </label>
                    </div>

                    <div>
                        <label htmlFor="apiKeyQdrantEndpoint" className="block text-gray-700 font-bold mb-2">
                            Qdrant Endpoint
                        </label>
                        <input
                            type="text"
                            id="apiKeyQdrantEndpoint"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyQdrantEndpoint}
                            onChange={(e) => setApiKeyQdrantEndpoint(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="apiKeyQdrantPassword" className="block text-gray-700 font-bold mb-2">
                            Qdrant Password
                        </label>
                        <input
                            type="text"
                            id="apiKeyQdrantPassword"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={apiKeyQdrantPassword}
                            onChange={(e) => setApiKeyQdrantPassword(e.target.value)}
                        />
                    </div>

                    <div className="mt-2">
                        {requestQdrant.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!requestQdrant.loading && requestQdrant.success !== '' && (
                            <p className="text-green-500">API Key verified and saved successfully!</p>
                        )}
                        {!requestQdrant.loading && requestQdrant.error !== '' && (
                            <p className="text-red-500 bg-red-100 p-1 rounded">{requestQdrant.error}</p>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateQdrant}
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    >
                        Verify and save
                    </button>
                </div>

                {/* SMTP */}
                <div className="mb-4">
                    <div>
                        <label htmlFor="smtpHost" className="block text-gray-700 font-bold mb-2">
                            SMTP Host
                            {authState.smtpValid ? (
                                <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Valid
                                </span>
                            ) : (
                                <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Not set
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            id="smtpHost"
                            placeholder="smtp.gmail.com"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="smtpPort" className="block text-gray-700 font-bold mb-2">
                            SMTP Port
                        </label>
                        <input
                            type="number"
                            id="smtpPort"
                            placeholder="587"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="smtpUser" className="block text-gray-700 font-bold mb-2">
                            SMTP User
                        </label>
                        <input
                            type="text"
                            id="smtpUser"
                            placeholder="your-email@gmail.com"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="smtpPassword" className="block text-gray-700 font-bold mb-2">
                            SMTP Password
                        </label>
                        <input
                            type="password"
                            id="smtpPassword"
                            placeholder="your-app-password"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={smtpPassword}
                            onChange={(e) => setSmtpPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="smtpFrom" className="block text-gray-700 font-bold mb-2">
                            SMTP From
                        </label>
                        <input
                            type="email"
                            id="smtpFrom"
                            placeholder="sender@example.com"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={smtpFrom}
                            onChange={(e) => setSmtpFrom(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="smtpTo" className="block text-gray-700 font-bold mb-2">
                            SMTP To
                        </label>
                        <input
                            type="email"
                            id="smtpTo"
                            placeholder="recipient@example.com"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={smtpTo}
                            onChange={(e) => setSmtpTo(e.target.value)}
                        />
                    </div>

                    <div className="mt-2">
                        {requestSmtp.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!requestSmtp.loading && requestSmtp.success !== '' && (
                            <p className="text-green-500">SMTP settings verified and saved successfully!</p>
                        )}
                        {!requestSmtp.loading && requestSmtp.error !== '' && (
                            <p className="text-red-500 bg-red-100 p-1 rounded">{requestSmtp.error}</p>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateSmtp}
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                    >
                        Verify and save
                    </button>
                </div>

                {/* Client Frontend Url */}
                <div className="mb-4">
                    <label htmlFor="clientFrontendUrl" className="block text-gray-700 font-bold mb-2">
                        Client Frontend Url
                    </label>
                    <input
                        type="text"
                        id="clientFrontendUrl"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={authState.clientFrontendUrl}
                        disabled
                    />
                </div>
            </div>
        )
    }

    return (
        <div
            className="p-4"
            style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}
        >
            <SettingHeader />

            {renderApiKeys()}

            <SettingDefaultEnvKeys />
        </div>
    );
};

export default SettingApiKey;