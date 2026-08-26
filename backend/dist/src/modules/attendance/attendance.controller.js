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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const record_attendance_dto_1 = require("./dto/record-attendance.dto");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async recordBatch(user, dto) {
        return this.attendanceService.recordBatch(dto, user.id);
    }
    async getClassAttendance(classId, date) {
        return this.attendanceService.getClassAttendanceByDate(classId, date);
    }
    async getStudentStreak(studentId, classId) {
        return this.attendanceService.getStudentStreak(studentId, classId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Lưu điểm danh cả lớp theo ngày' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Điểm danh đã được lưu thành công' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, record_attendance_dto_1.RecordAttendanceBatchDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "recordBatch", null);
__decorate([
    (0, common_1.Get)('class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách điểm danh lớp học theo ngày' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true, description: 'Ngày điểm danh định dạng YYYY-MM-DD' }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getClassAttendance", null);
__decorate([
    (0, common_1.Get)('student/:studentId/streak'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chuỗi chuyên cần (Streak) của học sinh' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'ID lớp học (tuỳ chọn)' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getStudentStreak", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map