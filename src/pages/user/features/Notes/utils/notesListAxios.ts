import { AxiosRequestConfig } from "axios";
import axiosCustom from "../../../../../config/axiosCustom";
import { DateTime } from "luxon";

export const notesAddAxios = async ({
    notesWorkspaceId,
}: {
    notesWorkspaceId: string;
}) => {
    try {
        const config = {
            method: 'post',
            url: `/api/notes/crud/notesAdd`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                notesWorkspaceId: notesWorkspaceId,
            },
        } as AxiosRequestConfig;

        const response = await axiosCustom.request(config);
        const doc = response.data.doc;

        if (typeof doc._id === 'string') {
            if (doc._id.length === 24) {
                return {
                    success: 'Success',
                    error: '',
                    recordId: doc._id,
                };
            }
        }

        return {
            success: '',
            error: 'An error occurred while adding the notes. Please try again.',
            recordId: '',
        };
    } catch (error) {
        console.error(error);
        alert('An error occurred while adding the notes. Please try again.');
        return {
            success: false,
            error: 'An error occurred while adding the notes. Please try again.',
            recordId: '',
        };
    }
}

export const notesQuickDailyNotesAddAxios = async (): Promise<{
    success: string;
    error: string;
    recordId: string;
    workspaceId: string;
}> => {
    // there are 3 steps to add quick daily notes
    // 1. get or create workspace
    // 2. get notes by title
    // 3. add notes
    try {
        let notesWorkspaceId = '';

        // step 1: get or create workspace
        const result = await axiosCustom.post(
            '/api/notes-workspace/crud/notesWorkspaceGet'
        );
        if (result.data.docs) {
            if (result.data.docs.length > 0) {
                let notesWorkspaceArr = result.data.docs;
                notesWorkspaceArr.forEach((item: {
                    _id: string;
                    title: string;
                }) => {
                    if (item.title === 'Quick Daily Notes') {
                        notesWorkspaceId = item._id;
                    }
                });
            }
        }

        if (notesWorkspaceId === '') {
            const createResult = await axiosCustom.request({
                method: 'post',
                url: '/api/notes-workspace/crud/notesWorkspaceAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    title: 'Quick Daily Notes',
                    description: 'Quick Daily Notes',
                },
            });
            if (createResult.data.doc) {
                notesWorkspaceId = createResult.data.doc._id;
            }
        }

        if (notesWorkspaceId === '') {
            return {
                success: '',
                error: 'No notes workspace found. Please create a notes workspace first.',
                recordId: '',
                workspaceId: '',
            };
        }

        const notesTitle = DateTime.now().toFormat('yyyy-MM-dd');

        // step 2: get notes by title
        const responseNotesGet = await axiosCustom.request({
            method: 'post',
            url: `/api/notes/crud/notesGet`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                title: notesTitle,
                notesWorkspaceId: notesWorkspaceId,
            },
        });

        if (responseNotesGet.data.docs) {
            if (responseNotesGet.data.docs.length > 0) {
                return {
                    success: 'Success',
                    error: '',
                    recordId: responseNotesGet.data.docs[0]._id,
                    workspaceId: notesWorkspaceId,
                };
            }
        }

        // step 3: add notes
        const responseNotesAdd = await axiosCustom.request({
            method: 'post',
            url: `/api/notes/crud/notesAdd`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                title: notesTitle,
                notesWorkspaceId: notesWorkspaceId,
            },
        });
        const doc = responseNotesAdd.data.doc;

        if (typeof doc._id === 'string') {
            if (doc._id.length === 24) {
                return {
                    success: 'Success',
                    error: '',
                    recordId: doc._id,
                    workspaceId: notesWorkspaceId,
                };
            }
        }

        return {
            success: '',
            error: 'An error occurred while adding the quick daily notes. Please try again.',
            recordId: '',
            workspaceId: '',
        };
    } catch (error) {
        console.error(error);
        alert('An error occurred while adding the quick daily notes. Please try again.');
        return {
            success: '',
            error: 'An error occurred while adding the quick daily notes. Please try again.',
            recordId: '',
            workspaceId: '',
        };
    }
}

export const notesQuickTaskAddAxios = async (): Promise<{
    success: string;
    error: string;
    recordId: string;
    workspaceId: string;
}> => {
    // there are 3 steps to add quick daily notes
    // 1. get or create workspace - "Daily Task"
    // 2. get task by title
    // 3. add task
    try {
        console.log('Adding quick task');

        let taskWorkspaceId = '';

        // step 1: get or create workspace
        const result = await axiosCustom.post(
            '/api/task-workspace/crud/taskWorkspaceGet'
        );
        if (result.data.docs) {
            if (result.data.docs.length > 0) {
                let taskWorkspaceArr = result.data.docs;
                taskWorkspaceArr.forEach((item: {
                    _id: string;
                    title: string;
                }) => {
                    if (item.title === 'Daily Task') {
                        taskWorkspaceId = item._id;
                    }
                });
            }
        }

        if (taskWorkspaceId === '') {
            const createResult = await axiosCustom.request({
                method: 'post',
                url: '/api/task-workspace/crud/taskWorkspaceAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    title: 'Daily Task',
                    description: 'Daily Task',
                },
            });
            if (createResult.data.doc) {
                taskWorkspaceId = createResult.data.doc._id;
            }
        }

        if (taskWorkspaceId === '') {
            return {
                success: '',
                error: 'No task workspace found. Please create a task workspace first.',
                recordId: '',
                workspaceId: '',
            };
        }

        const taskTitle = DateTime.now().toFormat('yyyy-MM-dd');

        // step 2: get notes by title
        const responseTaskGet = await axiosCustom.request({
            method: 'post',
            url: `/api/task/crud/taskGet`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                title: taskTitle,
                taskWorkspaceId: taskWorkspaceId,
            },
        });

        if (responseTaskGet.data.docs) {
            if (responseTaskGet.data.docs.length > 0) {
                return {
                    success: 'Success',
                    error: '',
                    recordId: responseTaskGet.data.docs[0]._id,
                    workspaceId: taskWorkspaceId,
                };
            }
        }

        // step 3: add notes
        const responseTaskAdd = await axiosCustom.request({
            method: 'post',
            url: `/api/task/crud/taskAdd`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                title: taskTitle,
                taskWorkspaceId: taskWorkspaceId,
            },
        });
        const doc = responseTaskAdd.data;
        if (typeof doc._id === 'string') {
            if (doc._id.length === 24) {
                return {
                    success: 'Success',
                    error: '',
                    recordId: doc._id,
                    workspaceId: taskWorkspaceId,
                };
            }
        }

        return {
            success: '',
            error: 'An error occurred while adding the quick daily notes. Please try again.',
            recordId: '',
            workspaceId: '',
        };
    } catch (error) {
        console.error(error);
        alert('An error occurred while adding the quick daily notes. Please try again.');
        return {
            success: '',
            error: 'An error occurred while adding the quick daily notes. Please try again.',
            recordId: '',
            workspaceId: '',
        };
    }
}