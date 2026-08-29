import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Eye, EyeOff, Copy } from "lucide-react";
import toast from "react-hot-toast";
import stateJotaiAuthAtom, { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";

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
    const { clearRequest, handleClearApiKey } = useApiKeyClear();
    const [showSecret, setShowSecret] = useState(false);
    const [_latencyMs, setLatencyMs] = useState<number | null>(null);
    const handleCopy = async (v: string) => {
        try {
            await navigator.clipboard.writeText(v);
            toast.success("Copied");
        } catch {
            toast.error("Copy failed");
        }
    };

    const handleUpdateS3 = async () => {
        setRequestS3({ loading: true, success: '', error: '' });
        const start = Date.now();
        try {
            const response = await axiosCustom.post(`/api/user/api-keys/updateUserApiS3`, { apiKeyS3Endpoint, apiKeyS3Region, apiKeyS3AccessKeyId, apiKeyS3SecretAccessKey, apiKeyS3BucketName }, { headers: { 'Content-Type': 'application/json' }, withCredentials: true });
            setLatencyMs(Date.now() - start);
            setRequestS3({ loading: false, success: 'User updated successfully!', error: '' });
            toast.success(`S3 saved ${Date.now() - start}ms`);
            console.log("User updated:", response.data);
        } catch (error: unknown) {
            console.error("Error updating user:", error);
            let errorStr = '';
            if (typeof (error as { response?: { data?: { error?: unknown } } })?.response?.data?.error === 'string') errorStr = (error as { response: { data: { error: string } } }).response.data.error;
            setRequestS3({ loading: false, success: '', error: `${errorStr}` });
            toast.error(errorStr || "Update failed");
        } finally {
            const randomNum = Math.floor(Math.random() * 1_000_000);
            setAuthStateReload(randomNum);
        }
    };

    return (
        <div className="mb-4">
            <div>
                <label htmlFor="apiKeyOpenrouter" className="block text-zinc-300 font-bold mb-2">
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
                <label htmlFor="apiKeyS3Endpoint" className="block text-zinc-300 font-bold mb-2">
                    S3 Endpoint
                </label>
                <input
                    type="text"
                    id="apiKeyS3Endpoint"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyS3Endpoint}
                    onChange={(e) => setApiKeyS3Endpoint(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="apiKeyS3Region" className="block text-zinc-300 font-bold mb-2">
                    S3 Region
                </label>
                <input
                    type="text"
                    id="apiKeyS3Region"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyS3Region}
                    onChange={(e) => setApiKeyS3Region(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="apiKeyS3AccessKeyId" className="block text-zinc-300 font-bold mb-2">
                    S3 Access Key ID
                </label>
                <div className="flex gap-2">
                    <input type="text" id="apiKeyS3AccessKeyId" className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline" value={apiKeyS3AccessKeyId} onChange={(e) => setApiKeyS3AccessKeyId(e.target.value)} aria-label="S3 access key id" />
                    <button type="button" onClick={() => { void handleCopy(apiKeyS3AccessKeyId); }} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-300 hover:bg-zinc-700" aria-label="Copy access key"><Copy className="h-4 w-4" /></button>
                </div>
            </div>

            <div>
                <label htmlFor="apiKeyS3SecretAccessKey" className="block text-zinc-300 font-bold mb-2">
                    S3 Secret Access Key
                </label>
                <div className="flex gap-2">
                    <input type={showSecret ? "text" : "password"} id="apiKeyS3SecretAccessKey" className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline" value={apiKeyS3SecretAccessKey} onChange={(e) => setApiKeyS3SecretAccessKey(e.target.value)} aria-label="S3 secret access key" />
                    <button type="button" onClick={() => { setShowSecret((prev) => { return !prev; }); }} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-300 hover:bg-zinc-700" aria-label={showSecret ? "Hide secret" : "Show secret"}>{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button type="button" onClick={() => { void handleCopy(apiKeyS3SecretAccessKey); }} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-300 hover:bg-zinc-700" aria-label="Copy secret"><Copy className="h-4 w-4" /></button>
                </div>
            </div>
            <div>
                <label htmlFor="apiKeyS3BucketName" className="block text-zinc-300 font-bold mb-2">
                    S3 Bucket Name
                </label>
                <input
                    type="text"
                    id="apiKeyS3BucketName"
                    className="shadow appearance-none border border-zinc-700 rounded-sm w-full py-2 px-3 bg-zinc-800 text-zinc-200 leading-tight focus:outline-none focus:shadow-outline"
                    value={apiKeyS3BucketName}
                    onChange={(e) => setApiKeyS3BucketName(e.target.value)}
                />
            </div>

                    <div className="mt-2">
                        {(requestS3.loading || clearRequest.loading) && (
                            <p className="text-zinc-400">Loading...</p>
                        )}
                        {!requestS3.loading && !clearRequest.loading && requestS3.success !== '' && (
                            <p className="text-green-500">API Key verified and saved successfully!</p>
                        )}
                        {!requestS3.loading && !clearRequest.loading && clearRequest.success !== '' && (
                            <p className="text-green-500">API Key cleared successfully!</p>
                        )}
                        {!requestS3.loading && !clearRequest.loading && (requestS3.error !== '' || clearRequest.error !== '') && (
                            <p className="text-red-500 bg-red-100 p-1 rounded">{requestS3.error || clearRequest.error}</p>
                        )}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleUpdateS3}
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200"
                            disabled={requestS3.loading || clearRequest.loading}
                        >
                            Verify and save
                        </button>
                        <button
                            onClick={() => handleClearApiKey('s3')}
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                            disabled={requestS3.loading || clearRequest.loading}
                        >
                            Clear
                        </button>
                    </div>
        </div>
    );
};

export default S3ApiKey;