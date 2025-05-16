import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ComponentLifeEventsList from "./ComponentLifeEventsList";
import ComponentLifeEventsEdit from "./ComponentLifeEventsEdit";
import PageLifeEventCategoryCrud from "./PageLifeEventCategoryCrud/PageLifeEventCategoryCrud";

const ComponentRightWrapper = ({
    stateDisplayAdd,
    refreshRandomNumParent,
}: {
    stateDisplayAdd: boolean;
    refreshRandomNumParent: number;
}) => {
    const location = useLocation();
    const [pageName, setPageName] = useState({
        actionType: 'list',
        recordId: '',
    } as {
        actionType: 'list' | 'edit' | 'category',
        recordId: string;
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempActionType = 'list' as 'list' | 'edit' | 'category';
        let tempRecordId = '';
        const actionType = queryParams.get('action') || 'list';

        if (actionType === 'edit') {
            const recordId = queryParams.get('id');
            if (typeof recordId === 'string') {
                if(recordId.length === 24) {
                    tempRecordId = recordId;
                    tempActionType = 'edit';
                }
            }
        } else if (actionType === 'category') {
            tempActionType = 'category';
        }
        setPageName({
            actionType: tempActionType,
            recordId: tempRecordId,
        });
    }, [
        location.search,
        stateDisplayAdd,
        refreshRandomNumParent,
    ]);

    return (
        <div
            style={{
                height: 'calc(100vh - 60px)',
                overflowY: 'scroll'
            }}
            className="p-1 md:p-3"
        >

            <div className="mb-6 p-4 rounded-lg shadow-lg text-white bg-yellow-500">
                <h1 className="text-3xl font-extrabold mb-2 drop-shadow-md">Life Events</h1>
                <p className="text-lg font-medium drop-shadow-sm">Keep track of important moments in your life</p>
            </div>

            {pageName.actionType === 'list' && (
                <div>
                    <ComponentLifeEventsList />
                </div>
            )}
            {pageName.actionType === 'edit' && (
                <div>
                    <ComponentLifeEventsEdit
                        recordId={pageName.recordId}
                    />
                </div>
            )}
            {pageName.actionType === 'category' && (
                <div>
                    <PageLifeEventCategoryCrud />
                </div>
            )}
        </div>
    );
};

export default ComponentRightWrapper;