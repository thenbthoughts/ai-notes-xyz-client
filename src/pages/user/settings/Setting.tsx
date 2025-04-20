import { useState, useEffect } from "react";
import axiosCustom from "../../../config/axiosCustom";
import { Link } from "react-router-dom";

import SettingApiKey from './SettingApiKey';
import SettingDefaultEnvKeys from "./SettingDefaultEnvKeys";
import SettingSelectTimeZone from "./SettingSelectTimeZone";

const Setting = () => {
    // personal info

    const [name, setName] = useState("");
    const [username, setUsername] = useState(""); // Added username state
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [profilePictureLink, setProfilePictureLink] = useState("");
    const [bio, setBio] = useState("");

    // location
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");

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
            setName(response.data.name);
            setUsername(response.data.username); // Set username from response
            setDateOfBirth(response.data.dateOfBirth);
            setProfilePictureLink(response.data.profilePictureLink);
            setBio(response.data.bio);
            setCity(response.data.city);
            setState(response.data.state);
            setZipCode(response.data.zipCode);
            setCountry(response.data.country);
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
                { name, dateOfBirth, profilePictureLink, bio, city, state, zipCode, country, preferredModelProvider, preferredModelName },
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

    const renderPersonalInfo = () => {
        return (
            <div>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={username}
                        disabled // Input is disabled
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="dateOfBirth" className="block text-gray-700 font-bold mb-2">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="profilePictureLink" className="block text-gray-700 font-bold mb-2">
                        Profile Picture Link
                    </label>
                    <input
                        type="text"
                        id="profilePictureLink"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={profilePictureLink}
                        onChange={(e) => setProfilePictureLink(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="bio" className="block text-gray-700 font-bold mb-2">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
            </div>
        )
    }

    const renderLocation = () => {
        return (
            <div>
                <h2 className="text-xl font-bold text-gray-900 py-2">Location</h2>
                <div className="mb-4">
                    <label htmlFor="city" className="block text-gray-700 font-bold mb-2">
                        City
                    </label>
                    <input
                        type="text"
                        id="city"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="state" className="block text-gray-700 font-bold mb-2">
                        State
                    </label>
                    <input
                        type="text"
                        id="state"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="zipCode" className="block text-gray-700 font-bold mb-2">
                        Zip Code
                    </label>
                    <input
                        type="text"
                        id="zipCode"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="country" className="block text-gray-700 font-bold mb-2">
                        Country
                    </label>
                    <input
                        type="text"
                        id="country"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>
            </div>
        )
    }

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
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={preferredModelName}
                        onChange={(e) => setPreferredModelName(e.target.value)}
                    />

                </div>

                <div className="mb-4">
                    <label htmlFor="preferredModelName" className="block text-gray-700 font-bold mb-2">
                        Model Names for GROQ
                    </label>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex flex-wrap mt-2">
                            <span
                                onClick={() => {
                                    setPreferredModelProvider("groq");
                                    setPreferredModelName("llama-3.1-8b-instant");
                                }}
                                className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-full mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                            >
                                llama-3.1-8b-instant
                            </span>
                            <span
                                onClick={() => {
                                    setPreferredModelProvider("groq");
                                    setPreferredModelName("llama-3.2-11b-vision-preview");
                                }}
                                className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-full mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                            >
                                llama-3.2-11b-vision-preview
                            </span>
                            <span
                                onClick={() => {
                                    setPreferredModelProvider("groq");
                                    setPreferredModelName("mistral-saba-24b");
                                }}
                                className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-full mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
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
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex flex-wrap mt-2">

                            {modelNamesOpenRouter.map(modelName => {
                                return (
                                    <span
                                        onClick={() => {
                                            setPreferredModelProvider("openrouter");
                                            setPreferredModelName(modelName);
                                        }}
                                        className="cursor-pointer bg-blue-100 text-blue-600 py-1 px-3 rounded-full mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
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
            <h1 className="text-2xl font-bold text-gray-900 py-5 text-white">Setting</h1>

            <div className="border-b border-gray-300  mb-5" />

            <p className="text-gray-500 text-sm pb-1 text-white">Customize your profile and preferences.</p>

            <div className="mb-5">
                <Link to="#profile" className="text-white hover:underline mr-2">Profile Settings</Link>{'|'}
                <Link to="#security" className="text-white hover:underline mx-2">Location</Link>{'|'}
                <Link to="#model-preferences" className="text-white hover:underline mx-2">Model Preferences</Link>{'|'}
                <Link to="#api-keys" className="text-white hover:underline mx-2">API Keys</Link>
            </div>

            <form onSubmit={handleSubmit}>
                {renderPersonalInfo()}
                {renderLocation()}
                {renderModelPreferences()}

                {error && <p className="text-red-500 text-sm py-3">{error}</p>}

                {successMessage && <p className="text-green-500 text-sm py-3">{successMessage}</p>}

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Update
                </button>
            </form>

            <SettingApiKey />

            <SettingDefaultEnvKeys />

            <SettingSelectTimeZone />

        </div>
    );
};

export default Setting;