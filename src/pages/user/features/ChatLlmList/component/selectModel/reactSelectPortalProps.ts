import type { CSSObjectWithLabel } from 'react-select';

const SELECT_FONT_SIZE = '12px';

/** Portal menu to body so it stacks above sibling cards and overflow-hidden ancestors. */
export const reactSelectPortalProps = {
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: 'fixed' as const,
    styles: {
        control: (base: CSSObjectWithLabel) => ({
            ...base,
            minHeight: '32px',
            fontSize: SELECT_FONT_SIZE,
        }),
        valueContainer: (base: CSSObjectWithLabel) => ({
            ...base,
            padding: '0 6px',
        }),
        singleValue: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: SELECT_FONT_SIZE,
        }),
        placeholder: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: SELECT_FONT_SIZE,
        }),
        input: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: SELECT_FONT_SIZE,
            margin: 0,
            padding: 0,
        }),
        option: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: SELECT_FONT_SIZE,
            padding: '6px 10px',
        }),
        menuPortal: (base: CSSObjectWithLabel) => ({
            ...base,
            zIndex: 9999,
        }),
    },
};
