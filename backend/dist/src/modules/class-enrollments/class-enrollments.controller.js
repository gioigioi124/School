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
exports.ClassEnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_enrollments_service_1 = require("./class-enrollments.service");
const enroll_student_dto_1 = require("./dto/enroll-student.dto");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ClassEnrollmentsController = class ClassEnrollmentsController {
    classEnrollmentsService;
    constructor(classEnrollmentsService) {
        this.classEnrollmentsService = classEnrollmentsService;
    }
    async enrollStudent(user, enrollStudentDto) {
        return this.classEnrollmentsService.enrollStudent(enrollStudentDto, user.id);
    }
    async getEnrollmentsByClass(classId) {
        return this.classEnrollmentsService.getEnrollmentsByClass(classId);
    }
    async removeStudent(user, classId, studentId) {
        return this.classEnrollmentsService.removeStudent(classId, studentId, user.id);
    }
};
exports.ClassEnrollmentsController = ClassEnrollmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm học sinh vào lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Học sinh đã được thêm vào lớp' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, enroll_student_dto_1.EnrollStudentDto]),
    __metadata("design:returntype", Promise)
], ClassEnrollmentsController.prototype, "enrollStudent", null);
__decorate([
    (0, common_1.Get)('class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thành viên trong lớp học' }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassEnrollmentsController.prototype, "getEnrollmentsByClass", null);
__decorate([
    (0, common_1.Delete)('class/:classId/student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xoá học sinh khỏi lớp học' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('classId')),
    __param(2, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ClassEnrollmentsController.prototype, "removeStudent", null);
exports.ClassEnrollmentsController = ClassEnrollmentsController = __decorate([
    (0, swagger_1.ApiTags)('class-enrollments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('class-enrollments'),
    __metadata("design:paramtypes", [class_enrollments_service_1.ClassEnrollmentsService])
], ClassEnrollmentsController);
//# sourceMappingURL=class-enrollments.controller.js.map