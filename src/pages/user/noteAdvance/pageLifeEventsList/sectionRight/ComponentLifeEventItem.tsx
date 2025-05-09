import { LucideCopy, LucideCpu, LucideEdit, LucideExpand, LucideStar, LucideTrash2 } from "lucide-react";
import { tsLifeEventsItem } from "../../../../../types/pages/tsLifeEvents";

const ComponentLifeEventItem = ({
    lifeEventObj,
}: {
    lifeEventObj: tsLifeEventsItem
}) => {

    const getImpactStr = () => {
        let impactStr = 'Very Low';
        if (lifeEventObj.eventImpact === 'very-low') {
            impactStr = 'Very Low';
        } else if (lifeEventObj.eventImpact === 'low') {
            impactStr = 'Low';
        } else if (lifeEventObj.eventImpact === 'medium') {
            impactStr = 'Medium';
        } else if (lifeEventObj.eventImpact === 'high') {
            impactStr = 'Large';
        } else if (lifeEventObj.eventImpact === 'very-high') {
            impactStr = 'Huge';
        }

        return impactStr;
    }

    return (
        <div
            className="my-2 py-2 bg-white rounded px-2"
            style={{ borderBottom: '1px solid #ccc' }}
        >
            <div style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap',
            }}>
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/77/Black_and_white_Playstation_5_base_edition_with_controller.png"
                    alt=""
                    style={{
                        display: 'inline-block',
                        height: '150px',
                        maxWidth: '150px',
                        objectFit: 'contain',
                    }}
                />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
                    return (<img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/77/Black_and_white_Playstation_5_base_edition_with_controller.png"
                        alt=""
                        style={{
                            display: 'inline-block',
                            height: '150px',
                            maxWidth: '150px',
                            objectFit: 'contain',
                        }}
                    />)
                })}
            </div>
            <h3>{lifeEventObj.title}</h3>
            <div className="my-2 flex flex-wrap gap-2">
                <span className="inline-block bg-orange-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Event date: 23/07/1999
                </span>
                {/* impact */}
                <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Impact: {getImpactStr()}
                </span>
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    medium
                </span>
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Purchase {'>'} Tech
                </span>
                <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    <LucideStar className="inline-block mr-1" style={{
                        height: '15px',
                        top: '-2px',
                        position: 'relative',
                    }} /> Stared
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Purchase
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Dream
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Achived
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Rs 45,000
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Gaming
                </span>
            </div>
            <div>
                <div className="action-buttons my-4">
                    {lifeEventObj.description.trim().length !== 0 && (
                        <button
                            className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200 mr-1"
                            onClick={() => {/* Logic to expand description */ }}
                            aria-label="Expand Description"
                        >
                            <LucideExpand className="w-4 h-4 inline-block mr-2"

                            />
                            Expand
                        </button>
                    )}
                    <button
                        className="px-3 py-1 rounded bg-purple-100 text-purple-800 text-sm font-semibold hover:bg-purple-200"
                        onClick={() => {/* Logic to show AI summary */ }}
                        aria-label="Show AI Summary"
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
                    <button
                        className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 mr-1"
                        onClick={() => {/* Logic to edit item */ }}
                        aria-label="Edit"
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
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 mr-1"
                        onClick={() => {/* Logic to delete item */ }}
                        aria-label="Delete"
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
                    <button
                        className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-semibold hover:bg-yellow-200 mr-1"
                        onClick={() => {/* Logic to duplicate item */ }}
                        aria-label="Duplicate"
                    >
                        <LucideCopy
                            className="w-4 h-4 inline-block mr-2"
                            style={{
                                height: '15px',
                                top: '-2px',
                                position: 'relative',
                            }}
                        />
                        Duplicate
                    </button>
                </div>
            </div>
            <p>{lifeEventObj.description}</p>
        </div>
    );
}
export default ComponentLifeEventItem;