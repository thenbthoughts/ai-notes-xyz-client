import { Fragment, useEffect, useState } from 'react';

import axiosCustom from '../../../../../config/axiosCustom.ts';

const ComponentSelectTaskStatus = ({
    workspaceId,
    taskStatusId,
    setTaskStatusId,
    modalType
}: {
    workspaceId: string;
    taskStatusId: string;
    setTaskStatusId: (taskStatusId: string) => void;
    modalType: 'add' | 'edit';
}) => {
    const [listArr, setListArr] = useState<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>([]);

    useEffect(() => {
        const fetchGroupList = async () => {
            try {
                if (workspaceId.length !== 24) {
                    setListArr([]);
                    return;
                }

                const response = await axiosCustom.post('/api/task-status-list/crud/taskStatusListGet', {
                    taskWorkspaceId: workspaceId,
                });
                if (Array.isArray(response.data?.docs)) {
                    const docs = response.data.docs as {
                        _id: string;
                        statusTitle: string;
                        listPosition: number;
                    }[];

                    if (modalType === 'add') {
                        if (taskStatusId.length !== 24) {
                            setTaskStatusId(docs[0]._id);
                        }
                    }

                    setListArr(docs); // Assuming the response data is an array of group names
                } else {
                    console.error('Invalid response format: Expected an array');
                }
            } catch (error) {
                console.error('Error fetching task boards:', error);
            }
        };

        fetchGroupList();
    }, [workspaceId]);

    return (
        <Fragment>
            {listArr.length > 0 && (
                <select
                    className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={taskStatusId}
                    onChange={(e) => {
                        setTaskStatusId(e.target.value);
                    }}
                >
                    {listArr.map((list) => (
                        <option key={list._id} value={list._id}>
                            {list.statusTitle}
                        </option>
                    ))}
                </select>
            )}
            {listArr.length === 0 && (
                <div className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    No task status found
                </div>
            )}
        </Fragment>

    );
};

export default ComponentSelectTaskStatus;