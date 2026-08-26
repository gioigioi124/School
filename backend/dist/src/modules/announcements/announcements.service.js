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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAnnouncement(dto, currentUserId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: dto.classId },
            include: {
                enrollments: true,
            },
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
                throw new common_1.ForbiddenException('Chỉ giáo viên của lớp mới có quyền tạo thông báo');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const announcement = await tx.announcement.create({
                data: {
                    teacherId: currentUserId,
                    classId: dto.classId,
                    title: dto.title,
                    content: dto.content,
                    isImportant: dto.isImportant ?? false,
                },
                include: {
                    teacher: true,
                    class: true,
                },
            });
            const studentEnrollments = classData.enrollments.filter((e) => e.role === 'student' && e.profileId !== currentUserId);
            if (studentEnrollments.length > 0) {
                await tx.notification.createMany({
                    data: studentEnrollments.map((e) => ({
                        userId: e.profileId,
                        announcementId: announcement.id,
                        title: dto.isImportant
                            ? `[QUAN TRỌNG] ${dto.title}`
                            : `Thông báo mới từ ${classData.name}: ${dto.title}`,
                        content: dto.content.slice(0, 150),
                    })),
                });
            }
            return announcement;
        });
    }
    async getAnnouncementsByClass(classId, userId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        return this.prisma.announcement.findMany({
            where: { classId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getFeedForUser(userId) {
        const userEnrollments = await this.prisma.classEnrollment.findMany({
            where: { profileId: userId },
            select: { classId: true },
        });
        const classIds = userEnrollments.map((e) => e.classId);
        if (classIds.length === 0) {
            return this.prisma.announcement.findMany({
                include: {
                    teacher: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    class: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 20,
            });
        }
        return this.prisma.announcement.findMany({
            where: {
                classId: { in: classIds },
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                class: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getAnnouncementById(id) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
            include: {
                teacher: true,
                class: true,
            },
        });
        if (!announcement) {
            throw new common_1.NotFoundException('Thông báo không tồn tại');
        }
        return announcement;
    }
    async updateAnnouncement(id, dto, currentUserId) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
        });
        if (!announcement) {
            throw new common_1.NotFoundException('Thông báo không tồn tại');
        }
        if (announcement.teacherId !== currentUserId) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa thông báo này');
            }
        }
        return this.prisma.announcement.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.content !== undefined && { content: dto.content }),
                ...(dto.isImportant !== undefined && { isImportant: dto.isImportant }),
            },
        });
    }
    async deleteAnnouncement(id, currentUserId) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
        });
        if (!announcement) {
            throw new common_1.NotFoundException('Thông báo không tồn tại');
        }
        if (announcement.teacherId !== currentUserId) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: currentUserId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền xoá thông báo này');
            }
        }
        return this.prisma.announcement.delete({
            where: { id },
        });
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map