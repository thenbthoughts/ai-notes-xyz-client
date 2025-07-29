import { useState, useEffect, Fragment } from "react";
import { DateTime } from "luxon";
import { LucideCake, LucideClock, LucideQuote } from 'lucide-react';
import axiosCustom from "../../../config/axiosCustom";
import { Link } from "react-router-dom";

const ComponentFromBrithdayToToday = () => {
    const [birthday, setBirthday] = useState('0000-00-00');
    const [age, setAge] = useState({ years: 0 });
    const [nextBirthday, setNextBirthday] = useState('');
    const [timeRemaining, setTimeRemaining] = useState('');
    const [totalMonths, setTotalMonths] = useState(0);
    const [totalDays, setTotalDays] = useState(0);
    const [totalHours, setTotalHours] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0);

    useEffect(() => {
        const calculateAgeAndTimeRemaining = () => {
            if(birthday === '0000-00-00') {
                return;
            }
            
            const birthDate = DateTime.fromISO(birthday);
            const now = DateTime.local(); // Use local time
            const { years, months } = now.diff(birthDate, ['years', 'months']).toObject();
            setAge({ years: years || 0 });

            // Calculate total months, days, hours, and seconds from birth
            setTotalMonths(Math.floor((years || 0) * 12 + (months || 0)));
            setTotalDays(Math.floor(now.diff(birthDate, 'days').days));
            setTotalHours(Math.floor(now.diff(birthDate, 'hours').hours));
            setTotalSeconds(Math.floor(now.diff(birthDate, 'seconds').seconds));

            // Calculate next birthday
            const nextBirthdayDate = birthDate.plus({ years: Math.floor(years || 0) + 1 });
            setNextBirthday(nextBirthdayDate.toLocaleString(DateTime.DATE_MED));

            // Calculate time remaining until next birthday
            const timeDiff = nextBirthdayDate.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();
            setTimeRemaining(`${Math.floor(timeDiff.days || 0)}d, ${Math.floor(timeDiff.hours || 0)}h, ${Math.floor(timeDiff.minutes || 0)}m, ${Math.floor(timeDiff.seconds || 0)}s`);
        };

        calculateAgeAndTimeRemaining();
        const interval = setInterval(calculateAgeAndTimeRemaining, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, [birthday]);

    useEffect(() => {
        fetchUser();
    }, [])

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
            const fetchedBirthday = response.data.dateOfBirth;
            if (DateTime.fromISO(fetchedBirthday).isValid) {
                setBirthday(fetchedBirthday);
            } else {
                console.error("Invalid date format for birthday:", fetchedBirthday);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    return (
        <div>
            {/* Birthday set */}
            {birthday !== '0000-00-00' && (
                <Fragment>
                    <div className="text-left p-2 border border-blue-400 rounded-md shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-1 hover:bg-blue-200 transition duration-300">
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-semibold text-blue-700">
                                <LucideClock size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                                Your Age: {Math.floor(age.years)} <span className="text-gray-600">Yrs</span>
                                <p className="text-xs font-medium text-blue-600">
                                    ({totalMonths.toLocaleString()} months, {totalDays.toLocaleString()} days, {totalHours.toLocaleString()} hours, {totalSeconds.toLocaleString()} seconds)
                                </p>
                            </p>
                        </div>
                    </div>
                    <div className="text-left p-2 border border-green-400 rounded-md shadow-md bg-gradient-to-r from-green-100 to-green-300 mb-1 hover:bg-green-200 transition duration-300">
                        <h2 className="text-lg font-bold mb-0 text-green-800">
                            <LucideCake size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                            Next Birthday
                        </h2>
                        <p className="text-sm font-semibold text-green-700">{nextBirthday} | {timeRemaining}</p>
                    </div>
                </Fragment>
            )}

            {/* New Section for Achievements */}
            <div className="text-left p-2 border border-yellow-400 rounded-md shadow-md bg-gradient-to-r from-yellow-100 to-yellow-300 mb-2 hover:bg-yellow-200 transition duration-300">
                <h2 className="text-lg font-bold mb-0 text-yellow-800">
                    <LucideQuote size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Quote
                </h2>
                <p className="text-sm font-semibold text-yellow-700">
                    "Set a goal.
                    Break it into tiny steps.
                    Work on them one by one.
                    And don't forget—life's meant to be enjoyed too!"
                    {/* Purchase, Experience, Learn, Earn, Enjoy, Dream, Achieve, Health, Help, Sometime Stop, Sometime Start, Sometime Continue. */}
                </p>
            </div>

            {/* Birthday not set yet */}
            {birthday === '0000-00-00' && (
                <Link to="/user/setting" className="text-left p-2 border border-red-400 rounded-md shadow-md bg-gradient-to-r from-red-100 to-red-300 hover:bg-red-200 transition duration-300 block">
                    <p className="text-sm font-semibold text-red-700">
                        No birthday set yet. Click here to set your birthday.
                    </p>
                </Link>
            )}
        </div>
    );
};

export default ComponentFromBrithdayToToday;