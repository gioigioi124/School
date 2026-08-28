import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    createAssignment(user: any, dto: CreateAssignmentDto): Promise<{
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
    getAssignmentsByLesson(lessonId: string, user: any): Promise<{
        submission: {
            id: string;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            grade: import("@prisma/client-runtime-utils").Decimal | null;
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
            content: import("@prisma/client/runtime/client").JsonValue | null;
            grade: import("@prisma/client-runtime-utils").Decimal | null;
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
    submitAssignment(assignmentId: string, user: any, dto: SubmitAssignmentDto): Promise<{
        message: string;
        xpAwarded: number;
        submission: {
            id: string;
            content: import("@prisma/client/runtime/client").JsonValue | null;
            grade: import("@prisma/client-runtime-utils").Decimal | null;
            studentId: string;
            status: string;
            xpEarned: number;
            feedback: string | null;
            assignmentId: string;
            submittedAt: Date;
            gradedAt: Date | null;
        };
    }>;
    getSubmissions(assignmentId: string, user: any): Promise<({
        student: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
            email: string;
        };
    } & {
        id: string;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        grade: import("@prisma/client-runtime-utils").Decimal | null;
        studentId: string;
        status: string;
        xpEarned: number;
        feedback: string | null;
        assignmentId: string;
        submittedAt: Date;
        gradedAt: Date | null;
    })[]>;
    gradeSubmission(submissionId: string, user: any, dto: GradeSubmissionDto): Promise<{
        id: string;
        content: import("@prisma/client/runtime/client").JsonValue | null;
        grade: import("@prisma/client-runtime-utils").Decimal | null;
        studentId: string;
        status: string;
        xpEarned: number;
        feedback: string | null;
        assignmentId: string;
        submittedAt: Date;
        gradedAt: Date | null;
    }>;
}
