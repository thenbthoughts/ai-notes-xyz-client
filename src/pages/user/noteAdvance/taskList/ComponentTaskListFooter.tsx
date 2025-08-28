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
}> = ({
    setIsTaskAddModalIsOpen,
}) => {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-md h-[50px] flex items-center justify-center space-x-4">
                <button
                    className="flex flex-col items-center"
                    onClick={() => {
                        setIsTaskAddModalIsOpen({
                            openStatus: true,
                            modalType: 'add',
                            recordId: ''
                        })
                    }}
                >
                    <LucidePlusCircle className="text-white" />
                </button>
                <button
                    className="flex flex-col items-center"
                    onClick={() => {
                        const taskSearchElement = document.getElementById('task-search');
                        if (taskSearchElement) {
                            taskSearchElement.scrollIntoView({ behavior: 'smooth' });
                            taskSearchElement.focus();
                        }
                    }}
                >
                    <LucideSearch className="text-white" />
                </button>
                <button
                    className="flex flex-col items-center"
                    onClick={() => {
                        const filterSection = document.getElementById('task-filter');
                        if (filterSection) {
                            filterSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    <LucideFilter className="text-white" />
                </button>
                <button
                    className="flex flex-col items-center"
                    onClick={() => {
                        const taskListSection = document.getElementById('task-list');
                        if (taskListSection) {
                            taskListSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    <LucideList className="text-white" />
                </button>
            </div>
        )
    };

export default ComponentTaskListFooter;