import { useAtom } from 'jotai';
import { LucideChevronRight, LucideHome } from 'lucide-react';
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
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
            <button
                onClick={() => navigateToPath(-1)}
                className="flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-gray-100 transition"
            >
                <LucideHome size={16} />
                <span>Home</span>
            </button>
            {pathParts.map((part, index) => (
                <div key={index} className="flex items-center gap-1">
                    <LucideChevronRight size={16} className="text-gray-400" />
                    <button
                        onClick={() => navigateToPath(index)}
                        className="px-2 py-1 rounded-sm hover:bg-gray-100 transition"
                    >
                        {part}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default DriveBreadcrumbs;

