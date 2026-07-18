import ComponentTimelineFiles from './ComponentTimelineFiles.tsx';

const TimelineFilesWrapper = () => {
    return (
        <div className="mx-auto max-w-[1000px] px-2 py-3 sm:px-3">
            <div className="rounded-xl border border-white/40 bg-white/95 p-3 shadow-lg shadow-black/10 backdrop-blur-sm sm:p-4">
                <ComponentTimelineFiles />
            </div>
        </div>
    );
};

export default TimelineFilesWrapper;
