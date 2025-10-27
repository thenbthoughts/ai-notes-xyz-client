import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ComponentNotesList from "./ComponentNotesList";
import ComponentNotesEdit from "./ComponentNotesEdit/ComponentNotesEdit";

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
        actionType: 'list' | 'edit',
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
                if(recordId.length === 24) {
                    tempRecordId = recordId;
                    tempActionType = 'edit';
                }
            }
        }
        setPageName({
            actionType: tempActionType,
            recordId: tempRecordId,
        });
    }, [
        location.search,
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
                <h1 className="text-3xl font-extrabold mb-2 drop-shadow-md">Schedule</h1>
                <p className="text-lg font-medium drop-shadow-sm">Schedule your tasks and events.</p>
            </div>

            {pageName.actionType === 'list' && (
                <div>
                    <ComponentNotesList />
                </div>
            )}
            {pageName.actionType === 'edit' && (
                <div>
                    <ComponentNotesEdit
                        recordId={pageName.recordId}
                    />
                </div>
            )}
        </div>
    );
};

export default ComponentRightWrapper;