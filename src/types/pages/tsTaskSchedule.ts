// Task Schedule type for edit form and schema
export interface ITaskSchedule {
    // identification
    _id: string;
    username: string;

    // required
    isActive: boolean;
    shouldSendEmail: boolean;
    taskType: string;
    /*
    taskType:
    - taskAdd
    - notesAdd
    - customRestApiCall
    - customAiSummary
    - customTaskList
    */

    // required
    title: string;
    description: string;

    // schedule time
    timezoneName: string;
    timezoneOffset: number;
    scheduleTimeArr: string[];
    cronExpressionArr: string[];
    
    // executed
    scheduleExecutionTimeArr: string[];
    scheduleExecutedTimeArr: string[];
    executedTimes: number;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}

export interface ITaskScheduleTaskAdd {
    // identification
    taskWorkspaceId: string;
    taskStatusId: string;

    // task fields
    taskTitle: string;
    taskDatePrefix: boolean;
    taskDateTimePrefix: boolean;

    // deadline enabled
    taskDeadlineEnabled: boolean;
    taskDeadlineDays: number;

    // task ai fields
    taskAiSummary: boolean;
    taskAiContext: string;

    // subtask list
    subtaskArr: string[];
}

export interface ISendMyselfEmailForm {
    // auth
    username: string;

    // identification
    taskScheduleId: string;

    // email fields -> staticContent
    emailSubject: string;
    emailContent: string;
    
    // ai fields -> aiConversationMail
    aiEnabled: boolean;
    passAiContextEnabled: boolean;
    systemPrompt: string;
    userPrompt: string;

    // model info
    aiModelName: string;
    aiModelProvider: string;
}