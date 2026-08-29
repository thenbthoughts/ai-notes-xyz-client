import {
    LucideClock,
    LucideChevronDown,
    LucideChevronUp,
    LucideEye,
    LucideEyeOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { panel, panelHeader, panelIconBtn, panelTitle, mutedText } from './homepagePanelStyles';

const HomepageDateTimeComponent = () => {
    const [currentTime, setCurrentTime] = useState(() => {
        return new Date();
    });
    const [isTimeExpanded, setIsTimeExpanded] = useState(true);
    const [is24HourFormat, setIs24HourFormat] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const toggleTimeFormat = () => {
        setIs24HourFormat((prev) => {
            const next = !prev;
            toast.success(`Switched to ${next ? '24' : '12'}-hour format`);
            return next;
        });
    };

    const timeZoneLabel = (() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return 'UTC';
        }
    })();

    const timeZoneShort = (() => {
        try {
            const parts = currentTime.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ');
            return parts[parts.length - 1] || '';
        } catch {
            return '';
        }
    })();

    return (
        <div className={`${panel} border-l-4 border-l-sky-400`}>
            <div className={panelHeader}>
                <h2 className={panelTitle}>
                    <LucideClock className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
                    Current time
                </h2>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={toggleTimeFormat}
                        className={panelIconBtn}
                        aria-label={`Switch to ${is24HourFormat ? '12' : '24'}-hour format`}
                        title={`Switch to ${is24HourFormat ? '12' : '24'}-hour format`}
                    >
                        {is24HourFormat ? (
                            <LucideEye className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
                        ) : (
                            <LucideEyeOff className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsTimeExpanded((prev) => {
                                return !prev;
                            });
                        }}
                        className={panelIconBtn}
                        aria-label={isTimeExpanded ? 'Collapse current time' : 'Expand current time'}
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
                    <div className="rounded-xl border-2 border-sky-700/80 bg-zinc-800/90 px-2 py-1.5 font-mono text-sm font-bold tabular-nums tracking-tight text-sky-100">
                        {is24HourFormat
                            ? currentTime.toLocaleTimeString('en-GB', { hour12: false })
                            : currentTime.toLocaleTimeString()}
                    </div>
                    <div className={`rounded-xl border border-zinc-800 bg-zinc-800/60 px-2 py-1.5 ${mutedText}`}>
                        <div>
                            {currentTime.toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-sky-400/85">
                            {timeZoneLabel} {timeZoneShort ? `· ${timeZoneShort}` : ''}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageDateTimeComponent;
