import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserNotifications(userId: string): Promise<{
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
    markAsRead(notificationId: string, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        content: string;
        userId: string;
        announcementId: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
