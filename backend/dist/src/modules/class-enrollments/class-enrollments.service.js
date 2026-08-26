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
exports.ClassEnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClassEnrollmentsService = class ClassEnrollmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enrollStudent(dto, currentUserId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: dto.classId },
            include: {
                enrollments: true,
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        const studentProfile = await this.prisma.profile.findUnique({
            where: { id: dto.studentId },
        });
        if (!studentProfile) {
            throw new common_1.NotFoundException('Hồ sơ học sinh không tồn tại');
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
                throw new common_1.ForbiddenException('Bạn không có quyền thêm học sinh vào lớp học này');
            }
        }
        const existingEnrollment = await this.prisma.classEnrollment.findUnique({
            where: {
                classId_profileId: {
                    classId: dto.classId,
                    profileId: dto.studentId,
                },
            },
        });
        if (existingEnrollment) {
            throw new common_1.ConflictException('Học sinh đã có trong lớp này');
        }
        return this.prisma.classEnrollment.create({
            data: {
                classId: dto.classId,
                profileId: dto.studentId,
                role: dto.role || 'student',
            },
            include: {
                profile: true,
                class: true,
            },
        });
    }
    async getEnrollmentsByClass(classId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        return this.prisma.classEnrollment.findMany({
            where: { classId },
            include: {
                profile: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async removeStudent(classId, studentId, currentUserId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
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
                throw new common_1.ForbiddenException('Bạn không có quyền xoá học sinh khỏi lớp học này');
            }
        }
        const enrollment = await this.prisma.classEnrollment.findUnique({
            where: {
                classId_profileId: {
                    classId,
                    profileId: studentId,
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Học sinh không có trong lớp học này');
        }
        return this.prisma.classEnrollment.delete({
            where: {
                classId_profileId: {
                    classId,
                    profileId: studentId,
                },
            },
        });
    }
};
exports.ClassEnrollmentsService = ClassEnrollmentsService;
exports.ClassEnrollmentsService = ClassEnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassEnrollmentsService);
//# sourceMappingURL=class-enrollments.service.js.map