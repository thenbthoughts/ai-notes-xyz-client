import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import CRightChatById from "./CRightChatById";
// import ComponentThreadAdd from "./ComponentThreadAdd";
import { LucideCopy, LucideCpu, LucideEdit, LucideExpand, LucideStar, LucideTrash2 } from "lucide-react";

const ComponentLifeEventItem = () => {
    return (
        <div
            className="my-2 py-2"
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
            <h3>Purchase PS5</h3>
            <div className="my-2 flex flex-wrap gap-2">
                <span className="inline-block bg-orange-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Event date: 23/07/1999
                </span>
                <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Impact: Very High
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
                    <button
                        className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200 mr-1"
                        onClick={() => {/* Logic to expand description */ }}
                        aria-label="Expand Description"
                    >
                        <LucideExpand className="w-4 h-4 inline-block mr-2"

                        />
                        Expand
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-purple-100 text-purple-800 text-sm font-semibold hover:bg-purple-200"
                        onClick={() => {/* Logic to show AI summary */ }}
                        aria-label="Show AI Summary"
                    >
                        <LucideCpu className="w-4 h-4 inline-block mr-2"
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
                        <LucideEdit className="w-4 h-4 inline-block mr-2"
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
                        <LucideTrash2 className="w-4 h-4 inline-block mr-2"
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
                        <LucideCopy className="w-4 h-4 inline-block mr-2"
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
            <p>
                This life event marks the memorable purchase of the PlayStation 5, a long-awaited dream come true.
                Acquired at a price of ₹45,000, it symbolizes both a personal reward and a passion for gaming.
                The event holds a very high impact on the user's journey, celebrated as a dream fulfilled.
                Categorized under Purchase {'>'} Tech, it's a key moment of self-achievement.
                Labeled with medium priority, it balances aspiration with practicality.
                The PS5 stands not just as a console but as a symbol of progress and ambition.
                It's been marked as starred and achieved, showing its emotional and motivational value.
                This milestone blends technology and entertainment into a significant life chapter.
                With the Gaming tag, it reflects a deeper lifestyle choice beyond mere leisure.
                Overall, this PS5 purchase is a proud and meaningful addition to the user's life events.
            </p>
        </div>
    );
}

const ComponentRightWrapper = ({
    stateDisplayAdd,
    refreshRandomNumParent,
}: {
    stateDisplayAdd: boolean;
    refreshRandomNumParent: number;
}) => {
    const location = useLocation();
    const [pageName, setPageName] = useState({
        actionType: 'list'
    } as {
        actionType: 'list' | 'add' | 'edit'
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempActionType = 'list' as 'list' | 'add' | 'edit';
        const actionType = queryParams.get('action') || 'life';
        if (actionType === 'add') {
            tempActionType = actionType;
        } else if (actionType === 'edit') {
            tempActionType = actionType;
        } 
        setPageName({
            actionType: tempActionType,
        });
    }, [
        location.search,
        stateDisplayAdd,
        refreshRandomNumParent,
    ]);

    return (
        <div
            style={{
                height: 'calc(100vh - 60px)',
                overflowY: 'scroll'
            }}
            className="p-1 md:p-2"
        >

            <div className="mb-6 p-4 rounded-lg shadow-lg text-white bg-yellow-500">
                <h1 className="text-3xl font-extrabold mb-2 drop-shadow-md">Life Events</h1>
                <p className="text-lg font-medium drop-shadow-sm">Keep track of important moments in your life</p>
            </div>

            {pageName.actionType === 'list' && (
                <div
                    className="py-10 px-3 bg-white rounded"
                >
                    Life Events

                    <ComponentLifeEventItem />
                    <ComponentLifeEventItem />
                    <ComponentLifeEventItem />
                    <ComponentLifeEventItem />
                    <ComponentLifeEventItem />
                </div>
            )}
            {pageName.actionType === 'add' && (
                <div>
                    Life Events {'->'} Add
                </div>
            )}
            {pageName.actionType === 'edit' && (
                <div>
                    Life Events {'->'} Edit
                </div>
            )}

            {/*
            {threadId === '' ? (
                <ComponentThreadAdd />
            ) : (
                <CRightChatById
                    key={threadId}
                    stateDisplayAdd={stateDisplayAdd}
                    threadId={threadId}
                    refreshRandomNumParent={refreshRandomNumParent}
                />
            )}
            */}
        </div>
    );
};

export default ComponentRightWrapper;