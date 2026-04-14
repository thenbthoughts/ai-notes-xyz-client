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
        'flex flex-col items-center gap-0 rounded-lg px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100';

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex h-11 items-center justify-center gap-0.5 border-t border-zinc-800/80 bg-zinc-950/95 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.2)] backdrop-blur-sm">
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
                <LucidePlusCircle className="h-4 w-4 text-emerald-400/90" strokeWidth={2} />
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
                <LucideSearch className="h-4 w-4 text-zinc-300" strokeWidth={2} />
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
                <LucideFilter className="h-4 w-4 text-amber-400/90" strokeWidth={2} />
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
                <LucideList className="h-4 w-4 text-indigo-400/90" strokeWidth={2} />
                Board
            </button>
        </div>
    );
};

export default ComponentTaskListFooter;
