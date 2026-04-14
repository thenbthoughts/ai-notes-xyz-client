import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ComponentLifeEventsList from './ComponentLifeEventsList';
import ComponentLifeEventsEdit from './ComponentLifeEventsEdit';
import PageLifeEventCategoryCrud from './PageLifeEventCategoryCrud/PageLifeEventCategoryCrud';

const ComponentRightWrapper = ({
    refreshRandomNumParent,
}: {
    refreshRandomNumParent: number;
}) => {
    const location = useLocation();
    const [pageName, setPageName] = useState({
        actionType: 'list',
        recordId: '',
    } as {
        actionType: 'list' | 'edit' | 'category';
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
                if (recordId.length === 24) {
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
    }, [location.search, refreshRandomNumParent]);

    const subtitle =
        pageName.actionType === 'edit'
            ? 'Edit event'
            : pageName.actionType === 'category'
              ? 'Manage categories'
              : 'Timeline, milestones, and diary entries';

    return (
        <div
            className="min-h-0 overflow-y-auto bg-zinc-100/80 px-2 py-1.5 sm:px-3 sm:py-2"
            style={{ height: 'calc(100vh - 60px)' }}
        >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white px-2.5 py-1.5 shadow-sm sm:mb-2.5 sm:px-3 sm:py-2">
                <div className="min-w-0">
                    <h1 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">
                        Life events
                    </h1>
                    <p className="text-[11px] text-zinc-500 md:text-xs">{subtitle}</p>
                </div>
            </div>

            {pageName.actionType === 'list' && <ComponentLifeEventsList />}
            {pageName.actionType === 'edit' && (
                <ComponentLifeEventsEdit recordId={pageName.recordId} />
            )}
            {pageName.actionType === 'category' && <PageLifeEventCategoryCrud />}
        </div>
    );
};

export default ComponentRightWrapper;
