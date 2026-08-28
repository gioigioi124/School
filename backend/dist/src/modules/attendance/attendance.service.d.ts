import { PrismaService } from '../../prisma/prisma.service';
import { RecordAttendanceBatchDto } from './dto/record-attendance.dto';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    recordBatch(dto: RecordAttendanceBatchDto, currentUserId: string): Promise<{
        message: string;
        date: string;
        count: number;
        records: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            classId: string;
            studentId: string;
            status: string;
            note: string | null;
            date: Date;
        }[];
    }>;
    getClassAttendanceByDate(classId: string, dateString: string): Promise<({
        student: {
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        classId: string;
        studentId: string;
        status: string;
        note: string | null;
        date: Date;
    })[]>;
    getStudentStreak(studentId: string, classId?: string): Promise<{
        studentId: string;
        classId: string | undefined;
        currentStreak: number;
        totalPresentDays: number;
        historyCount: number;
    }>;
}
