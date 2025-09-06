export interface IUserNotification {
    _id: string;
    username: string;
    smtpTo: string;
    subject: string;
    text: string;
    html: string;
    createdAtUtc: string;
}


