import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
export declare class LessonsService {
    private prisma;
    constructor(prisma: PrismaService);
    createLesson(dto: CreateLessonDto, currentUserId: string): Promise<{
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string | null;
        teacherId: string;
        videoUrl: string | null;
        thumbnailUrl: string | null;
        duration: number;
        orderIndex: number;
    }>;
    getLessonsByClass(classId: string, currentUserId?: string): Promise<{
        isCompleted: boolean;
        xpEarned: number;
        assignmentCount: number;
        progresses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            lessonId: string;
            isCompleted: boolean;
            completedAt: Date | null;
            xpEarned: number;
        }[];
        _count: {
            assignments: number;
        };
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
        };
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string | null;
        teacherId: string;
        videoUrl: string | null;
        thumbnailUrl: string | null;
        duration: number;
        orderIndex: number;
    }[]>;
    getLessonById(id: string, currentUserId?: string): Promise<{
        isCompleted: boolean;
        xpEarned: number;
        progresses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            lessonId: string;
            isCompleted: boolean;
            completedAt: Date | null;
            xpEarned: number;
        }[];
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
        };
        assignments: {
            type: string;
            description: string | null;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            lessonId: string;
            xpReward: number;
            dueDate: Date | null;
        }[];
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string | null;
        teacherId: string;
        videoUrl: string | null;
        thumbnailUrl: string | null;
        duration: number;
        orderIndex: number;
    }>;
    updateLesson(id: string, dto: UpdateLessonDto, currentUserId: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string | null;
        teacherId: string;
        videoUrl: string | null;
        thumbnailUrl: string | null;
        duration: number;
        orderIndex: number;
    }>;
    deleteLesson(id: string, currentUserId: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        content: string | null;
        teacherId: string;
        videoUrl: string | null;
        thumbnailUrl: string | null;
        duration: number;
        orderIndex: number;
    }>;
    completeLesson(lessonId: string, studentId: string): Promise<{
        message: string;
        xpAwarded: number;
        progress: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            lessonId: string;
            isCompleted: boolean;
            completedAt: Date | null;
            xpEarned: number;
        };
    }>;
}
