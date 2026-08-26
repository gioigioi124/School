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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assignments_service_1 = require("./assignments.service");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const submit_assignment_dto_1 = require("./dto/submit-assignment.dto");
const grade_submission_dto_1 = require("./dto/grade-submission.dto");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AssignmentsController = class AssignmentsController {
    assignmentsService;
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    async createAssignment(user, dto) {
        return this.assignmentsService.createAssignment(dto, user.id);
    }
    async getAssignmentsByLesson(lessonId, user) {
        return this.assignmentsService.getAssignmentsByLesson(lessonId, user?.id);
    }
    async submitAssignment(assignmentId, user, dto) {
        return this.assignmentsService.submitAssignment(assignmentId, user.id, dto);
    }
    async getSubmissions(assignmentId, user) {
        return this.assignmentsService.getSubmissionsForTeacher(assignmentId, user.id);
    }
    async gradeSubmission(submissionId, user, dto) {
        return this.assignmentsService.gradeSubmission(submissionId, user.id, dto);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo bài tập mới cho bài học' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bài tập đã được tạo thành công' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)('lesson/:lessonId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách bài tập theo bài học' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getAssignmentsByLesson", null);
__decorate([
    (0, common_1.Post)(':id/submissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Học sinh nộp bài tập' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, submit_assignment_dto_1.SubmitAssignmentDto]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "submitAssignment", null);
__decorate([
    (0, common_1.Get)(':id/submissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Giáo viên xem danh sách bài làm của học sinh' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getSubmissions", null);
__decorate([
    (0, common_1.Patch)('submissions/:submissionId/grade'),
    (0, swagger_1.ApiOperation)({ summary: 'Giáo viên chấm điểm và nhận xét bài làm' }),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, grade_submission_dto_1.GradeSubmissionDto]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "gradeSubmission", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('assignments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('assignments'),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map