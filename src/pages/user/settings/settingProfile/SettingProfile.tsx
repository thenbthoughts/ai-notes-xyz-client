import { useState, useEffect } from "react";
import axiosCustom from "../../../../config/axiosCustom";

import SettingSelectTimeZone from "./SettingSelectTimeZone";
import SettingRevalidate from "./SettingRevalidate";
import SettingHeader from "../SettingHeader";

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

    // success or failed
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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
                { name, dateOfBirth, profilePictureLink, bio, city, state, zipCode, country },
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
                {renderPersonalInfo()}
                {renderLocation()}

                {error && <p className="text-red-500 text-sm py-3">{error}</p>}

                {successMessage && <p className="text-green-500 text-sm py-3">{successMessage}</p>}

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Update
                </button>
            </form>

            <SettingSelectTimeZone />

            <SettingRevalidate />

        </div>
    );
};

export default Setting;