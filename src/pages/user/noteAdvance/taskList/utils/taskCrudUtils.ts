import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";

export const taskChatWithAi = async (taskId: string): Promise<void> => {
    /**
     * Chat with AI about a task - One function that does everything:
     * 1. Fetches task details by ID
     * 2. Creates chat thread
     * 3. Prepares task context
     * 4. Sends message to AI
     * 5. Returns redirect URL
     */
    const toastLoadingId = toast.loading('Starting chat with AI...');

    try {
        // Step 1: Get task details
        const taskResponse = await axiosCustom.post('/api/task/crud/taskGet', {
            recordId: taskId
        });

        if (!taskResponse.data?.docs?.[0]) {
            toast.dismiss(toastLoadingId);
            toast.error('Task not found');
            return;
        }

        const task = taskResponse.data.docs[0];

        // Step 2: Create chat thread
        const threadResponse = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd', {
            threadTitle: `Task Discussion: ${task.title}`,
            isPersonalContextEnabled: false,
            isAutoAiContextSelectEnabled: false,
            aiModelProvider: 'openrouter',
            aiModelName: 'openrouter/auto',
        });

        const threadId = threadResponse?.data?.thread?._id;
        if (!threadId) {
            toast.dismiss(toastLoadingId);
            toast.error('Failed to create chat thread');
            return;
        }

        // Step 3: Prepare task context
        const taskContext = prepareTaskContext(task);

        // Step 4: Send message to AI
        await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
            threadId: threadId,
            type: "text",
            content: taskContext,
            visibility: 'public',
            tags: ['task-discussion', `task-${taskId}`],
            imagePathsArr: []
        });

        toast.dismiss(toastLoadingId);
        toast.success('AI chat started successfully!');

        // Step 6: Redirect to chat page
        window.location.href = `/user/chat?id=${threadId}`;
    } catch (error) {
        toast.dismiss(toastLoadingId);
        console.error('Error starting task chat:', error);
        toast.error('Failed to start chat with AI. Please try again.');
    }
};

/**
 * Helper function to format task context for AI
 */
const prepareTaskContext = (task: any): string => {
    console.log('task', task);
    const formatDate = (date: any) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString();
    };

    const formatPriority = (priority: string) => {
        const priorityMap: { [key: string]: string } = {
            'very-low': 'Very Low',
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'very-high': 'Very High',
            '': 'Not set'
        };
        return priorityMap[priority] || priority;
    };

    let context = `\n\nTask Details\n\n`;

    context += `Task Title: ${task.title}\n\n`;

    if (task.description) {
        context += `Description:\n${task.description}\n\n`;
    }

    context += `Priority: ${formatPriority(task.priority || '')}\n`;
    context += `Due Date: ${formatDate(task.dueDate)}\n`;
    context += `Status: ${task.isCompleted ? '✅ Completed' : '⏳ In Progress'}\n\n`;

    if (task.labels?.length > 0) {
        context += `Labels: ${task.labels.join(', ')}\n`;
    }

    if (task.tasksSub?.length > 0) {
        context += `\n\nSubtasks:\n`;
        task.tasksSub.forEach((subtask: any, index: number) => {
            const status = subtask.taskCompletedStatus ? '✅ Completed' : '⏳ In Progress';
            context += `${index + 1}. ${status} ${subtask.title}\n`;
        });
    }

    if (task.taskComments?.length > 0) {
        context += `\n\nRecent Comments:\n`;
        task.taskComments.forEach((comment: any) => {
            context += `- ${comment.commentText}\n`;
        });
    }

    context += `\n\nTask ID: ${task._id}\n`;
    context += `Created: ${formatDate(task.createdAtUtc)}\n`;

    if (task.labelsAi?.length > 0) {
        context += `AI Labels: ${task.labelsAi.join(', ')}\n`;
    }

    context += `\n---\n\nI'd like to discuss this task with you. How can you help me with it?`;

    console.log('context', context);

    return context;
};