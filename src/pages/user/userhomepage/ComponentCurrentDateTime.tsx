import {
    LucideClock,
    LucideChevronDown,
    LucideChevronUp,
    LucideEye,
    LucideEyeOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const panel =
    'rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2.5 shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:shadow-lg hover:shadow-sky-200/40';
const panelHeader = 'mb-1.5 flex items-center justify-between gap-1.5';
const panelTitle = 'flex items-center gap-1.5 text-xs font-bold text-sky-900';
const panelIconBtn =
    'rounded-xl border-2 border-sky-200/70 bg-sky-50/80 p-1 text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 disabled:opacity-40';
const mutedText = 'text-[11px] leading-snug font-medium text-sky-700/75';

const HomepageDateTimeComponent = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTimeExpanded, setIsTimeExpanded] = useState(true);
    const [is24HourFormat, setIs24HourFormat] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleTimeFormat = () => {
        setIs24HourFormat(!is24HourFormat);
        toast.success(`Switched to ${!is24HourFormat ? '24' : '12'}-hour format`);
    };

    return (
        <div className={`${panel} border-l-4 border-l-sky-400`}>
            <div className={panelHeader}>
                <h2 className={panelTitle}>
                    <LucideClock className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                    Current time
                </h2>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={toggleTimeFormat}
                        className={panelIconBtn}
                        title={`Switch to ${is24HourFormat ? '12' : '24'}-hour format`}
                    >
                        {is24HourFormat ? (
                            <LucideEye className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                        ) : (
                            <LucideEyeOff className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTimeExpanded(!isTimeExpanded)}
                        className={panelIconBtn}
                        title="Toggle"
                    >
                        {isTimeExpanded ? (
                            <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                            <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                    </button>
                </div>
            </div>

            {isTimeExpanded && (
                <div className="space-y-1.5">
                    <div className="rounded-xl border-2 border-sky-200/80 bg-sky-50/90 px-2 py-1.5 font-mono text-sm font-bold tabular-nums tracking-tight text-sky-950">
                        {is24HourFormat
                            ? currentTime.toLocaleTimeString('en-GB', { hour12: false })
                            : currentTime.toLocaleTimeString()}
                    </div>
                    <div className={`rounded-xl border border-sky-100 bg-sky-50/60 px-2 py-1.5 ${mutedText}`}>
                        {currentTime.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageDateTimeComponent;
