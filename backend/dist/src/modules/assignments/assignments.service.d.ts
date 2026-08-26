import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
export declare class AssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAssignment(dto: CreateAssignmentDto, currentUserId: string): Promise<{
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
    }>;
    getAssignmentsByLesson(lessonId: string, studentId?: string): Promise<{
        submission: {
            id: string;
            grade: import("@prisma/client-runtime-utils").Decimal | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            studentId: string;
            status: string;
            xpEarned: number;
            feedback: string | null;
            assignmentId: string;
            submittedAt: Date;
            gradedAt: Date | null;
        };
        isSubmitted: boolean;
        isGraded: boolean;
        submissions: {
            id: string;
            grade: import("@prisma/client-runtime-utils").Decimal | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            studentId: string;
            status: string;
            xpEarned: number;
            feedback: string | null;
            assignmentId: string;
            submittedAt: Date;
            gradedAt: Date | null;
        }[];
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
    }[]>;
    submitAssignment(assignmentId: string, studentId: string, dto: SubmitAssignmentDto): Promise<{
        message: string;
        xpAwarded: number;
        submission: {
            id: string;
            grade: import("@prisma/client-runtime-utils").Decimal | null;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            studentId: string;
            status: string;
            xpEarned: number;
            feedback: string | null;
            assignmentId: string;
            submittedAt: Date;
            gradedAt: Date | null;
        };
    }>;
    getSubmissionsForTeacher(assignmentId: string, currentUserId: string): Promise<({
        student: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        };
    } & {
        id: string;
        grade: import("@prisma/client-runtime-utils").Decimal | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        studentId: string;
        status: string;
        xpEarned: number;
        feedback: string | null;
        assignmentId: string;
        submittedAt: Date;
        gradedAt: Date | null;
    })[]>;
    gradeSubmission(submissionId: string, currentUserId: string, dto: GradeSubmissionDto): Promise<{
        id: string;
        grade: import("@prisma/client-runtime-utils").Decimal | null;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        studentId: string;
        status: string;
        xpEarned: number;
        feedback: string | null;
        assignmentId: string;
        submittedAt: Date;
        gradedAt: Date | null;
    }>;
}
