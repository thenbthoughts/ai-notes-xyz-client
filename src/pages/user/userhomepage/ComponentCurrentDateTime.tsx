import {
    LucideClock,
    LucideChevronDown,
    LucideChevronUp,
    LucideEye,
    LucideEyeOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const HomepageDateTimeComponent = () => {

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTimeExpanded, setIsTimeExpanded] = useState(true);
    const [is24HourFormat, setIs24HourFormat] = useState(false);

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [])

    const toggleTimeFormat = () => {
        setIs24HourFormat(!is24HourFormat);
        toast.success(`Switched to ${!is24HourFormat ? '24' : '12'}-hour format`);
    };

    return (
        <div className="text-left p-3 border border-teal-400 rounded-sm shadow-md bg-gradient-to-r from-teal-100 to-teal-300 mb-2 hover:bg-teal-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-teal-800">
                    <LucideClock size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Current Time
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={toggleTimeFormat}
                        className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                        title={`Switch to ${is24HourFormat ? '12' : '24'}-hour format`}
                    >
                        {is24HourFormat ?
                            <LucideEye size={16} className="text-teal-600" /> :
                            <LucideEyeOff size={16} className="text-teal-600" />
                        }
                    </button>
                    <button
                        onClick={() => setIsTimeExpanded(!isTimeExpanded)}
                        className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                        title="Toggle Expand"
                    >
                        {isTimeExpanded ?
                            <LucideChevronUp size={16} className="text-teal-600" /> :
                            <LucideChevronDown size={16} className="text-teal-600" />
                        }
                    </button>
                </div>
            </div>

            {isTimeExpanded && (
                <div className="text-sm text-teal-700 space-y-2">
                    <div
                        className="font-semibold text-lg bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200"
                        // onClick={() => showNotification('Current time: ' + currentTime.toLocaleTimeString())}
                    >
                        {is24HourFormat
                            ? currentTime.toLocaleTimeString('en-GB', { hour12: false })
                            : currentTime.toLocaleTimeString()
                        }
                    </div>
                    <div className="text-xs bg-white bg-opacity-50 rounded-sm p-2">
                        {currentTime.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageDateTimeComponent;