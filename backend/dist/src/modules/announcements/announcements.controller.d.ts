import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    createAnnouncement(user: any, dto: CreateAnnouncementDto): Promise<{
        class: {
            description: string | null;
            avatarUrl: string | null;
            id: string;
            school: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
            phone: string | null;
            parentPhone: string | null;
            parentName: string | null;
            school: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string;
        isImportant: boolean;
        teacherId: string;
    }>;
    getFeed(user: any): Promise<({
        class: {
            description: string | null;
            avatarUrl: string | null;
            id: string;
            school: string | null;
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
        classId: string;
        content: string;
        isImportant: boolean;
        teacherId: string;
    })[]>;
    getAnnouncementsByClass(classId: string, user: any): Promise<({
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
        classId: string;
        content: string;
        isImportant: boolean;
        teacherId: string;
    })[]>;
    getAnnouncementById(id: string): Promise<{
        class: {
            description: string | null;
            avatarUrl: string | null;
            id: string;
            school: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
            phone: string | null;
            parentPhone: string | null;
            parentName: string | null;
            school: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string;
        isImportant: boolean;
        teacherId: string;
    }>;
    updateAnnouncement(id: string, user: any, dto: UpdateAnnouncementDto): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string;
        isImportant: boolean;
        teacherId: string;
    }>;
    deleteAnnouncement(id: string, user: any): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string;
        isImportant: boolean;
        teacherId: string;
    }>;
}
