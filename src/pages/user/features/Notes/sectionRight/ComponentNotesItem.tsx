import { LucideEdit, LucideStar, LucideTrash2 } from "lucide-react";
import { INotes } from "../../../../../types/pages/tsNotes";
import { Link } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import { Fragment, useState } from "react";

const chip =
    "inline-block rounded-md border border-zinc-200/70 bg-zinc-50/90 text-[10px] font-medium text-zinc-600 px-1.5 py-0 leading-5";

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
                <div className="flex min-w-0 items-start justify-between gap-1">
                    <h3 className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight text-zinc-800" title={noteObj.title}>
                        {noteObj.title}
                    </h3>
                    {noteObj.isStar && (
                        <LucideStar className="h-3.5 w-3.5 shrink-0 text-amber-500 fill-amber-400" strokeWidth={1.75} />
                    )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className={chip}>
                        C {new Date(noteObj.createdAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={chip}>
                        U {new Date(noteObj.updatedAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {noteObj.tags.map((tagStr, tagIndex) => (
                        <span className={chip + ' border-amber-200 bg-amber-50 text-amber-900'} key={tagIndex}>
                            {tagStr}
                        </span>
                    ))}
                    {noteObj.aiTags.map((tagStr, tagIndex) => (
                        <span className={chip + ' border-indigo-200 bg-indigo-50 text-indigo-900'} key={tagIndex}>
                            {tagStr}
                        </span>
                    ))}
                </div>

                <div className="mt-1 flex flex-wrap gap-0.5">
                    {noteObj.description.trim().length >= 1 && (
                        <button
                            type="button"
                            className="rounded-lg border border-zinc-200/80 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                            onClick={() => {
                                setIsExpandedDescription(!isExpandedDescription)
                            }}
                        >
                            {isExpandedDescription ? 'Hide' : 'Desc'}
                        </button>
                    )}
                    {noteObj.aiSummary.trim().length >= 1 && (
                        <button
                            type="button"
                            className="rounded-lg border border-zinc-200/80 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                            onClick={() => {
                                setIsExpandedAiSummary(!isExpandedAiSummary)
                            }}
                        >
                            AI
                        </button>
                    )}
                    <Link
                        to={`/user/notes?action=edit&id=${noteObj._id}&workspace=${noteObj.notesWorkspaceId}`}
                        className="inline-flex items-center rounded-lg border border-zinc-200/80 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                    >
                        <LucideEdit className="mr-0.5 h-3 w-3" strokeWidth={2} />
                        Edit
                    </Link>
                    <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-red-200/70 bg-red-50/90 px-1.5 py-0.5 text-[11px] font-medium text-red-800 transition-colors hover:bg-red-100"
                        onClick={deleteItem}
                    >
                        <LucideTrash2 className="mr-0.5 h-3 w-3" strokeWidth={2} />
                        Del
                    </button>
                </div>

                {isExpandedDescription && (
                    <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200/70 bg-white p-2 text-xs leading-relaxed text-zinc-700">
                        {noteObj.description}
                    </p>
                )}

                {isExpandedAiSummary && (
                    <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200/70 bg-white p-2 text-xs leading-relaxed text-zinc-700">
                        {noteObj.aiSummary}
                    </p>
                )}
            </Fragment>
        )
    }

    return (
        <div className="my-0 rounded-xl border border-zinc-200/60 bg-white px-2 py-1.5 shadow-sm sm:my-0.5 sm:px-2.5 sm:py-2">
            {isDeleted && (
                <div className="rounded-lg border border-red-200/80 bg-red-50 p-1.5 text-xs text-red-700">Deleted.</div>
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
