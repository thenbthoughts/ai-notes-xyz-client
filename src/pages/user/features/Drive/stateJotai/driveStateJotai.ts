import { atom } from 'jotai';
import { ViewMode } from '../../../../../types/pages/Drive.types';

// Current selected bucket name
export const jotaiDriveCurrentBucket = atom<string>('');

// Current folder path
export const jotaiDriveCurrentPath = atom<string>('');

// View mode (grid or list)
export const jotaiDriveViewMode = atom<ViewMode>('grid');

// Refresh trigger
export const jotaiDriveRefresh = atom<number>(0);

