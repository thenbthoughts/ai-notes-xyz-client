import { LucideEdit, LucideStar, LucideTrash2 } from "lucide-react";
import { IInfoVault } from "../../../../../types/pages/tsInfoVault";
import { Link } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import { Fragment, useState } from "react";

const ComponentInfoVaultItem = ({
    infoVaultObj,
}: {
    infoVaultObj: IInfoVault
}) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [isExpandedDescription, setIsExpandedDescription] = useState(false);
    const [isExpandedAiSummary, setIsExpandedAiSummary] = useState(false);

    const deleteItem = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
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
    }

    const renderItem = () => {
        return (
            <Fragment>
                {/* title */}
                <h3>{infoVaultObj.name}</h3>

                {/* labels */}
                <div className="my-1 flex flex-wrap gap-2">
                    {/* created date */}
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Created:{'  '}
                        {new Date(infoVaultObj.createdAtUtc).toLocaleDateString()}
                    </span>
                    {/* updated date */}
                    <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Updated: {new Date(infoVaultObj.updatedAtUtc).toLocaleDateString()}
                    </span>
                    {/* star */}
                    {infoVaultObj.isFavorite && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            <LucideStar className="inline-block mr-1" style={{ height: '15px', top: '-2px', position: 'relative' }} /> Stared
                        </span>
                    )}
                    {/* tags */}
                    {infoVaultObj.tags.map((tagStr, tagIndex) => (
                        <span
                            className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                            key={tagIndex}
                        >{tagStr}</span>
                    ))}
                    {/* ai tags */}
                    {infoVaultObj.aiTags.map((tagStr, tagIndex) => (
                        <span
                            className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                            key={tagIndex}
                        >{tagStr}</span>
                    ))}
                </div>

                {/* actions */}
                <div>
                    <div className="action-buttons my-4">
                        {infoVaultObj.notes.trim().length >= 1 && (
                            <button
                                className="px-3 py-1 rounded-sm bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200 mr-1"
                                onClick={() => {
                                    setIsExpandedDescription(!isExpandedDescription)
                                }}
                            >
                                {isExpandedDescription ? 'Hide Description' : 'Show Description'}
                            </button>
                        )}
                        {infoVaultObj.aiSummary.trim().length >= 1 && (
                            <button
                                className="px-3 py-1 rounded-sm bg-purple-100 text-purple-800 text-sm font-semibold hover:bg-purple-200 mr-1"
                                onClick={() => {
                                    setIsExpandedAiSummary(!isExpandedAiSummary)
                                }}
                            >
                                AI Summary
                            </button>
                        )}
                        <Link
                            to={`/user/info-vault?action=edit&id=${infoVaultObj._id}`}
                            className="px-3 py-1 rounded-sm bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 mr-1"
                        >
                            <LucideEdit
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Edit
                        </Link>
                        <button
                            className="px-3 py-1 rounded-sm bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 mr-1"
                            onClick={deleteItem}
                        >
                            <LucideTrash2
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Delete
                        </button>
                    </div>
                </div>

                {/* description */}
                {isExpandedDescription && (
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded-sm p-1">{infoVaultObj.notes}</p>
                )}

                {/* ai summary */}
                {isExpandedAiSummary && (
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded-sm p-1">{infoVaultObj.aiSummary}</p>
                )}
            </Fragment>
        )
    }

    return (
        <div
            className="my-2 py-2 bg-white rounded-sm px-2"
            style={{ borderBottom: '1px solid #ccc' }}
        >
            {isDeleted && (
                <div className="text-red-500 text-sm border border-red-500 p-2 rounded">This item has been deleted.</div>
            )}
            {!isDeleted && (
                <Fragment>
                    {renderItem()}
                </Fragment>
            )}
        </div>
    );
}

export default ComponentInfoVaultItem;