import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class SchedulesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateTeacherOrAdmin(classId: string, userId: string): Promise<{
        enrollments: {
            role: string;
            id: string;
            createdAt: Date;
            classId: string;
            profileId: string;
        }[];
    } & {
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
    private validateTimeRange;
    findAllByClass(classId: string): Promise<({
        class: {
            id: string;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        teacherId: string | null;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        subject: string;
        room: string | null;
        color: string | null;
    })[]>;
    findOne(id: string): Promise<{
        class: {
            id: string;
            name: string;
            grade: string | null;
        };
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        teacherId: string | null;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        subject: string;
        room: string | null;
        color: string | null;
    }>;
    create(dto: CreateScheduleDto, userId: string): Promise<{
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        teacherId: string | null;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        subject: string;
        room: string | null;
        color: string | null;
    }>;
    update(id: string, dto: UpdateScheduleDto, userId: string): Promise<{
        teacher: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        teacherId: string | null;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        subject: string;
        room: string | null;
        color: string | null;
    }>;
    delete(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        deletedId: string;
    }>;
    applyTemplate(classId: string, userId: string, replaceExisting?: boolean): Promise<{
        message: string;
        classId: string;
        count: number;
        items: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            teacherId: string | null;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            subject: string;
            room: string | null;
            color: string | null;
        }[];
    }>;
}
