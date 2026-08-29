import ComponentTimelineList from './ComponentTimelineList.tsx';

const TimelineWrapper = () => {
    return (
        <div className="mx-auto max-w-[1000px] px-2 py-3 sm:px-3">
            <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/95 p-3 shadow-lg shadow-black/10 backdrop-blur-sm sm:p-4">
                <ComponentTimelineList refreshRandomNumParent={0} />
            </div>
        </div>
    );
};

export default TimelineWrapper;
