import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ComponentNotesList from "./ComponentNotesList";
import ComponentNotesEdit from "./ComponentNotesEdit/ComponentNotesEdit";
import { notesQuickDailyNotesAddAxios } from "../utils/notesListAxios";

const ComponentRightWrapper = ({
    refreshRandomNumParent,
}: {
    refreshRandomNumParent: number;
}) => {
    const navigate = useNavigate();
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
                <h1 className="text-3xl font-extrabold mb-2 drop-shadow-md">Notes</h1>
                <p className="text-lg font-medium drop-shadow-sm">Notes are a great way to keep track of information. You can add, edit, and delete notes as you wish.</p>
                <div>
                    <button 
                        className="mt-3 px-4 py-2 bg-white text-yellow-600 font-semibold rounded-lg shadow-md hover:bg-yellow-50 hover:shadow-lg transition-all duration-200 ease-in-out"
                        onClick={async () => {
                            const result = await notesQuickDailyNotesAddAxios();
                            if (result.success.length > 0) {
                                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`);
                            }
                        }}
                    >
                        Quick Daily Notes
                    </button>
                </div>
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