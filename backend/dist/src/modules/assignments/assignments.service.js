"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AssignmentsService = class AssignmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAssignment(dto, currentUserId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
            include: { class: { include: { enrollments: true } } },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Bài giảng không tồn tại');
        }
        const isTeacher = lesson.class.enrollments.some((e) => e.profileId === currentUserId && e.role === 'teacher');
        if (!isTeacher) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Chỉ giáo viên của lớp mới có quyền tạo bài tập');
            }
        }
        return this.prisma.assignment.create({
            data: {
                lessonId: dto.lessonId,
                title: dto.title,
                description: dto.description,
                type: dto.type || 'quiz',
                content: dto.content,
                xpReward: dto.xpReward ?? 20,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            },
        });
    }
    async getAssignmentsByLesson(lessonId, studentId) {
        const assignments = await this.prisma.assignment.findMany({
            where: { lessonId },
            include: {
                submissions: studentId
                    ? {
                        where: { studentId },
                    }
                    : false,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return assignments.map((a) => {
            const sub = a.submissions?.[0];
            return {
                ...a,
                submission: sub || null,
                isSubmitted: !!sub,
                isGraded: sub?.status === 'graded',
            };
        });
    }
    async submitAssignment(assignmentId, studentId, dto) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Bài tập không tồn tại');
        }
        const defaultXp = assignment.xpReward || 20;
        const submission = await this.prisma.submission.upsert({
            where: {
                studentId_assignmentId: {
                    studentId,
                    assignmentId,
                },
            },
            update: {
                content: dto.content,
                status: 'submitted',
                submittedAt: new Date(),
            },
            create: {
                studentId,
                assignmentId,
                content: dto.content,
                status: 'submitted',
                xpEarned: defaultXp,
            },
        });
        return {
            message: 'Nộp bài tập thành công! Bạn nhận được +' + defaultXp + ' XP.',
            xpAwarded: defaultXp,
            submission,
        };
    }
    async getSubmissionsForTeacher(assignmentId, currentUserId) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                lesson: {
                    include: {
                        class: { include: { enrollments: true } },
                    },
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Bài tập không tồn tại');
        }
        const isTeacher = assignment.lesson.class.enrollments.some((e) => e.profileId === currentUserId && e.role === 'teacher');
        if (!isTeacher) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền xem danh sách bài nộp');
            }
        }
        return this.prisma.submission.findMany({
            where: { assignmentId },
            include: {
                student: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }
    async gradeSubmission(submissionId, currentUserId, dto) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                assignment: {
                    include: {
                        lesson: {
                            include: { class: { include: { enrollments: true } } },
                        },
                    },
                },
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException('Bài làm không tồn tại');
        }
        const isTeacher = submission.assignment.lesson.class.enrollments.some((e) => e.profileId === currentUserId && e.role === 'teacher');
        if (!isTeacher) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền chấm bài này');
            }
        }
        const calculatedXp = dto.xpEarned ??
            (dto.grade >= 9 ? 30 : dto.grade >= 5 ? 20 : 10);
        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                grade: dto.grade,
                feedback: dto.feedback,
                xpEarned: calculatedXp,
                status: 'graded',
                gradedAt: new Date(),
            },
        });
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map