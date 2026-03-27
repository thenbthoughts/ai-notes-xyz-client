import {
    LucidePlusCircle,
    LucideSearch,
    LucideList,
    LucideFilter,
} from 'lucide-react';

const ComponentTaskListFooter: React.FC<{
    setIsTaskAddModalIsOpen: React.Dispatch<React.SetStateAction<{
        openStatus: boolean;
        modalType: 'add' | 'edit';
        recordId: string;
    }>>;
}> = ({ setIsTaskAddModalIsOpen }) => {
    const btn =
        'flex flex-col items-center gap-0.5 rounded-none px-3 py-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-300 hover:bg-zinc-800 hover:text-white';

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[52px] items-center justify-center gap-1 border-t border-zinc-700 bg-zinc-900 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
            <button
                type="button"
                className={btn}
                onClick={() => {
                    setIsTaskAddModalIsOpen({
                        openStatus: true,
                        modalType: 'add',
                        recordId: '',
                    });
                }}
            >
                <LucidePlusCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                Add
            </button>
            <button
                type="button"
                className={btn}
                onClick={() => {
                    const taskSearchElement = document.getElementById('task-search');
                    if (taskSearchElement) {
                        taskSearchElement.scrollIntoView({ behavior: 'smooth' });
                        (taskSearchElement as HTMLInputElement).focus?.();
                    }
                }}
            >
                <LucideSearch className="h-5 w-5 text-zinc-200" strokeWidth={1.75} />
                Search
            </button>
            <button
                type="button"
                className={btn}
                onClick={() => {
                    const filterSection = document.getElementById('task-filter');
                    if (filterSection) {
                        filterSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                <LucideFilter className="h-5 w-5 text-zinc-200" strokeWidth={1.75} />
                Filter
            </button>
            <button
                type="button"
                className={btn}
                onClick={() => {
                    const taskListSection = document.getElementById('task-list');
                    if (taskListSection) {
                        taskListSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                <LucideList className="h-5 w-5 text-zinc-200" strokeWidth={1.75} />
                Board
            </button>
        </div>
    );
};

export default ComponentTaskListFooter;
