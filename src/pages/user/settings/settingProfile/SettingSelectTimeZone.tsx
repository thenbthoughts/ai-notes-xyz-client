import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import {
    getAllTimezones
} from 'countries-and-timezones';

import { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

const timeZoneArr = getAllTimezones();

const SettingSelectTimeZone = () => {
    // location
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const [timeZoneRegion, setTimeZoneRegion] = useState('Asia/Kolkata');
    const [timeZoneUtcOffset, setTimeZoneUtcOffset] = useState(330);

    useEffect(() => {
        console.log('CT: ', timeZoneArr);
    }, [])

    // success or failed
    const [
        request,
        setRequest,
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const handleUpdate = async () => {
        setRequest({ loading: true, success: '', error: '' });

        try {
            const response = await axiosCustom.post(
                `/api/user/timezone-revalidate/revalidate`,
                {
                    timeZoneRegion: timeZoneRegion,
                    timeZoneUtcOffset: timeZoneUtcOffset,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            setRequest({ loading: false, success: 'User updated successfully!', error: '' });
            console.log("User updated:", response.data);
        } catch (error) {
            console.error("Error updating user:", error);
            setRequest({ loading: false, success: '', error: 'Error updating user. Please try again.' });
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
                <h2 className="text-xl font-bold text-gray-900 py-2">Set Default Timezone</h2>

                {/* Timezone */}
                <div className="mb-4">
                    <label htmlFor="apiKeyGroq" className="block text-gray-700 font-bold mb-2">
                        Set timezone
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={timeZoneRegion}
                        onChange={(e) => {
                            const tzName = e.target.value;
                            setTimeZoneRegion(tzName);
                            const tzObj = Object.values(timeZoneArr).find(tz => tz.name === tzName);
                            if (tzObj) {
                                setTimeZoneUtcOffset(tzObj.utcOffset);
                            }
                        }}
                    >
                        {Object.values(timeZoneArr).map((tz) => (
                            <option key={tz.name} value={tz.name}>
                                {tz.name} {tz.utcOffset} (UTC{tz.utcOffsetStr})
                            </option>
                        ))}
                    </select>
                    <div className="mt-2">
                        {request.loading && (
                            <p className="text-gray-500">Loading...</p>
                        )}
                        {!request.loading && request.success !== '' && (
                            <p className="text-green-500">{request.success}</p>
                        )}
                        {!request.loading && request.error !== '' && (
                            <p className="text-red-500">{request.error}</p>
                        )}
                    </div>
                </div>
                
                {request.success !== "" && (
                    <p className="rounded px-2 bg-green-100 text-green-500 text-sm py-2">{request.success}</p>
                )}
                {request.error !== "" && (
                    <p className="rounded px-2 bg-red-100 text-red-500 text-sm py-2">{request.error}</p>
                )}
                {request.loading && (
                    <button
                        className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                        Updating...
                    </button>
                )}
                {!request.loading && (
                    <button
                        onClick={handleUpdate}
                        className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                        Update timezone
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="pt-5">
            {renderApiKeys()}
        </div>
    );
};

export default SettingSelectTimeZone;