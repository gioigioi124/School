import { AttendanceService } from './attendance.service';
import { RecordAttendanceBatchDto } from './dto/record-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    recordBatch(user: any, dto: RecordAttendanceBatchDto): Promise<{
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
    getClassAttendance(classId: string, date: string): Promise<({
        student: {
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
