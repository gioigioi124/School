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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordBatch(dto, currentUserId) {
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
                throw new common_1.ForbiddenException('Bạn không có quyền điểm danh cho lớp học này');
            }
        }
        const attendanceDate = new Date(dto.date);
        const results = await this.prisma.$transaction(dto.records.map((record) => this.prisma.attendance.upsert({
            where: {
                classId_studentId_date: {
                    classId: dto.classId,
                    studentId: record.studentId,
                    date: attendanceDate,
                },
            },
            update: {
                status: record.status,
                note: record.note,
            },
            create: {
                classId: dto.classId,
                studentId: record.studentId,
                date: attendanceDate,
                status: record.status,
                note: record.note,
            },
        })));
        return {
            message: 'Cập nhật điểm danh thành công',
            date: dto.date,
            count: results.length,
            records: results,
        };
    }
    async getClassAttendanceByDate(classId, dateString) {
        const targetDate = new Date(dateString);
        return this.prisma.attendance.findMany({
            where: {
                classId,
                date: targetDate,
            },
            include: {
                student: true,
            },
        });
    }
    async getStudentStreak(studentId, classId) {
        const whereCondition = {
            studentId,
        };
        if (classId) {
            whereCondition.classId = classId;
        }
        const history = await this.prisma.attendance.findMany({
            where: whereCondition,
            orderBy: {
                date: 'desc',
            },
        });
        let currentStreak = 0;
        for (const record of history) {
            if (record.status === 'present') {
                currentStreak++;
            }
            else if (record.status === 'absent') {
                break;
            }
        }
        return {
            studentId,
            classId,
            currentStreak,
            totalPresentDays: history.filter((r) => r.status === 'present').length,
            historyCount: history.length,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map