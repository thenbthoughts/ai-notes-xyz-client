import { LucideEdit, LucideStar, LucideTrash2 } from 'lucide-react';
import { IInfoVault } from '../../../../../types/pages/tsInfoVault';
import { Link } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom';
import { Fragment, useState } from 'react';

const ComponentInfoVaultItem = ({
    infoVaultObj,
}: {
    infoVaultObj: IInfoVault;
}) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [isExpandedDescription, setIsExpandedDescription] = useState(false);
    const [isExpandedAiSummary, setIsExpandedAiSummary] = useState(false);

    const deleteItem = async () => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this item?');
            if (!confirmDelete) {
                return;
            }

            const config = {
                method: 'post',
                url: `/api/info-vault/crud/infoVaultDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: infoVaultObj._id,
                },
            };

            await axiosCustom.request(config);

            setIsDeleted(true);
        } catch (error) {
            console.error(error);
        }
    };

    const chip =
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium';

    const renderItem = () => {
        return (
            <Fragment>
                <h3 className="text-sm font-semibold leading-snug text-zinc-900">
                    {infoVaultObj.name}
                </h3>

                <div className="my-1.5 flex flex-wrap gap-1">
                    <span className={`${chip} border-zinc-200 bg-zinc-50 text-zinc-700`}>
                        Created {new Date(infoVaultObj.createdAtUtc).toLocaleDateString()}
                    </span>
                    <span className={`${chip} border-zinc-200 bg-white text-zinc-600`}>
                        Updated {new Date(infoVaultObj.updatedAtUtc).toLocaleDateString()}
                    </span>
                    {infoVaultObj.isFavorite && (
                        <span className={`${chip} border-amber-200 bg-amber-50 text-amber-900`}>
                            <LucideStar className="mr-0.5 h-3 w-3" strokeWidth={2} fill="currentColor" />
                            Starred
                        </span>
                    )}
                    {infoVaultObj.tags.map((tagStr, tagIndex) => (
                        <span
                            className={`${chip} border-emerald-200 bg-emerald-50 text-emerald-900`}
                            key={tagIndex}
                        >
                            {tagStr}
                        </span>
                    ))}
                    {infoVaultObj.aiTags.map((tagStr, tagIndex) => (
                        <span
                            className={`${chip} border-indigo-200 bg-indigo-50 text-indigo-900`}
                            key={tagIndex}
                        >
                            {tagStr}
                        </span>
                    ))}
                </div>

                <div className="action-buttons mt-2 flex flex-wrap gap-1">
                    {infoVaultObj.notes.trim().length >= 1 && (
                        <button
                            type="button"
                            className="rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 hover:bg-zinc-50"
                            onClick={() => setIsExpandedDescription(!isExpandedDescription)}
                        >
                            {isExpandedDescription ? 'Hide notes' : 'Notes'}
                        </button>
                    )}
                    {infoVaultObj.aiSummary.trim().length >= 1 && (
                        <button
                            type="button"
                            className="rounded-sm border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-900 hover:bg-indigo-100"
                            onClick={() => setIsExpandedAiSummary(!isExpandedAiSummary)}
                        >
                            AI summary
                        </button>
                    )}
                    <Link
                        to={`/user/info-vault?action=edit&id=${infoVaultObj._id}`}
                        className="inline-flex items-center gap-1 rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                        <LucideEdit className="h-3 w-3" strokeWidth={2} />
                        Edit
                    </Link>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800 hover:bg-red-100"
                        onClick={deleteItem}
                    >
                        <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                        Delete
                    </button>
                </div>

                {isExpandedDescription && (
                    <p className="mb-2 mt-1.5 whitespace-pre-wrap rounded-sm border border-zinc-200 bg-zinc-50/80 p-2 text-xs text-zinc-800">
                        {infoVaultObj.notes}
                    </p>
                )}

                {isExpandedAiSummary && (
                    <p className="mb-2 mt-1.5 whitespace-pre-wrap rounded-sm border border-indigo-100 bg-indigo-50/50 p-2 text-xs text-zinc-800">
                        {infoVaultObj.aiSummary}
                    </p>
                )}
            </Fragment>
        );
    };

    return (
        <div className="rounded-sm border border-zinc-200 bg-white px-2.5 py-2 shadow-sm">
            {isDeleted && (
                <div className="rounded-sm border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-700">
                    This item has been deleted.
                </div>
            )}
            {!isDeleted && <Fragment>{renderItem()}</Fragment>}
        </div>
    );
};

export default ComponentInfoVaultItem;
