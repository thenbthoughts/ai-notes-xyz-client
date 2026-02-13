import { atom } from 'jotai';

// Search Input
export const jotaiStateLifeEventSearch = atom<string>('');

// Category Dropdown
export const jotaiStateLifeEventCategory = atom<string>('');
export const jotaiStateLifeEventCategorySub = atom<string>('');

// Category Dropdown
export const jotaiStateLifeEventAiCategory = atom<string>('');
export const jotaiStateLifeEventAiCategorySub = atom<string>('');

// Date Range
export const jotaiStateLifeEventDateRange = atom<{ startDate: Date | null; endDate: Date | null }>({
  startDate: null,
  endDate: null,
});

// Is Started Checkbox
export const jotaiStateLifeEventIsStar = atom<'' | 'true' | 'false'>('');

// Event Impact (Radio Buttons - assuming only one can be selected)
export const jotaiStateLifeEventImpact = atom<
  'very-low' | 'low' | 'medium' | 'large' | 'huge' | ''
>('');

// Hide Daily Diary Checkbox
export const jotaiStateLifeEventHideDailyDiary = atom<boolean>(true);