import React, { useEffect, useRef, useState } from 'react';

const TaskVirtualColumn = ({
    children,
    itemCount,
    rowHeight,
    height,
    ariaLabel,
}: {
    children: React.ReactNode[];
    itemCount: number;
    rowHeight: number;
    height: number;
    ariaLabel: string;
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onScroll = () => {
            setScrollTop(el.scrollTop);
        };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    if (itemCount === 0) {
        return (
            <div className="p-2 pt-1.5 sm:p-3 sm:pt-2" aria-label={ariaLabel}>
                <p className="py-4 text-center text-xs text-zinc-500 sm:py-6">No tasks</p>
            </div>
        );
    }

    const overscan = 4;
    const visibleCount = Math.ceil(height / rowHeight) + overscan * 2;
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(itemCount, start + visibleCount);
    const slice = children.slice(start, end);
    const topPad = start * rowHeight;
    const bottomPad = (itemCount - end) * rowHeight;

    return (
        <div
            ref={ref}
            className="overflow-auto"
            style={{ maxHeight: height, height }}
            aria-label={ariaLabel}
        >
            <div style={{ height: topPad }} aria-hidden />
            <div>{slice}</div>
            <div style={{ height: bottomPad }} aria-hidden />
        </div>
    );
};

export default TaskVirtualColumn;
