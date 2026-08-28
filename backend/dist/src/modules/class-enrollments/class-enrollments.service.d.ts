import { PrismaService } from '../../prisma/prisma.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
export declare class ClassEnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    enrollStudent(dto: EnrollStudentDto, currentUserId: string): Promise<{
        profile: {
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
    } & {
        role: string;
        id: string;
        createdAt: Date;
        classId: string;
        profileId: string;
    }>;
    getEnrollmentsByClass(classId: string): Promise<({
        profile: {
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
        role: string;
        id: string;
        createdAt: Date;
        classId: string;
        profileId: string;
    })[]>;
    removeStudent(classId: string, studentId: string, currentUserId: string): Promise<{
        role: string;
        id: string;
        createdAt: Date;
        classId: string;
        profileId: string;
    }>;
}
