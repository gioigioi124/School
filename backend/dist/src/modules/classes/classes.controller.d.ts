import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    createClass(user: any, createClassDto: CreateClassDto): Promise<{
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
    getClasses(user: any): Promise<{
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
    getClassById(user: any, classId: string): Promise<{
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
    updateClass(user: any, classId: string, updateClassDto: UpdateClassDto): Promise<{
        description: string | null;
        school: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        grade: string | null;
    }>;
    deleteClass(user: any, classId: string): Promise<{
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
