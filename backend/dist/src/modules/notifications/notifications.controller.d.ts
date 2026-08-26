import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: any): Promise<{
        unreadCount: number;
        notifications: ({
            announcement: {
                class: {
                    avatarUrl: string | null;
                    id: string;
                    name: string;
                };
                id: string;
                classId: string;
                isImportant: boolean;
            } | null;
        } & {
            title: string;
            id: string;
            createdAt: Date;
            content: string;
            userId: string;
            announcementId: string | null;
            isRead: boolean;
            readAt: Date | null;
        })[];
    }>;
    markAsRead(id: string, user: any): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        userId: string;
        announcementId: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(user: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
