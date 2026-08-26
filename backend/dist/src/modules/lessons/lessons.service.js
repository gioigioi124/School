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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LessonsService = class LessonsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLesson(dto, currentUserId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: dto.classId },
            include: { enrollments: true },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        const isTeacher = classData.enrollments.some((e) => e.profileId === currentUserId && e.role === 'teacher');
        if (!isTeacher) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Chỉ giáo viên của lớp mới có quyền tạo bài giảng');
            }
        }
        return this.prisma.lesson.create({
            data: {
                classId: dto.classId,
                teacherId: currentUserId,
                title: dto.title,
                description: dto.description,
                content: dto.content,
                videoUrl: dto.videoUrl,
                thumbnailUrl: dto.thumbnailUrl,
                duration: dto.duration ?? 0,
                orderIndex: dto.orderIndex ?? 0,
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async getLessonsByClass(classId, currentUserId) {
        const lessons = await this.prisma.lesson.findMany({
            where: { classId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: {
                        assignments: true,
                    },
                },
                progresses: currentUserId
                    ? {
                        where: { studentId: currentUserId },
                    }
                    : false,
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });
        return lessons.map((lesson) => {
            const progress = lesson.progresses?.[0];
            return {
                ...lesson,
                isCompleted: progress?.isCompleted || false,
                xpEarned: progress?.xpEarned || 0,
                assignmentCount: lesson._count.assignments,
            };
        });
    }
    async getLessonById(id, currentUserId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                assignments: true,
                progresses: currentUserId
                    ? {
                        where: { studentId: currentUserId },
                    }
                    : false,
            },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Bài giảng không tồn tại');
        }
        const progress = lesson.progresses?.[0];
        return {
            ...lesson,
            isCompleted: progress?.isCompleted || false,
            xpEarned: progress?.xpEarned || 0,
        };
    }
    async updateLesson(id, dto, currentUserId) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new common_1.NotFoundException('Bài giảng không tồn tại');
        }
        if (lesson.teacherId !== currentUserId) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa bài học này');
            }
        }
        return this.prisma.lesson.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.content !== undefined && { content: dto.content }),
                ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
                ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
                ...(dto.duration !== undefined && { duration: dto.duration }),
                ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
            },
        });
    }
    async deleteLesson(id, currentUserId) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new common_1.NotFoundException('Bài giảng không tồn tại');
        }
        if (lesson.teacherId !== currentUserId) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền xoá bài học này');
            }
        }
        return this.prisma.lesson.delete({ where: { id } });
    }
    async completeLesson(lessonId, studentId) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw new common_1.NotFoundException('Bài học không tồn tại');
        }
        const progress = await this.prisma.studentProgress.upsert({
            where: {
                studentId_lessonId: {
                    studentId,
                    lessonId,
                },
            },
            update: {
                isCompleted: true,
                completedAt: new Date(),
                xpEarned: 10,
            },
            create: {
                studentId,
                lessonId,
                isCompleted: true,
                completedAt: new Date(),
                xpEarned: 10,
            },
        });
        return {
            message: 'Chúc mừng bạn đã hoàn thành bài học! Nhận được +10 XP.',
            xpAwarded: 10,
            progress,
        };
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map