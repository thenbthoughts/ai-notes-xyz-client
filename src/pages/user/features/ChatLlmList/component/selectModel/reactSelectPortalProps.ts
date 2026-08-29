import type { CSSObjectWithLabel, StylesConfig } from 'react-select';

const SELECT_FONT_SIZE = '12px';

type SelectOption = { value: string; label: string };

const darkControl = (base: CSSObjectWithLabel, state?: { isFocused?: boolean }) => ({
    ...base,
    minHeight: '32px',
    fontSize: SELECT_FONT_SIZE,
    backgroundColor: '#27272a',
    borderColor: state?.isFocused ? '#6366f1' : '#3f3f46',
    boxShadow: state?.isFocused ? '0 0 0 1px #6366f1' : 'none',
    color: '#f4f4f5',
    '&:hover': {
        borderColor: '#52525b',
    },
});

/** Shared dark styles for react-select across the app. */
export const reactSelectDarkStyles: StylesConfig<SelectOption, boolean> = {
    control: (base, state) => darkControl(base, state),
    valueContainer: (base) => ({
        ...base,
        padding: '0 6px',
    }),
    singleValue: (base) => ({
        ...base,
        fontSize: SELECT_FONT_SIZE,
        color: '#f4f4f5',
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: '#3f3f46',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#e4e4e7',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#a1a1aa',
        ':hover': {
            backgroundColor: '#52525b',
            color: '#f4f4f5',
        },
    }),
    placeholder: (base) => ({
        ...base,
        fontSize: SELECT_FONT_SIZE,
        color: '#71717a',
    }),
    input: (base) => ({
        ...base,
        fontSize: SELECT_FONT_SIZE,
        margin: 0,
        padding: 0,
        color: '#f4f4f5',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: SELECT_FONT_SIZE,
        padding: '6px 10px',
        backgroundColor: state.isSelected
            ? '#4f46e5'
            : state.isFocused
              ? '#3f3f46'
              : '#18181b',
        color: '#f4f4f5',
        cursor: 'pointer',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
    }),
    menuList: (base) => ({
        ...base,
        backgroundColor: '#18181b',
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: '#3f3f46',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: '#a1a1aa',
        ':hover': { color: '#e4e4e7' },
    }),
    clearIndicator: (base) => ({
        ...base,
        color: '#a1a1aa',
        ':hover': { color: '#e4e4e7' },
    }),
};

/** Portal menu to body so it stacks above sibling cards and overflow-hidden ancestors. */
export const reactSelectPortalProps = {
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: 'fixed' as const,
    styles: reactSelectDarkStyles,
};
