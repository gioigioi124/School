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
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SchedulesService = class SchedulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateTeacherOrAdmin(classId, userId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: { enrollments: true },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        const isEnrolledTeacher = classData.enrollments.some((e) => e.profileId === userId && e.role === 'teacher');
        if (!isEnrolledTeacher) {
            const isTeacherOrAdmin = await this.prisma.roleAssignment.findFirst({
                where: {
                    profileId: userId,
                    role: { name: { in: ['admin', 'teacher'] } },
                },
            });
            if (!isTeacherOrAdmin) {
                const hasTeacherEnrollment = await this.prisma.classEnrollment.findFirst({
                    where: {
                        profileId: userId,
                        role: 'teacher',
                    },
                });
                if (!hasTeacherEnrollment) {
                    throw new common_1.ForbiddenException('Bạn không có quyền quản lý thời khóa biểu của lớp học này');
                }
            }
        }
        return classData;
    }
    validateTimeRange(startTime, endTime) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        if (startMinutes >= endMinutes) {
            throw new common_1.BadRequestException('Giờ bắt đầu phải trước giờ kết thúc của tiết học');
        }
    }
    async findAllByClass(classId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Lớp học không tồn tại');
        }
        return this.prisma.schedule.findMany({
            where: { classId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                    },
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
            ],
        });
    }
    async findOne(id) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                    },
                },
            },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Không tìm thấy tiết học');
        }
        return schedule;
    }
    async create(dto, userId) {
        await this.validateTeacherOrAdmin(dto.classId, userId);
        this.validateTimeRange(dto.startTime, dto.endTime);
        if (dto.teacherId) {
            const teacher = await this.prisma.profile.findUnique({
                where: { id: dto.teacherId },
            });
            if (!teacher) {
                throw new common_1.NotFoundException('Giáo viên phụ trách không tồn tại');
            }
        }
        return this.prisma.schedule.create({
            data: {
                classId: dto.classId,
                teacherId: dto.teacherId || userId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
                subject: dto.subject,
                room: dto.room || null,
                color: dto.color || '#4F46E5',
                description: dto.description || null,
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async update(id, dto, userId) {
        const schedule = await this.findOne(id);
        await this.validateTeacherOrAdmin(schedule.classId, userId);
        if (dto.classId && dto.classId !== schedule.classId) {
            await this.validateTeacherOrAdmin(dto.classId, userId);
        }
        const startTime = dto.startTime ?? schedule.startTime;
        const endTime = dto.endTime ?? schedule.endTime;
        this.validateTimeRange(startTime, endTime);
        if (dto.teacherId) {
            const teacher = await this.prisma.profile.findUnique({
                where: { id: dto.teacherId },
            });
            if (!teacher) {
                throw new common_1.NotFoundException('Giáo viên phụ trách không tồn tại');
            }
        }
        return this.prisma.schedule.update({
            where: { id },
            data: {
                ...(dto.classId && { classId: dto.classId }),
                ...(dto.teacherId !== undefined && { teacherId: dto.teacherId }),
                ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
                ...(dto.startTime && { startTime: dto.startTime }),
                ...(dto.endTime && { endTime: dto.endTime }),
                ...(dto.subject !== undefined && { subject: dto.subject }),
                ...(dto.room !== undefined && { room: dto.room }),
                ...(dto.color !== undefined && { color: dto.color }),
                ...(dto.description !== undefined && { description: dto.description }),
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async delete(id, userId) {
        const schedule = await this.findOne(id);
        await this.validateTeacherOrAdmin(schedule.classId, userId);
        await this.prisma.schedule.delete({
            where: { id },
        });
        return {
            success: true,
            message: 'Đã xóa tiết học thành công',
            deletedId: id,
        };
    }
    async applyTemplate(classId, userId, replaceExisting = false) {
        await this.validateTeacherOrAdmin(classId, userId);
        const templateSlots = [
            { dayOfWeek: 2, startTime: '08:00', endTime: '08:45', subject: 'Chào cờ & Sinh hoạt dưới cờ', color: '#F59E0B', room: 'Sân trường', description: 'Nghi lễ chào cờ đầu tuần và sinh hoạt chủ điểm' },
            { dayOfWeek: 2, startTime: '09:00', endTime: '09:45', subject: 'Toán học', color: '#3B82F6', room: 'Phòng học chính', description: 'Học bài mới và thực hành giải bài tập toán' },
            { dayOfWeek: 2, startTime: '10:00', endTime: '10:45', subject: 'Tiếng Việt (Tập đọc)', color: '#F97316', room: 'Phòng học chính', description: 'Đọc văn bản, tìm hiểu nội dung và trả lời câu hỏi' },
            { dayOfWeek: 2, startTime: '14:30', endTime: '15:15', subject: 'Tiếng Anh Tiểu học', color: '#EC4899', room: 'Phòng Ngoại ngữ', description: 'Phát âm Phonics, từ vựng và đàm thoại nhóm' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '08:45', subject: 'Toán học (Luyện tập)', color: '#3B82F6', room: 'Phòng học chính', description: 'Luyện tập giải toán có lời văn và tính nhẩm' },
            { dayOfWeek: 3, startTime: '09:00', endTime: '09:45', subject: 'Tiếng Việt (Chính tả)', color: '#F97316', room: 'Phòng học chính', description: 'Nghe viết chính tả và luyện viết chữ đẹp' },
            { dayOfWeek: 3, startTime: '10:00', endTime: '10:45', subject: 'Tự nhiên & Xã hội / Khoa học', color: '#06B6D4', room: 'Phòng học chính', description: 'Tìm hiểu thế giới tự nhiên và các hiện tượng khoa học' },
            { dayOfWeek: 3, startTime: '14:30', endTime: '15:15', subject: 'Giáo dục thể chất', color: '#EF4444', room: 'Sân thể dục', description: 'Tập đội hình đội ngũ và các trò chơi vận động rèn sức bền' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '08:45', subject: 'Tiếng Việt (Luyện từ & câu)', color: '#F97316', room: 'Phòng học chính', description: 'Mở rộng vốn từ và thực hành cấu trúc ngữ pháp' },
            { dayOfWeek: 4, startTime: '09:00', endTime: '09:45', subject: 'Toán học', color: '#3B82F6', room: 'Phòng học chính', description: 'Hình học và giải toán ứng dụng thực tế' },
            { dayOfWeek: 4, startTime: '10:00', endTime: '10:45', subject: 'Tin học & Công nghệ', color: '#3B82F6', room: 'Phòng Tin học', description: 'Làm quen máy tính, gõ bàn phím và tư duy thuật toán' },
            { dayOfWeek: 4, startTime: '14:30', endTime: '15:15', subject: 'Âm nhạc', color: '#D946EF', room: 'Phòng Âm nhạc', description: 'Học hát bài hát mới và luyện thanh phách' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '08:45', subject: 'Tiếng Anh Tiểu học', color: '#EC4899', room: 'Phòng Ngoại ngữ', description: 'Luyện kỹ năng nghe và tương tác trò chơi tiếng Anh' },
            { dayOfWeek: 5, startTime: '09:00', endTime: '09:45', subject: 'Tiếng Việt (Tập làm văn)', color: '#F97316', room: 'Phòng học chính', description: 'Quan sát, lập dàn ý và viết đoạn văn miêu tả' },
            { dayOfWeek: 5, startTime: '10:00', endTime: '10:45', subject: 'Lịch sử & Địa lý', color: '#8B5CF6', room: 'Phòng học chính', description: 'Tìm hiểu danh nhân lịch sử và địa lý quê hương đất nước' },
            { dayOfWeek: 5, startTime: '14:30', endTime: '15:15', subject: 'Mỹ thuật & Sáng tạo', color: '#6366F1', room: 'Phòng Mỹ thuật', description: 'Vẽ tranh theo đề tài và sáng tạo thủ công' },
            { dayOfWeek: 6, startTime: '08:00', endTime: '08:45', subject: 'Toán học (Ôn tập tuần)', color: '#3B82F6', room: 'Phòng học chính', description: 'Tổng kết kiến thức và làm bài kiểm tra tuần' },
            { dayOfWeek: 6, startTime: '09:00', endTime: '09:45', subject: 'Đạo đức & Kỹ năng sống', color: '#10B981', room: 'Phòng học chính', description: 'Bài học ứng xử, lòng biết ơn và an toàn trường học' },
            { dayOfWeek: 6, startTime: '10:00', endTime: '10:45', subject: 'Hoạt động trải nghiệm', color: '#14B8A6', room: 'Sân trường', description: 'Sinh hoạt câu lạc bộ và các dự án học tập nhóm' },
            { dayOfWeek: 6, startTime: '14:30', endTime: '15:15', subject: 'Sinh hoạt lớp & Tổng kết tuần', color: '#F59E0B', room: 'Phòng học chính', description: 'Sơ kết tuần học, tuyên dương học sinh tiêu biểu' },
        ];
        const userProfile = await this.prisma.profile.findUnique({
            where: { id: userId },
        });
        const validTeacherId = userProfile ? userId : null;
        return this.prisma.$transaction(async (tx) => {
            if (replaceExisting) {
                await tx.schedule.deleteMany({
                    where: { classId },
                });
            }
            const createdList = [];
            for (const slot of templateSlots) {
                const item = await tx.schedule.create({
                    data: {
                        classId,
                        teacherId: validTeacherId,
                        dayOfWeek: slot.dayOfWeek,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        subject: slot.subject,
                        room: slot.room,
                        color: slot.color,
                        description: slot.description,
                    },
                });
                createdList.push(item);
            }
            return {
                message: 'Đã nạp thời khóa biểu mẫu thành công',
                classId,
                count: createdList.length,
                items: createdList,
            };
        });
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map