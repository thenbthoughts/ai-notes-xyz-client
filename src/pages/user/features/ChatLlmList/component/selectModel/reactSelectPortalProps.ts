import type { CSSObjectWithLabel } from 'react-select';

/** Portal menu to body so it stacks above sibling cards and overflow-hidden ancestors. */
export const reactSelectPortalProps = {
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: 'fixed' as const,
    styles: {
        menuPortal: (base: CSSObjectWithLabel) => ({
            ...base,
            zIndex: 9999,
        }),
    },
};
