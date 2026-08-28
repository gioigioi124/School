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
exports.SchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const schedules_service_1 = require("./schedules.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SchedulesController = class SchedulesController {
    schedulesService;
    constructor(schedulesService) {
        this.schedulesService = schedulesService;
    }
    async getByClass(classId) {
        return this.schedulesService.findAllByClass(classId);
    }
    async getOne(id) {
        return this.schedulesService.findOne(id);
    }
    async create(user, dto) {
        return this.schedulesService.create(dto, user.id);
    }
    async update(id, user, dto) {
        return this.schedulesService.update(id, dto, user.id);
    }
    async delete(id, user) {
        return this.schedulesService.delete(id, user.id);
    }
    async applyTemplate(classId, user, replace) {
        const replaceExisting = replace === 'true' || replace === '1';
        return this.schedulesService.applyTemplate(classId, user.id, replaceExisting);
    }
};
exports.SchedulesController = SchedulesController;
__decorate([
    (0, common_1.Get)('class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách toàn bộ thời khóa biểu của lớp học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách thời khóa biểu thành công' }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getByClass", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin chi tiết một tiết học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết tiết học' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo mới một tiết học trong thời khóa biểu' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tạo tiết học thành công' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_schedule_dto_1.CreateScheduleDto]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin một tiết học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật thành công' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_schedule_dto_1.UpdateScheduleDto]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa một tiết học khỏi thời khóa biểu' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa thành công' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('template/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Nạp thời khóa biểu mẫu chuẩn mầm non/tiểu học cho lớp' }),
    (0, swagger_1.ApiQuery)({ name: 'replace', required: false, type: Boolean, description: 'Xóa dữ liệu cũ trước khi nạp mẫu (mặc định false)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Nạp mẫu thời khóa biểu thành công' }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('replace')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "applyTemplate", null);
exports.SchedulesController = SchedulesController = __decorate([
    (0, swagger_1.ApiTags)('schedules'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('schedules'),
    __metadata("design:paramtypes", [schedules_service_1.SchedulesService])
], SchedulesController);
//# sourceMappingURL=schedules.controller.js.map