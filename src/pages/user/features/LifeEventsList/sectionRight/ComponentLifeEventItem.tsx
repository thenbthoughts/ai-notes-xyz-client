import {
    LucideCalendar,
    LucideCpu,
    LucideEdit,
    LucideExpand,
    LucideFile,
    LucideImage,
    LucideStar,
    LucideTrash2,
} from 'lucide-react';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents';
import { Link } from 'react-router-dom';
import axiosCustom from '../../../../../config/axiosCustom';
import { Fragment, useState } from 'react';
import envKeys from '../../../../../config/envKeys';

export type LifeEventItemLayout = 'grid' | 'list';

const ComponentLifeEventItem = ({
    lifeEventObj,
    layout = 'list',
}: {
    lifeEventObj: tsLifeEventsItem;
    layout?: LifeEventItemLayout;
}) => {
    const [isDeleted, setIsDeleted] = useState(false);
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
    };

    const getCategoryStr = () => {
        let categoryStr = '';

        const category = lifeEventObj.categoryArr.length > 0 ? lifeEventObj.categoryArr[0].name : '';
        const subCategory = lifeEventObj.categorySubArr.length > 0 ? lifeEventObj.categorySubArr[0].name : '';

        if (lifeEventObj.categoryArr.length === 1 && lifeEventObj.categorySubArr.length === 1) {
            categoryStr = `${category} > ${subCategory}`;
        } else if (lifeEventObj.categoryArr.length === 1) {
            categoryStr = `${category}`;
        }

        return categoryStr;
    };

    const getAiCategoryStr = () => {
        let aiCategoryStr = '';
        try {
            if (lifeEventObj.aiCategory.length > 0 && lifeEventObj.aiSubCategory.length > 0) {
                aiCategoryStr = `AI: ${lifeEventObj.aiCategory} > ${lifeEventObj.aiSubCategory}`;
            } else if (lifeEventObj.aiCategory.length > 0) {
                aiCategoryStr = `AI: ${lifeEventObj.aiCategory}`;
            }
        } catch (error) {
            console.error(error);
        }
        return aiCategoryStr;
    };

    const deleteItem = async () => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this item?');
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
    };

    const getFileUrl = (fileUrl: string) =>
        `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${fileUrl}`;

    const comments = lifeEventObj?.comments ?? [];
    const firstImageIndex = comments.findIndex((c) => c.fileType === 'image');
    const firstImage = firstImageIndex >= 0 ? comments[firstImageIndex] : undefined;
    const firstImageUrl = firstImage ? getFileUrl(firstImage.fileUrl) : null;
    const listStripFiles = firstImageIndex >= 0 ? comments.filter((_, i) => i !== firstImageIndex) : comments;
    const extraFileCount = Math.max(0, comments.length - (firstImage ? 1 : 0));

    const chip =
        'inline-flex items-center rounded-md border px-1 py-px text-[9px] font-medium leading-tight sm:text-[10px]';

    const dateLabel = (
        <>
            {new Date(lifeEventObj.eventDateUtc).getUTCDate()}/
            {new Date(lifeEventObj.eventDateUtc).getUTCMonth() + 1}/
            {new Date(lifeEventObj.eventDateUtc).getFullYear()}
        </>
    );

    const renderFileStrip = (files: typeof comments) => (
        <div className="mb-1 overflow-x-auto whitespace-nowrap pb-0.5">
            {files.map((fileObj, fileIndex) => (
                <Fragment key={fileIndex}>
                    {fileObj.fileType === 'image' && (
                        <a
                            href={getFileUrl(fileObj.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mr-1 inline-block"
                        >
                            <img
                                src={getFileUrl(fileObj.fileUrl)}
                                alt=""
                                className="inline-block max-h-[88px] max-w-[88px] rounded-md border border-zinc-200/90 object-cover"
                            />
                        </a>
                    )}
                    {fileObj.fileType === 'video' && (
                        <video
                            src={getFileUrl(fileObj.fileUrl)}
                            controls
                            className="mr-1 inline-block max-h-[88px] max-w-[88px] rounded-md border border-zinc-200/90 object-cover"
                        />
                    )}
                    {fileObj.fileType === 'audio' && (
                        <audio
                            src={getFileUrl(fileObj.fileUrl)}
                            controls
                            className="mr-1 inline-block w-[120px] rounded-md"
                        />
                    )}
                    {fileObj.fileType === 'file' && (
                        <div className="mr-1 inline-block align-middle">
                            <a href={getFileUrl(fileObj.fileUrl)} target="_blank" rel="noopener noreferrer">
                                <LucideFile className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
                            </a>
                        </div>
                    )}
                </Fragment>
            ))}
        </div>
    );

    const metaChips = (compact: boolean) => {
        const cat = getCategoryStr();
        const aiCat = getAiCategoryStr();
        const tags = lifeEventObj.aiTags ?? [];
        const tagLimit = compact ? 2 : tags.length;

        return (
            <div className={`flex flex-wrap gap-0.5 ${compact ? 'mt-1' : 'my-1'}`}>
                <span className={`${chip} border-zinc-200 bg-zinc-50 text-zinc-800`}>{dateLabel}</span>
                <span className={`${chip} border-zinc-200/80 bg-white text-zinc-600`}>
                    {getImpactStr()}
                </span>
                {lifeEventObj.isStar && (
                    <span className={`${chip} border-amber-200/80 bg-amber-50 text-amber-900`}>
                        <LucideStar className="mr-px h-2.5 w-2.5" strokeWidth={2} fill="currentColor" />
                    </span>
                )}
                {cat !== '' && (
                    <span
                        className={`${chip} max-w-full border-amber-200/70 bg-amber-50/90 text-amber-950 ${
                            compact ? 'truncate' : ''
                        }`}
                        title={cat}
                    >
                        {cat}
                    </span>
                )}
                {aiCat !== '' && (
                    <span
                        className={`${chip} max-w-full border-indigo-200/80 bg-indigo-50 text-indigo-950 ${
                            compact ? 'truncate' : ''
                        }`}
                        title={aiCat}
                    >
                        {compact ? aiCat.replace(/^AI:\s*/, '') : aiCat}
                    </span>
                )}
                {tags.slice(0, tagLimit).map((tagStr, tagIndex) => (
                    <span
                        className={`${chip} border-emerald-200/80 bg-emerald-50 text-emerald-900`}
                        key={tagIndex}
                    >
                        {tagStr}
                    </span>
                ))}
                {compact && tags.length > tagLimit && (
                    <span className={`${chip} border-zinc-200 bg-zinc-100 text-zinc-600`}>
                        +{tags.length - tagLimit}
                    </span>
                )}
            </div>
        );
    };

    const actionIconBtn =
        'inline-flex h-7 w-7 items-center justify-center rounded-md border text-zinc-600 transition-colors hover:bg-zinc-50';
    const actionTextBtn =
        'inline-flex h-7 items-center gap-0.5 rounded-md border px-1.5 text-[10px] font-medium transition-colors sm:text-[11px]';

    const expandedBlocks = (
        <>
            {isExpandedDescription && (
                <p className="mt-1 whitespace-pre-wrap rounded-md border border-zinc-200/90 bg-zinc-50/90 p-1.5 text-[10px] leading-relaxed text-zinc-800 sm:text-xs">
                    {lifeEventObj.description}
                </p>
            )}

            {isExpandedAiSummary && (
                <p className="mt-1 whitespace-pre-wrap rounded-md border border-indigo-100 bg-indigo-50/50 p-1.5 text-[10px] leading-relaxed text-zinc-800 sm:text-xs">
                    {lifeEventObj.aiSummary}
                </p>
            )}
        </>
    );

    const renderGrid = () => (
        <>
            <div className="relative h-[104px] shrink-0 overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-50 to-indigo-50/40">
                {firstImageUrl ? (
                    <img
                        src={firstImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">
                        <LucideCalendar className="h-9 w-9" strokeWidth={1.25} />
                    </div>
                )}
                {extraFileCount > 0 && (
                    <span className="absolute bottom-1 right-1 rounded-md bg-zinc-900/75 px-1 py-px text-[9px] font-medium text-white backdrop-blur-[2px]">
                        +{extraFileCount} files
                    </span>
                )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-1.5">
                <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-snug tracking-tight text-zinc-900">
                    {lifeEventObj.title}
                </h3>
                {metaChips(true)}
                <div className="mt-auto flex items-center justify-between gap-0.5 border-t border-zinc-100 pt-1.5">
                    <div className="flex gap-0.5">
                        {lifeEventObj.description.trim().length >= 1 && (
                            <button
                                type="button"
                                title={isExpandedDescription ? 'Hide description' : 'Description'}
                                className={`${actionIconBtn} ${
                                    isExpandedDescription
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                                        : 'border-zinc-200 bg-white'
                                }`}
                                onClick={() => setIsExpandedDescription(!isExpandedDescription)}
                            >
                                <LucideExpand className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                        )}
                        {lifeEventObj.aiSummary.trim().length >= 1 && (
                            <button
                                type="button"
                                title="AI summary"
                                className={`${actionIconBtn} ${
                                    isExpandedAiSummary
                                        ? 'border-indigo-300 bg-indigo-100 text-indigo-900'
                                        : 'border-indigo-200/80 bg-indigo-50/80 text-indigo-800'
                                }`}
                                onClick={() => setIsExpandedAiSummary(!isExpandedAiSummary)}
                            >
                                <LucideCpu className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-0.5">
                        <Link
                            to={`/user/life-events?action=edit&id=${lifeEventObj._id}`}
                            title="Edit"
                            className={`${actionIconBtn} border-zinc-200 bg-white hover:text-indigo-700`}
                        >
                            <LucideEdit className="h-3.5 w-3.5" strokeWidth={2} />
                        </Link>
                        <button
                            type="button"
                            title="Delete"
                            className={`${actionIconBtn} border-red-200/90 bg-red-50 text-red-800 hover:bg-red-100`}
                            onClick={() => void deleteItem()}
                        >
                            <LucideTrash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>
                </div>
                {expandedBlocks}
            </div>
        </>
    );

    const renderList = () => (
        <>
            <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row sm:gap-2">
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-zinc-100 to-zinc-50 sm:h-auto sm:w-[72px] sm:self-stretch">
                    {firstImageUrl ? (
                        <img src={firstImageUrl} alt="" className="h-full w-full object-cover sm:min-h-[4.5rem]" />
                    ) : (
                        <div className="flex h-full min-h-[4rem] items-center justify-center text-zinc-300 sm:min-h-0">
                            <LucideImage className="h-7 w-7" strokeWidth={1.25} />
                        </div>
                    )}
                    {extraFileCount > 0 && (
                        <span className="absolute bottom-0.5 right-0.5 rounded bg-zinc-900/70 px-1 text-[8px] font-medium text-white">
                            +{extraFileCount}
                        </span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    {listStripFiles.length > 0 ? renderFileStrip(listStripFiles) : null}
                    <h3 className="text-xs font-semibold leading-snug text-zinc-900 sm:text-sm">{lifeEventObj.title}</h3>
                    {metaChips(false)}
                    <div className="action-buttons mt-1 flex flex-wrap gap-0.5">
                        {lifeEventObj.description.trim().length >= 1 && (
                            <button
                                type="button"
                                className={`${actionTextBtn} ${
                                    isExpandedDescription
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
                                        : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
                                }`}
                                onClick={() => setIsExpandedDescription(!isExpandedDescription)}
                            >
                                <LucideExpand className="h-3 w-3" strokeWidth={2} />
                                {isExpandedDescription ? 'Hide' : 'Description'}
                            </button>
                        )}
                        {lifeEventObj.aiSummary.trim().length >= 1 && (
                            <button
                                type="button"
                                className={`${actionTextBtn} ${
                                    isExpandedAiSummary
                                        ? 'border-indigo-300 bg-indigo-100 text-indigo-900'
                                        : 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                                }`}
                                onClick={() => setIsExpandedAiSummary(!isExpandedAiSummary)}
                            >
                                <LucideCpu className="h-3 w-3" strokeWidth={2} />
                                AI summary
                            </button>
                        )}
                        <Link
                            to={`/user/life-events?action=edit&id=${lifeEventObj._id}`}
                            className={`${actionTextBtn} border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50`}
                        >
                            <LucideEdit className="h-3 w-3" strokeWidth={2} />
                            Edit
                        </Link>
                        <button
                            type="button"
                            className={`${actionTextBtn} border-red-200 bg-red-50 text-red-800 hover:bg-red-100`}
                            onClick={() => void deleteItem()}
                        >
                            <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                            Delete
                        </button>
                    </div>
                    {expandedBlocks}
                </div>
            </div>
        </>
    );

    const cardShell =
        layout === 'grid'
            ? 'group flex h-full min-h-[260px] flex-col overflow-hidden rounded-lg border border-zinc-200/90 bg-white shadow-sm transition-all duration-200 hover:border-indigo-200/70 hover:shadow-md'
            : 'rounded-lg border border-zinc-200/90 bg-white p-1.5 shadow-sm transition-shadow hover:shadow-md sm:p-2';

    return (
        <div className={cardShell}>
            {isDeleted && (
                <div className="rounded-md border border-red-200 bg-red-50 p-1.5 text-[10px] font-medium text-red-700 sm:text-xs">
                    This item has been deleted.
                </div>
            )}

            {!isDeleted && (
                <Fragment>{layout === 'grid' ? renderGrid() : renderList()}</Fragment>
            )}
        </div>
    );
};

export default ComponentLifeEventItem;
