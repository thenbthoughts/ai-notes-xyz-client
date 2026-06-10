export interface IUserNotification {
    _id: string;
    smtpTo: string;
    subject: string;
    text: string;
    html: string;
    channel?: 'email' | 'telegram';
    telegramChatId?: string;
    createdAtUtc: string;
}


