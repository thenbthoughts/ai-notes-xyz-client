import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ComponentNotesList from './ComponentNotesList';
import ComponentNotesEdit from './ComponentNotesEdit/ComponentNotesEdit';

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
        actionType: 'list' | 'edit';
        recordId: string;
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempActionType = 'list' as 'list' | 'edit';
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
        }
        setPageName({
            actionType: tempActionType,
            recordId: tempRecordId,
        });
    }, [location.search, refreshRandomNumParent]);

    const subtitle =
        pageName.actionType === 'edit'
            ? 'Edit scheduled job'
            : 'Automations, reminders, and AI summaries';

    return (
        <div
            className="min-h-0 overflow-y-auto bg-[#f4f4f5] px-2 py-2 md:px-3"
            style={{ height: 'calc(100vh - 60px)' }}
        >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                <div className="min-w-0">
                    <h1 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">
                        Task schedule
                    </h1>
                    <p className="text-[11px] text-zinc-500 md:text-xs">{subtitle}</p>
                </div>
            </div>

            {pageName.actionType === 'list' && <ComponentNotesList />}
            {pageName.actionType === 'edit' && (
                <ComponentNotesEdit recordId={pageName.recordId} />
            )}
        </div>
    );
};

export default ComponentRightWrapper;
