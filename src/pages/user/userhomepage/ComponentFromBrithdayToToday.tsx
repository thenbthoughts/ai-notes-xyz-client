import { useState, useEffect, Fragment } from 'react';
import { DateTime } from 'luxon';
import { LucideCake, LucideClock, LucideQuote } from 'lucide-react';
import axiosCustom from '../../../config/axiosCustom';
import { Link } from 'react-router-dom';

const panel =
    'rounded-lg border border-zinc-200/90 bg-white p-2.5 shadow-sm transition hover:shadow';
const panelTitle = 'flex items-center gap-1.5 text-xs font-semibold text-zinc-800';
const mutedText = 'text-[11px] leading-snug text-zinc-500';

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
            if (birthday === '0000-00-00') {
                return;
            }

            const birthDate = DateTime.fromISO(birthday);
            const now = DateTime.local();
            const { years, months } = now.diff(birthDate, ['years', 'months']).toObject();
            setAge({ years: years || 0 });

            setTotalMonths(Math.floor((years || 0) * 12 + (months || 0)));
            setTotalDays(Math.floor(now.diff(birthDate, 'days').days));
            setTotalHours(Math.floor(now.diff(birthDate, 'hours').hours));
            setTotalSeconds(Math.floor(now.diff(birthDate, 'seconds').seconds));

            const nextBirthdayDate = birthDate.plus({ years: Math.floor(years || 0) + 1 });
            setNextBirthday(nextBirthdayDate.toLocaleString(DateTime.DATE_MED));

            const timeDiff = nextBirthdayDate.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();
            setTimeRemaining(
                `${Math.floor(timeDiff.days || 0)}d, ${Math.floor(timeDiff.hours || 0)}h, ${Math.floor(timeDiff.minutes || 0)}m, ${Math.floor(timeDiff.seconds || 0)}s`
            );
        };

        calculateAgeAndTimeRemaining();
        const interval = setInterval(calculateAgeAndTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [birthday]);

    useEffect(() => {
        void fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/crud/getUser`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            const fetchedBirthday = response.data.dateOfBirth;
            if (DateTime.fromISO(fetchedBirthday).isValid) {
                setBirthday(fetchedBirthday);
            } else {
                console.error('Invalid date format for birthday:', fetchedBirthday);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    return (
        <div className="space-y-2">
            {birthday !== '0000-00-00' && (
                <Fragment>
                    <div className={`${panel} border-l-[3px] border-l-sky-400`}>
                        <p className={`${panelTitle} mb-1`}>
                            <LucideClock className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                            Your age
                        </p>
                        <p className="text-base font-semibold text-zinc-900">
                            {Math.floor(age.years)}{' '}
                            <span className="text-xs font-normal text-zinc-500">years</span>
                        </p>
                        <p className={`${mutedText} mt-0.5`}>
                            {totalMonths.toLocaleString()} mo · {totalDays.toLocaleString()} d ·{' '}
                            {totalHours.toLocaleString()} h · {totalSeconds.toLocaleString()} s
                        </p>
                    </div>
                    <div className={`${panel} border-l-[3px] border-l-emerald-500`}>
                        <h2 className={`${panelTitle} mb-1`}>
                            <LucideCake className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
                            Next birthday
                        </h2>
                        <p className="text-xs font-medium text-zinc-700">
                            {nextBirthday}
                            <span className="text-zinc-400"> · </span>
                            {timeRemaining}
                        </p>
                    </div>
                </Fragment>
            )}

            <div className={`${panel} border-l-[3px] border-l-amber-400`}>
                <h2 className={`${panelTitle} mb-1`}>
                    <LucideQuote className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
                    Quote
                </h2>
                <p className="text-xs leading-relaxed text-zinc-600">
                    &ldquo;Set a goal. Break it into tiny steps. Work on them one by one. And don&apos;t
                    forget—life&apos;s meant to be enjoyed too!&rdquo;
                </p>
            </div>

            {birthday === '0000-00-00' && (
                <Link
                    to="/user/setting"
                    className={`${panel} block border-l-[3px] border-l-rose-400 transition hover:bg-rose-50/50`}
                >
                    <p className="text-xs font-medium text-rose-800">
                        No birthday set yet. Open settings to add your date of birth.
                    </p>
                </Link>
            )}
        </div>
    );
};

export default ComponentFromBrithdayToToday;
