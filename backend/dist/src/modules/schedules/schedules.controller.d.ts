import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class SchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: SchedulesService);
    getByClass(classId: string): Promise<({
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
    getOne(id: string): Promise<{
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
    create(user: any, dto: CreateScheduleDto): Promise<{
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
    update(id: string, user: any, dto: UpdateScheduleDto): Promise<{
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
    delete(id: string, user: any): Promise<{
        success: boolean;
        message: string;
        deletedId: string;
    }>;
    applyTemplate(classId: string, user: any, replace?: string): Promise<{
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
