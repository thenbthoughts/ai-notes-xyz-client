import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ComponentInfoVaultList from './ComponentInfoVaultList';
import ComponentInfoVaultEdit from './ComponentInfoVaultEdit/ComponentInfoVaultEdit';

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

    return (
        <div
            className="min-h-0 overflow-y-auto bg-[#f4f4f5] px-2 py-2 md:px-3"
            style={{ height: 'calc(100vh - 60px)' }}
        >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                <div className="min-w-0">
                    <h1 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">
                        Info Vault
                    </h1>
                    <p className="text-[11px] text-zinc-500 md:text-xs">
                        {pageName.actionType === 'edit'
                            ? 'Edit entry'
                            : 'Stored contacts, places, and records for AI context'}
                    </p>
                </div>
            </div>

            {pageName.actionType === 'list' && <ComponentInfoVaultList />}
            {pageName.actionType === 'edit' && (
                <ComponentInfoVaultEdit recordId={pageName.recordId} />
            )}
        </div>
    );
};

export default ComponentRightWrapper;
