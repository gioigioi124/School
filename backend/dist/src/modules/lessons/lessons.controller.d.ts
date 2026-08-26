import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    createLesson(user: any, dto: CreateLessonDto): Promise<{
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
    getLessonsByClass(classId: string, user: any): Promise<{
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
    getLessonById(id: string, user: any): Promise<{
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
    updateLesson(id: string, user: any, dto: UpdateLessonDto): Promise<{
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
    deleteLesson(id: string, user: any): Promise<{
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
    completeLesson(id: string, user: any): Promise<{
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
