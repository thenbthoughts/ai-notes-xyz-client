import { LucidePlusCircle, LucideSearch, LucideList, LucideSettings } from 'lucide-react';

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
            <button className="flex flex-col items-center">
                <LucideSearch className="text-white" />
            </button>
            <button className="flex flex-col items-center">
                <LucideList className="text-white" />
            </button>
            <button className="flex flex-col items-center">
                <LucideSettings className="text-white" />
            </button>
        </div>
    )
};

export default ComponentTaskListFooter;