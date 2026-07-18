import { Outlet } from 'react-router-dom';
import { LucideHardDrive } from 'lucide-react';
import DriveBucketSelector from './components/DriveBucketSelector';
import DriveReindexButton from './components/DriveReindexButton';
import DriveAddActions from './components/DriveAddActions';
import DriveNavTabs from './components/DriveNavTabs';

const DriveLayout = () => {
    return (
        <div className="min-h-[calc(100vh-60px)] bg-slate-50">
            <div className="mx-auto flex max-w-[1600px] flex-col px-3 py-4 sm:px-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                            <LucideHardDrive size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                                Drive
                            </h1>
                            <p className="text-xs text-slate-500">Browse and manage your storage</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DriveBucketSelector />
                        <DriveAddActions />
                        <DriveReindexButton />
                    </div>
                </div>

                <div className="mb-4">
                    <DriveNavTabs />
                </div>

                <Outlet />
            </div>
        </div>
    );
};

export default DriveLayout;
