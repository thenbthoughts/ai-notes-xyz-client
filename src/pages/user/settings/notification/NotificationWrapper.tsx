import ComponentNotificationList from './sectionRight/ComponentNotificationList.tsx';

const NotificationWrapper = () => {

    return (
        <div className='container mx-auto px-1'>
            <div
                style={{
                    width: '800px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    margin: '0 auto'
                }}
            >
                <ComponentNotificationList />
            </div>
        </div>
    );
};

export default NotificationWrapper;