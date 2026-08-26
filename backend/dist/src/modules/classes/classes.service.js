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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createClass(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const newClass = await tx.class.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    school: dto.school,
                    grade: dto.grade,
                    avatarUrl: dto.avatarUrl,
                },
            });
            await tx.classEnrollment.create({
                data: {
                    classId: newClass.id,
                    profileId: userId,
                    role: 'teacher',
                },
            });
            return newClass;
        });
    }
    async getClassesForUser(userId) {
        const userEnrollments = await this.prisma.classEnrollment.findMany({
            where: { profileId: userId },
            include: {
                class: {
                    include: {
                        _count: {
                            select: {
                                enrollments: {
                                    where: { role: 'student' },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (userEnrollments.length > 0) {
            return userEnrollments.map((e) => ({
                ...e.class,
                role: e.role,
                studentCount: e.class._count.enrollments,
            }));
        }
        const allClasses = await this.prisma.class.findMany({
            include: {
                _count: {
                    select: {
                        enrollments: {
                            where: { role: 'student' },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return allClasses.map((cls) => ({
            ...cls,
            role: 'viewer',
            studentCount: cls._count.enrollments,
        }));
    }
    async getClassById(classId, userId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                enrollments: {
                    include: {
                        profile: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: {
                            where: { role: 'student' },
                        },
                    },
                },
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        const teachers = classData.enrollments
            .filter((e) => e.role === 'teacher')
            .map((e) => e.profile);
        const students = classData.enrollments
            .filter((e) => e.role === 'student')
            .map((e) => e.profile);
        return {
            ...classData,
            teachers,
            students,
            studentCount: classData._count.enrollments,
        };
    }
    async updateClass(classId, userId, dto) {
        const enrollment = await this.prisma.classEnrollment.findFirst({
            where: {
                classId,
                profileId: userId,
                role: 'teacher',
            },
        });
        if (!enrollment) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: userId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa lớp học này');
            }
        }
        return this.prisma.class.update({
            where: { id: classId },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.school !== undefined && { school: dto.school }),
                ...(dto.grade !== undefined && { grade: dto.grade }),
                ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
            },
        });
    }
    async deleteClass(classId, userId) {
        const enrollment = await this.prisma.classEnrollment.findFirst({
            where: {
                classId,
                profileId: userId,
                role: 'teacher',
            },
        });
        if (!enrollment) {
            const isAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: userId,
                    role: { name: 'admin' },
                },
            });
            if (!isAdmin) {
                throw new common_1.ForbiddenException('Bạn không có quyền xoá lớp học này');
            }
        }
        return this.prisma.class.delete({
            where: { id: classId },
        });
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map