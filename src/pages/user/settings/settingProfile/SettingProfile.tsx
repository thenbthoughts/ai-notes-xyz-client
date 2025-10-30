import { useState, useEffect, Fragment } from "react";
import axiosCustom from "../../../../config/axiosCustom";

import SettingSelectTimeZone from "./SettingSelectTimeZone";
import SettingRevalidate from "./SettingRevalidate";
import SettingHeader from "../SettingHeader";

const InputEmailVerify = ({
    setReloadRandomNum
}: {
    setReloadRandomNum: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const [disableEmailField, setDisableEmailField] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [requestSendOtp, setRequestSendOtp] = useState({
        loading: false,
        error: "",
        success: "",
    });

    const [requestVerifyOtp, setRequestVerifyOtp] = useState({
        loading: false,
        error: "",
        success: "",
    });

    const sendOtp = async () => {
        try {
            setRequestSendOtp({
                loading: true,
                error: "",
                success: "",
            });

            const response = await axiosCustom.post(
                `/api/user/api-keys/userEmailVerifySendOtp`,
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setShowOtp(true);
                setDisableEmailField(true);
            }

            setRequestSendOtp({
                loading: false,
                error: "",
                success: "OTP sent successfully.",
            });
            setRequestVerifyOtp({
                loading: false,
                error: "",
                success: "",
            });
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            if (typeof error.response?.data?.error === 'string') {
                setRequestSendOtp({
                    loading: false,
                    error: error.response.data.error,
                    success: "",
                });
            } else {
                setRequestSendOtp({
                    loading: false,
                    error: "Error sending OTP. Please try again.",
                    success: "",
                });
            }
        }
    };

    const verifyOtp = async () => {
        try {
            setRequestVerifyOtp({
                loading: true,
                error: "",
                success: "",
            });

            const response = await axiosCustom.post(
                `/api/user/api-keys/userEmailVerifyVerifyOtp`,
                { otp: parseInt(otp) },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setShowOtp(false);
                setDisableEmailField(false);
                setEmail("");
                setOtp("");
            }

            setRequestVerifyOtp({
                loading: false,
                error: "",
                success: "OTP verified successfully.",
            });
            setRequestSendOtp({
                loading: false,
                error: "",
                success: "",
            });

            // revalidate user
            setReloadRandomNum(prev => prev + 1);
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setRequestVerifyOtp({
                loading: false,
                error: "Error verifying OTP. Please try again.",
                success: "",
            });
        }
    };

    return (
        <Fragment>
            {/* send otp */}
            <div>
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                    Email
                    <span className="inline-block bg-red-100 text-red-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                        Not set
                    </span>
                </label>
                <input
                    type="email"
                    id="email"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={disableEmailField}
                />
                <div>
                    <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-sm mt-2">
                        <strong>Warning:</strong> Please ensure your email address is correct if provided,
                        as it will be used for login notifications, daily AI summaries,
                        server status updates, and other important communications.
                    </p>
                </div>

                {requestSendOtp.loading && (
                    <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-sm mt-2">
                        Sending OTP...
                    </p>
                )}

                {requestSendOtp.error && (
                    <p className="text-sm text-red-500 bg-red-50 p-2 rounded-sm mt-2">
                        {requestSendOtp.error}
                    </p>
                )}

                {requestSendOtp.success && (
                    <p className="text-sm text-green-500 bg-green-50 p-2 rounded-sm mt-2">
                        {requestSendOtp.success}
                    </p>
                )}

                <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
                    onClick={sendOtp}
                >
                    Send OTP
                </button>
            </div>

            {requestVerifyOtp.success && (
                <p className="text-sm text-green-500 bg-green-50 p-2 rounded-sm mt-2">
                    {requestVerifyOtp.success}
                </p>
            )}

            {/* verify otp */}
            {showOtp && (
                <div>
                    <label htmlFor="otp" className="block text-gray-700 font-bold mb-2">
                        OTP
                    </label>
                    <input
                        type="number"
                        id="otp"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />

                    {requestVerifyOtp.loading && (
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-sm mt-2">
                            Verifying OTP...
                        </p>
                    )}

                    {requestVerifyOtp.error && (
                        <p className="text-sm text-red-500 bg-red-50 p-2 rounded-sm mt-2">
                            {requestVerifyOtp.error}
                        </p>
                    )}

                    <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
                        onClick={verifyOtp}
                    >
                        Verify OTP
                    </button>
                </div>
            )}
        </Fragment>
    )
}

const Setting = () => {
    // personal info
    const [reloadRandomNum, setReloadRandomNum] = useState(0);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
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
    }, [reloadRandomNum]);

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
            setEmail(response.data.email);
            setEmailVerified(response.data.emailVerified);
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

    const clearEmail = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/api-keys/userEmailVerifyClear`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setReloadRandomNum(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error clearing email:", error);
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const response = await axiosCustom.post(
                `/api/user/crud/updateUser`,
                { name, email, dateOfBirth, profilePictureLink, bio, city, state, zipCode, country },
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                {!emailVerified && (
                    <InputEmailVerify
                        setReloadRandomNum={setReloadRandomNum}
                    />
                )}
                {emailVerified && (
                    <Fragment>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                                Email
                                <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                                    Valid
                                </span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={email}
                                disabled
                            />
                            <div className="mb-2">
                                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-sm mt-2">
                                    <strong>Warning:</strong> Please ensure your email address is correct if provided,
                                    as it will be used for login notifications, daily AI summaries,
                                    server status updates, and other important communications.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
                                onClick={clearEmail}
                            >
                                Clear
                            </button>
                        </div>
                    </Fragment>
                )}
                <div className="mb-4">
                    <label htmlFor="dateOfBirth" className="block text-gray-700 font-bold mb-2">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm focus:outline-none focus:shadow-outline"
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