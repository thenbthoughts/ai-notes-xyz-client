import { useAtom } from 'jotai';
import { LucideChevronRight, LucideHardDrive } from 'lucide-react';
import { jotaiDriveCurrentPath } from '../stateJotai/driveStateJotai';

const DriveBreadcrumbs = () => {
    const [currentPath, setCurrentPath] = useAtom(jotaiDriveCurrentPath);

    const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

    const navigateToPath = (index: number) => {
        if (index === -1) {
            setCurrentPath('');
        } else {
            const newPath = pathParts.slice(0, index + 1).join('/');
            setCurrentPath(newPath);
        }
    };

    return (
        <nav className="flex flex-wrap items-center gap-0.5 text-sm" aria-label="Breadcrumb">
            <button
                type="button"
                onClick={() => navigateToPath(-1)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition ${
                    pathParts.length === 0
                        ? 'bg-sky-50 text-sky-800'
                        : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                <LucideHardDrive size={16} />
                My Drive
            </button>
            {pathParts.map((part, index) => {
                const isLast = index === pathParts.length - 1;
                return (
                    <div key={`${part}-${index}`} className="flex items-center gap-0.5">
                        <LucideChevronRight size={16} className="text-slate-300" />
                        <button
                            type="button"
                            onClick={() => navigateToPath(index)}
                            className={`max-w-[160px] truncate rounded-lg px-2.5 py-1.5 transition ${
                                isLast
                                    ? 'bg-sky-50 font-medium text-sky-800'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title={part}
                        >
                            {part}
                        </button>
                    </div>
                );
            })}
        </nav>
    );
};

export default DriveBreadcrumbs;
