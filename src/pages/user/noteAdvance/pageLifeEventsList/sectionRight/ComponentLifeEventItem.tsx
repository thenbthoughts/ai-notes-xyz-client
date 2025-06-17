import { LucideCpu, LucideEdit, LucideExpand, LucideFile, LucideStar, LucideTrash2 } from "lucide-react";
import { tsLifeEventsItem } from "../../../../../types/pages/tsLifeEvents";
import { Link } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import { Fragment, useState } from "react";
import envKeys from "../../../../../config/envKeys";

const ComponentLifeEventItem = ({
    lifeEventObj,
}: {
    lifeEventObj: tsLifeEventsItem
}) => {
    const [
        isDeleted,
        setIsDeleted,
    ] = useState(false);

    const [isExpandedDescription, setIsExpandedDescription] = useState(false);
    const [isExpandedAiSummary, setIsExpandedAiSummary] = useState(false);

    const getImpactStr = () => {
        let impactStr = 'Very Low';
        if (lifeEventObj.eventImpact === 'very-low') {
            impactStr = 'Very Low';
        } else if (lifeEventObj.eventImpact === 'low') {
            impactStr = 'Low';
        } else if (lifeEventObj.eventImpact === 'medium') {
            impactStr = 'Medium';
        } else if (lifeEventObj.eventImpact === 'large') {
            impactStr = 'Large';
        } else if (lifeEventObj.eventImpact === 'huge') {
            impactStr = 'Huge';
        }
        return impactStr;
    }

    const getCategoryStr = () => {
        let categoryStr = '';

        const category = lifeEventObj.categoryArr.length > 0 ? lifeEventObj.categoryArr[0].name : '';
        const subCategory = lifeEventObj.categorySubArr.length > 0 ? lifeEventObj.categorySubArr[0].name : '';

        if (
            lifeEventObj.categoryArr.length === 1 &&
            lifeEventObj.categorySubArr.length === 1
        ) {
            categoryStr = `${category} > ${subCategory}`;
        } else if (
            lifeEventObj.categoryArr.length === 1
        ) {
            categoryStr = `${category}`;
        }

        return categoryStr;
    }

    const deleteItem = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                return;
            }

            const config = {
                method: 'post',
                url: `/api/life-events/crud/lifeEventsDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: lifeEventObj._id,
                },
            };

            await axiosCustom.request(config);

            setIsDeleted(true);
        } catch (error) {
            console.error(error);
        }
    }

    const getFileUrl = (fileUrl: string) =>
        `${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${fileUrl}`;

    const renderFiles = () => {
        return (
            <div
                style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                {lifeEventObj.filesArr.map((fileObj, fileIndex) => {
                    return (
                        <Fragment key={fileIndex}>
                            {fileObj.fileType === "image" && (
                                <a href={getFileUrl(fileObj.fileUrl)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginRight: 8 }}>
                                    <img
                                        src={getFileUrl(fileObj.fileUrl)}
                                        alt=""
                                        style={{
                                            display: 'inline-block',
                                            height: '150px',
                                            maxWidth: '150px',
                                            objectFit: 'contain',
                                            borderRadius: 6,
                                        }}
                                    />
                                </a>
                            )}
                            {fileObj.fileType === "video" && (
                                <video
                                    src={getFileUrl(fileObj.fileUrl)}
                                    controls
                                    style={{
                                        display: 'inline-block',
                                        height: '150px',
                                        maxWidth: '150px',
                                        objectFit: 'contain',
                                        borderRadius: 6,
                                        marginRight: 8,
                                    }}
                                />
                            )}
                            {fileObj.fileType === "audio" && (
                                <audio
                                    src={getFileUrl(fileObj.fileUrl)}
                                    controls
                                    style={{
                                        display: 'inline-block',
                                        width: '150px',
                                        marginRight: 8,
                                        borderRadius: 6,
                                    }}
                                />
                            )}
                            {fileObj.fileType === "file" && (
                                <div style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}>
                                    <a href={getFileUrl(fileObj.fileUrl)} target="_blank" rel="noopener noreferrer">
                                        <LucideFile className="w-10 h-10 text-gray-400" />
                                    </a>
                                </div>
                            )}
                        </Fragment>
                    )
                })}
            </div>
        )
    }

    const renderItem = () => {
        return (
            <Fragment>
                {/* files and images */}
                {renderFiles()}

                {/* title */}
                <h3>{lifeEventObj.title}</h3>

                {/* labels */}
                <div className="my-1 flex flex-wrap gap-2">
                    {/* event date */}
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Event date:{'  '}
                        {new Date(lifeEventObj.eventDateUtc).getUTCDate()}{' / '}
                        {new Date(lifeEventObj.eventDateUtc).getUTCMonth() + 1}{' / '}
                        {new Date(lifeEventObj.eventDateUtc).getFullYear()}
                    </span>
                    {/* impact */}
                    <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Impact: {getImpactStr()}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        medium
                    </span>
                    {/* category */}
                    {getCategoryStr() !== '' && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            {getCategoryStr()}
                        </span>
                    )}
                    {/* star */}
                    {lifeEventObj.isStar && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            <LucideStar className="inline-block mr-1" style={{
                                height: '15px',
                                top: '-2px',
                                position: 'relative',
                            }} /> Stared
                        </span>
                    )}
                    {/* ai tags */}
                    {lifeEventObj.aiTags.map((tagStr, tagIndex) => {
                        return (
                            <span
                                className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                                key={tagIndex}
                            >{tagStr}</span>
                        )
                    })}
                </div>

                {/* actions */}
                <div>
                    <div className="action-buttons my-4">
                        {lifeEventObj.description.trim().length >= 1 && (
                            <button
                                className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200 mr-1"
                                onClick={() => {
                                    setIsExpandedDescription(!isExpandedDescription)
                                }}
                            >
                                <LucideExpand
                                    className="w-4 h-4 inline-block mr-2"
                                    style={{
                                        height: '15px',
                                        top: '-2px',
                                        position: 'relative',
                                    }}
                                />
                                {isExpandedDescription ? 'Hide Description' : 'Show Description'}
                            </button>
                        )}
                        {lifeEventObj.aiSummary.trim().length >= 1 && (
                            <button
                                className="px-3 py-1 rounded bg-purple-100 text-purple-800 text-sm font-semibold hover:bg-purple-200 mr-1"
                                onClick={() => {
                                    setIsExpandedAiSummary(!isExpandedAiSummary)
                                }}
                            >
                                <LucideCpu
                                    className="w-4 h-4 inline-block mr-2"
                                    style={{
                                        height: '15px',
                                        top: '-2px',
                                        position: 'relative',
                                    }}
                                />
                                AI Summary
                            </button>
                        )}
                        { }
                        <Link
                            to={`/user/life-events?action=edit&id=${lifeEventObj._id}`}
                            className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 mr-1"
                        >
                            <LucideEdit
                                className="w-4 h-4 inline-block mr-2"
                                style={{
                                    height: '15px',
                                    top: '-2px',
                                    position: 'relative',
                                }}
                            />
                            Edit
                        </Link>
                        <button
                            className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 mr-1"
                            onClick={() => {
                                deleteItem();
                            }}
                        >
                            <LucideTrash2
                                className="w-4 h-4 inline-block mr-2"
                                style={{
                                    height: '15px',
                                    top: '-2px',
                                    position: 'relative',
                                }}
                            />
                            Delete
                        </button>
                    </div>
                </div>

                {/* description */}
                {isExpandedDescription && (
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded p-1">{lifeEventObj.description}</p>
                )}

                {/* ai summary */}
                {isExpandedAiSummary && (
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded p-1">{lifeEventObj.aiSummary}</p>
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

export default ComponentLifeEventItem;