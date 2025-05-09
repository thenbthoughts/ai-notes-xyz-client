import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ComponentLifeEventsList from "./ComponentLifeEventsList";

const ComponentRightWrapper = ({
    stateDisplayAdd,
    refreshRandomNumParent,
}: {
    stateDisplayAdd: boolean;
    refreshRandomNumParent: number;
}) => {
    const location = useLocation();
    const [pageName, setPageName] = useState({
        actionType: 'list'
    } as {
        actionType: 'list' | 'edit'
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempActionType = 'list' as 'list' | 'edit';
        const actionType = queryParams.get('action') || 'life';
        if (actionType === 'edit') {
            tempActionType = actionType;
        }
        setPageName({
            actionType: tempActionType,
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
                    Life Events {'->'} Edit
                </div>
            )}
        </div>
    );
};

export default ComponentRightWrapper;