import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const S3ApiKey = () => {
    const [apiKeyS3AccessKeyId, setApiKeyS3AccessKeyId] = useState("");
    const [apiKeyS3BucketName, setApiKeyS3BucketName] = useState("");
    const [apiKeyS3Endpoint, setApiKeyS3Endpoint] = useState("");
    const [apiKeyS3Region, setApiKeyS3Region] = useState("");
    const [apiKeyS3SecretAccessKey, setApiKeyS3SecretAccessKey] = useState("");

    const [requestS3, setRequestS3] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

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

    return (
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
    );
};

export default S3ApiKey;