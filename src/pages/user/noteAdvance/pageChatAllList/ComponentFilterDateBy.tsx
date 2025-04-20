import { useEffect, useState } from "react";
import { DateTime } from 'luxon';
import styles from './scss/componentFilterDateBy.module.scss';

const ComponentFilterDateBy = ({
    paginationDateLocalYearMonthStr,
    setPaginationDateLocalYearMonthStr,
    parentLoading,
}: {
    paginationDateLocalYearMonthStr: string,
    setPaginationDateLocalYearMonthStr: React.Dispatch<React.SetStateAction<string>>,
    parentLoading: boolean;
}) => {

    const [filterByDateType, setFilterByDateType] = useState(
        'by-month' as 'by-month' | 'by-week' | 'by-date'
    );

    useEffect(() => {
        console.log(paginationDateLocalYearMonthStr)
    }, [paginationDateLocalYearMonthStr])

    const onClickNextBtn = () => {
        try {
            if (filterByDateType === 'by-month') {
                const date = DateTime.fromFormat(paginationDateLocalYearMonthStr, 'yyyy-MM');
                const prevMonth = date.plus({ months: 1 });
                setPaginationDateLocalYearMonthStr(prevMonth.toFormat('yyyy-MM'));
            }
        } catch (error) {

        }
    }

    const onClickPrevBtn = () => {
        try {
            if (filterByDateType === 'by-month') {
                const date = DateTime.fromFormat(paginationDateLocalYearMonthStr, 'yyyy-MM');
                const prevMonth = date.minus({ months: 1 });
                setPaginationDateLocalYearMonthStr(prevMonth.toFormat('yyyy-MM'));
            }
        } catch (error) {

        }
    }

    const getMonth12Prev = () => {
        console.log(paginationDateLocalYearMonthStr);
        // const dateMonthMinus12 = DateTime.fromFormat(paginationDateLocalYearMonthStr, 'yyyy-MM').minus({ months: 24 });
        // console.log('dateMonthMinus12: ', dateMonthMinus12);
        const months = [];
        // for (let i = 0; i < 24; i++) {
        //     months.push({
        //         value: dateMonthMinus12.plus({ months: i }).toFormat('yyyy-MM'),
        //         label: dateMonthMinus12.plus({ months: i }).toFormat('MMM yyyy'),
        //     });
        // }
        const dateMonth = DateTime.fromFormat(paginationDateLocalYearMonthStr, 'yyyy-MM');
        months.push({
            value: dateMonth.toFormat('yyyy-MM'),
            label: dateMonth.toFormat('MMM yyyy'),
        })
        console.log(months);
        return months;
    }

    return (
        <div className={styles.actionContainer}>
            {/* loading */}
            {parentLoading && (
                <button
                    className={styles.btnCommon}
                >Loading...</button>
            )}

            {/* select for by month, week and date */}
            <select
                // className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-1"
                className={styles.btnCommon}
                value={filterByDateType}
                onChange={(e) => {
                    const tempVal = e.target.value;
                    if (
                        tempVal === 'by-month' ||
                        tempVal === 'by-week' ||
                        tempVal === 'by-date'
                    ) {
                        setFilterByDateType(tempVal)
                    }
                }}
            >
                <option value="by-month">By month</option>
                <option value="by-week">By week</option>
                <option value="by-date">By date</option>
            </select>

            {/* btn - prev */}
            <button
                // className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-1"
                className={styles.btnCommon}
                onClick={() => {
                    onClickPrevBtn();
                }}
            >Prev</button>

            {/* month */}
            {filterByDateType === 'by-month' && (
                <select
                    // className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-1"
                    className={styles.btnCommon}
                    value={paginationDateLocalYearMonthStr}
                    onChange={(e) => setPaginationDateLocalYearMonthStr(e.target.value)}
                >
                    {getMonth12Prev().map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            )}

            {/* btn - next */}
            <button
                // className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-1"
                className={styles.btnCommon}
                onClick={() => {
                    onClickNextBtn();
                }}
            >Next</button>
        </div>
    )
};

export default ComponentFilterDateBy;