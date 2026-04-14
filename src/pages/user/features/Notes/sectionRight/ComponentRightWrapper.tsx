import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LucideCalendarPlus } from "lucide-react";
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
            className={
                pageName.actionType === 'edit'
                    ? 'h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden bg-[#f6f6f4] px-3 sm:px-0'
                    : 'h-full min-h-0 min-w-0 max-w-full overflow-y-auto px-2 py-1 bg-zinc-50/80'
            }
        >
            {pageName.actionType === 'list' && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200/80 bg-white px-2 py-1.5 text-xs text-zinc-600">
                    <span className="font-medium text-zinc-800">Notes</span>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100"
                        onClick={async () => {
                            const result = await notesQuickDailyNotesAddAxios();
                            if (result.success.length > 0) {
                                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`);
                            }
                        }}
                    >
                        <LucideCalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Quick daily
                    </button>
                </div>
            )}

            {pageName.actionType === 'list' && (
                <div>
                    <ComponentNotesList />
                </div>
            )}
            {pageName.actionType === 'edit' && (
                <ComponentNotesEdit
                    recordId={pageName.recordId}
                />
            )}
        </div>
    );
};

export default ComponentRightWrapper;
