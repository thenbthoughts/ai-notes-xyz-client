import { LucideEdit, LucideStar, LucideTrash2 } from "lucide-react";
import { INotes } from "../../../../../types/pages/tsNotes";
import { Link } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import { Fragment, useState } from "react";

const ComponentNotesItem = ({
    noteObj,
}: {
    noteObj: INotes
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
                url: `/api/notes/crud/notesDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: noteObj._id,
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
                <h3>{noteObj.title}</h3>

                {/* labels */}
                <div className="my-1 flex flex-wrap gap-2">
                    {/* created date */}
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Created:{'  '}
                        {new Date(noteObj.createdAtUtc).toLocaleDateString()}
                    </span>
                    {/* updated date */}
                    <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Updated: {new Date(noteObj.updatedAtUtc).toLocaleDateString()}
                    </span>
                    {/* star */}
                    {noteObj.isStar && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            <LucideStar className="inline-block mr-1" style={{ height: '15px', top: '-2px', position: 'relative' }} /> Stared
                        </span>
                    )}
                    {/* tags */}
                    {noteObj.tags.map((tagStr, tagIndex) => (
                        <span
                            className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                            key={tagIndex}
                        >{tagStr}</span>
                    ))}
                    {/* ai tags */}
                    {noteObj.aiTags.map((tagStr, tagIndex) => (
                        <span
                            className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                            key={tagIndex}
                        >{tagStr}</span>
                    ))}
                </div>

                {/* actions */}
                <div>
                    <div className="action-buttons my-4">
                        {noteObj.description.trim().length >= 1 && (
                            <button
                                className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200 mr-1"
                                onClick={() => {
                                    setIsExpandedDescription(!isExpandedDescription)
                                }}
                            >
                                {isExpandedDescription ? 'Hide Description' : 'Show Description'}
                            </button>
                        )}
                        {noteObj.aiSummary.trim().length >= 1 && (
                            <button
                                className="px-3 py-1 rounded bg-purple-100 text-purple-800 text-sm font-semibold hover:bg-purple-200 mr-1"
                                onClick={() => {
                                    setIsExpandedAiSummary(!isExpandedAiSummary)
                                }}
                            >
                                AI Summary
                            </button>
                        )}
                        <Link
                            to={`/user/notes?action=edit&id=${noteObj._id}&workspace=${noteObj.notesWorkspaceId}`}
                            className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 mr-1"
                        >
                            <LucideEdit
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Edit
                        </Link>
                        <button
                            className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 mr-1"
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
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded p-1">{noteObj.description}</p>
                )}

                {/* ai summary */}
                {isExpandedAiSummary && (
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded p-1">{noteObj.aiSummary}</p>
                )}
            </Fragment>
        )
    }

    return (
        <div
            className="my-2 py-2 bg-white rounded px-2"
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

export default ComponentNotesItem;