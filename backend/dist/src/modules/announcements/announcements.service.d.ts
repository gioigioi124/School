import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAnnouncement(dto: CreateAnnouncementDto, currentUserId: string): Promise<{
        class: {
            description: string | null;
            school: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            phone: string | null;
            school: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
            parentPhone: string | null;
            parentName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        classId: string;
        isImportant: boolean;
        teacherId: string;
    }>;
    getAnnouncementsByClass(classId: string, userId?: string): Promise<({
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        classId: string;
        isImportant: boolean;
        teacherId: string;
    })[]>;
    getFeedForUser(userId: string): Promise<({
        class: {
            description: string | null;
            school: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        classId: string;
        isImportant: boolean;
        teacherId: string;
    })[]>;
    getAnnouncementById(id: string): Promise<{
        class: {
            description: string | null;
            school: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            phone: string | null;
            school: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
            parentPhone: string | null;
            parentName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        classId: string;
        isImportant: boolean;
        teacherId: string;
    }>;
    updateAnnouncement(id: string, dto: UpdateAnnouncementDto, currentUserId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        classId: string;
        isImportant: boolean;
        teacherId: string;
    }>;
    deleteAnnouncement(id: string, currentUserId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        classId: string;
        isImportant: boolean;
        teacherId: string;
    }>;
}
