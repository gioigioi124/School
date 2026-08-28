import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    createClass(userId: string, dto: CreateClassDto): Promise<{
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
    getClassesForUser(userId: string): Promise<{
        role: string;
        studentCount: number;
        _count: {
            enrollments: number;
        };
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }[]>;
    getClassById(classId: string, userId?: string): Promise<{
        teachers: {
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
        }[];
        students: {
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
        }[];
        studentCount: number;
        enrollments: ({
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
        })[];
        _count: {
            enrollments: number;
        };
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
    updateClass(classId: string, userId: string, dto: UpdateClassDto): Promise<{
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
    deleteClass(classId: string, userId: string): Promise<{
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
}
