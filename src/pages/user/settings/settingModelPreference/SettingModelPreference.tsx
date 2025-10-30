import { useState, useEffect } from "react";
import axiosCustom from "../../../../config/axiosCustom";

import SettingHeader from "../SettingHeader";

const SettingModelPreference = () => {
    // model preferences
    const [preferredModelProvider, setPreferredModelProvider] = useState("");
    const [preferredModelName, setPreferredModelName] = useState("");

    // success or failed
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const modelNamesOpenRouter = [
        "openrouter/auto",
        "inflection/inflection-3-pi",
        "inflection/inflection-3-productivity",
        "perplexity/llama-3.1-sonar-small-128k-online",
        "google/gemma-3-27b-it"
    ];

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/crud/getUser`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setPreferredModelProvider(response.data.preferredModelProvider); // Set model provider from response
            setPreferredModelName(response.data.preferredModelName); // Set model name from response
        } catch (error) {
            console.error("Error fetching user:", error);
            setError("Error fetching user. Please try again.");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const response = await axiosCustom.post(
                `/api/user/crud/updateUser`,
                { preferredModelProvider, preferredModelName },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setSuccessMessage("User updated successfully!");
            console.log("User updated:", response.data);
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Error updating user. Please try again.");
        }
    };

    const renderModelPreferences = () => {
        return (
            <div>
                <h2 className="text-xl font-bold text-gray-900 py-2">Model Preferences</h2>

                {/* openrouter */}
                <div className="mb-4 bg-blue-100 text-blue-400 p-2 rounded">
                    <label className="font-bold mb-2">
                        Info: 
                    </label>
                    <a 
                        href="https://openrouter.ai/models" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className=" hover:underline px-2"
                    >
                        View available models on OpenRouter
                    </a>
                </div>

                {/* groq */}
                <div className="mb-4 bg-blue-100 text-blue-400 p-2 rounded">
                    <label className="font-bold mb-2">
                        Info: 
                    </label>
                    <a 
                        href="https://console.groq.com/docs/models" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className=" hover:underline px-2"
                    >
                        View available models on Groq
                    </a>
                </div>

                <div className="mb-4">
                    <label htmlFor="preferredModelProvider" className="block text-gray-700 font-bold mb-2">
                        Preferred Model Provider
                    </label>
                    <select
                        id="preferredModelProvider"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={preferredModelProvider}
                        onChange={(e) => setPreferredModelProvider(e.target.value)}
                    >
                        <option value="">Select a model provider</option>
                        <option value="groq">GROQ</option>
                        <option value="openrouter">OpenRouter</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="preferredModelName" className="block text-gray-700 font-bold mb-2">
                        Preferred Model Name
                    </label>
                    <input
                        type="text"
                        id="preferredModelName"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={preferredModelName}
                        onChange={(e) => setPreferredModelName(e.target.value)}
                    />

                </div>

                <div className="mb-4">
                    <label htmlFor="preferredModelName" className="block text-gray-700 font-bold mb-2">
                        Model Names for GROQ
                    </label>
                    <div className="bg-white shadow-md rounded-sm p-4">
                        <div className="flex flex-wrap mt-2">
                            <span
                                onClick={() => {
                                    setPreferredModelProvider("groq");
                                    setPreferredModelName("llama-3.1-8b-instant");
                                }}
                                className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-sm mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                            >
                                llama-3.1-8b-instant
                            </span>
                            <span
                                onClick={() => {
                                    setPreferredModelProvider("groq");
                                    setPreferredModelName("llama-3.2-11b-vision-preview");
                                }}
                                className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-sm mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                            >
                                llama-3.2-11b-vision-preview
                            </span>
                            <span
                                onClick={() => {
                                    setPreferredModelProvider("groq");
                                    setPreferredModelName("mistral-saba-24b");
                                }}
                                className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-sm mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                            >
                                mistral-saba-24b
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="preferredModelName" className="block text-gray-700 font-bold mb-2">
                        Model Names for Openrouter
                    </label>
                    <div className="bg-white shadow-md rounded-sm p-4">
                        <div className="flex flex-wrap mt-2">

                            {modelNamesOpenRouter.map(modelName => {
                                return (
                                    <span
                                        onClick={() => {
                                            setPreferredModelProvider("openrouter");
                                            setPreferredModelName(modelName);
                                        }}
                                        className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-sm mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                                    >
                                        {modelName}
                                    </span>
                                )
                            })}                            
                        </div>
                    </div>
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

            <form onSubmit={handleSubmit}>
                {renderModelPreferences()}

                {error && <p className="text-red-500 text-sm py-3">{error}</p>}

                {successMessage && <p className="text-green-500 text-sm py-3">{successMessage}</p>}

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
                >
                    Update
                </button>
            </form>

        </div>
    );
};

export default SettingModelPreference;