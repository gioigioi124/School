import { ClassEnrollmentsService } from './class-enrollments.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
export declare class ClassEnrollmentsController {
    private readonly classEnrollmentsService;
    constructor(classEnrollmentsService: ClassEnrollmentsService);
    enrollStudent(user: any, enrollStudentDto: EnrollStudentDto): Promise<{
        profile: {
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
    } & {
        role: string;
        id: string;
        createdAt: Date;
        profileId: string;
        classId: string;
    }>;
    getEnrollmentsByClass(classId: string): Promise<({
        profile: {
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
        role: string;
        id: string;
        createdAt: Date;
        profileId: string;
        classId: string;
    })[]>;
    removeStudent(user: any, classId: string, studentId: string): Promise<{
        role: string;
        id: string;
        createdAt: Date;
        profileId: string;
        classId: string;
    }>;
}
