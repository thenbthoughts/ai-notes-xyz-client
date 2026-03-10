import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const FileStorageType = () => {
    const [requestFileStorageType, setRequestFileStorageType] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const authState = useAtomValue(stateJotaiAuthAtom);
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const handleUpdateFileStorageType = async ({
        argFileStorageType,
    }: {
        argFileStorageType: 'gridfs' | 's3';
    }) => {
        setRequestFileStorageType({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/updateUserApiFileStorageType`,
                {
                    "fileStorageType": argFileStorageType,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequestFileStorageType({ loading: false, success: 'File storage type updated successfully!', error: '' });
            console.log("File storage type updated:", response.data);
        } catch (error: any) {
            console.error("Error updating file storage type:", error);

            let errorStr = '';
            if (typeof error?.response?.data?.message === 'string') {
                console.log(error?.response?.data?.message);
                errorStr = error?.response?.data?.message;
            }
            setRequestFileStorageType({ loading: false, success: '', error: `Error updating file storage type. Please try again. ${errorStr}` });
        } finally {
            const randomNum = Math.floor(
                Math.random() * 1_000_000
            )
            setAuthStateReload(randomNum)
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor="fileStorageType" className="block text-gray-700 font-bold mb-2">
                File Storage Type
                {authState.fileStorageType === "gridfs" ? (
                    <span className="inline-block bg-blue-100 text-blue-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                        GridFS
                    </span>
                ) : (
                    <span className="inline-block bg-purple-100 text-purple-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                        S3
                    </span>
                )}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleUpdateFileStorageType({'argFileStorageType': 'gridfs'})}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 text-left relative ${
                        authState.fileStorageType === "gridfs"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:border-blue-300"
                    }`}
                >
                    {authState.fileStorageType === "gridfs" && (
                        <div className="absolute top-2 right-2">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    <div className="mb-2">
                        <span className="font-semibold text-gray-800">GridFS (MongoDB)</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        Files will be stored in MongoDB GridFS
                    </p>
                </button>
                <button
                    type="button"
                    onClick={() => handleUpdateFileStorageType({'argFileStorageType': 's3'})}
                    className={`border-2 rounded-lg p-4 transition-all duration-200 text-left relative ${
                        !authState.apiKeyS3Valid
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                            : authState.fileStorageType === "s3"
                            ? "border-purple-500 bg-purple-50 cursor-pointer"
                            : "border-gray-300 bg-white hover:border-purple-300 cursor-pointer"
                    }`}
                    disabled={!authState.apiKeyS3Valid}
                >
                    {authState.fileStorageType === "s3" && authState.apiKeyS3Valid && (
                        <div className="absolute top-2 right-2">
                            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    <div className="mb-2">
                        <span className={`font-semibold ${!authState.apiKeyS3Valid ? 'text-gray-500' : 'text-gray-800'}`}>
                            S3 Compatible
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {!authState.apiKeyS3Valid ? (
                            <span className="text-red-500 font-medium">
                                S3 API key is not set
                            </span>
                        ) : (
                            "Files will be stored in S3-compatible storage"
                        )}
                    </p>
                </button>
            </div>
            <div className="mt-2">
                {requestFileStorageType.loading && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestFileStorageType.loading && requestFileStorageType.success !== '' && (
                    <p className="text-green-500">{requestFileStorageType.success}</p>
                )}
                {!requestFileStorageType.loading && requestFileStorageType.error !== '' && (
                    <p className="text-red-500">{requestFileStorageType.error}</p>
                )}
            </div>
        </div>
    );
};

export default FileStorageType;