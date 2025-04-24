import { Fragment, useEffect, useState } from "react";
import { DebounceInput } from 'react-debounce-input';

import axiosCustom from "../../../../config/axiosCustom";

const ComponentSearchBar = ({
    paginationDateLocalYearMonthStr,
    setPaginationDateLocalYearMonthStr,
}: {
    paginationDateLocalYearMonthStr: string,
    setPaginationDateLocalYearMonthStr: React.Dispatch<React.SetStateAction<string>>,
}) => {

    // ----- useState -----
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(-1);
    const [searchIndex, setSearchIndex] = useState(0);

    // ----- useEffect -----
    useEffect(() => {
        fetchNotes();
    }, [
        searchQuery,
        searchIndex,
    ])

    // ----- functions -----
    const fetchNotes = async () => {
        setLoading(true);
        try {
            if (searchQuery.trim() !== '') {
                const config = {
                    method: 'post',
                    url: `/api/chat-one/crud/notesGetSearch`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        search: searchQuery,
                        searchIndex: searchIndex,
                    }
                };

                const response = await axiosCustom.request(config);
                const docs = response.data.docs;
                const totalCount = response.data.count;
                setTotalCount(totalCount);

                if (docs.length >= 1) {
                    const firstDocs = docs[0];

                    if (
                        firstDocs.paginationDateLocalYearMonthStr === paginationDateLocalYearMonthStr
                    ) {
                        // valid
                    } else {
                        setPaginationDateLocalYearMonthStr(firstDocs.paginationDateLocalYearMonthStr);

                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    document.getElementById(`message-id-${firstDocs._id}`)?.scrollIntoView({
                        behavior: 'smooth',  // Optional, for a smooth scrolling effect
                        block: 'start'       // Optional, scrolls to the top of the element
                    });
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // ----- renderFunctions -----


    return (
        <Fragment>
            <DebounceInput
                debounceTimeout={1000}
                type='text'
                style={{
                    width: '100%',
                    height: '40px',
                    paddingLeft: '10px',
                    border: '0px solid black',
                    borderRadius: '4px',
                }}
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => {
                    setTotalCount(0);
                    setSearchIndex(0);
                    setSearchQuery(e.target.value);
                }}
            />

            {searchQuery.trim() !== '' && (
                <Fragment>

                    {totalCount >= 1 && (
                        <Fragment>
                            <button
                                style={{
                                    // width: '40px',
                                    height: '40px',
                                }}
                                className={`bg-${searchIndex === totalCount - 1 ? 'blue-400' : 'blue-500'} text-white rounded-md px-2 mx-2`}
                                onClick={() => {
                                    setSearchIndex(searchIndex + 1);
                                }}
                                disabled={searchIndex === totalCount - 1}
                            >⬆️</button>
                            <button
                                style={{
                                    // width: '40px',
                                    height: '40px',
                                }}
                                className={`bg-${searchIndex === 0 ? 'blue-400' : 'blue-500'} text-white rounded-md px-2 mx-2`}
                                onClick={() => {
                                    setSearchIndex(searchIndex - 1);
                                }}
                                disabled={searchIndex === 0}
                            >⬇️</button>
                        </Fragment>
                    )}

                    {/* loading */}
                    {loading && (
                        <button
                            style={{
                                // width: '50px',
                                height: '40px',
                            }}
                            className="bg-blue-500 text-white rounded-md px-2"
                        >Loading</button>
                    )}

                    {/* count */}
                    {!loading && (
                        <button
                            style={{
                                // width: '50px',
                                height: '40px',
                            }}
                            className="bg-blue-500 text-white rounded-md px-2"
                        >{searchIndex + 1}/{totalCount}</button>
                    )}

                </Fragment>
            )}
        </Fragment>
    )
}

export default ComponentSearchBar;