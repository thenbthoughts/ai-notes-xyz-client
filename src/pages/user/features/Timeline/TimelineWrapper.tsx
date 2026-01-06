import ComponentTimelineList from './ComponentTimelineList.tsx';

const TimelineWrapper = () => {

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
        }}>
            <div className='container mx-auto px-1'>
                <ComponentTimelineList
                    refreshRandomNumParent={0}
                />
            </div>
        </div>
    );
};

export default TimelineWrapper;

