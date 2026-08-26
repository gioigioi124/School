import { PrismaService } from '../../prisma/prisma.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
export declare class ClassEnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    enrollStudent(dto: EnrollStudentDto, currentUserId: string): Promise<{
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
    removeStudent(classId: string, studentId: string, currentUserId: string): Promise<{
        role: string;
        id: string;
        createdAt: Date;
        profileId: string;
        classId: string;
    }>;
}
