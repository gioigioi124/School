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
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gamification_service_1 = require("./gamification.service");
const award_xp_dto_1 = require("./dto/award-xp.dto");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GamificationController = class GamificationController {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    async awardXp(dto) {
        return this.gamificationService.awardXp(dto);
    }
    async getStudentProfile(studentId) {
        return this.gamificationService.getStudentProfile(studentId);
    }
    async getMyGamificationProfile(user) {
        return this.gamificationService.getStudentProfile(user.id);
    }
    async getLeaderboard(classId) {
        return this.gamificationService.getClassLeaderboard(classId);
    }
    async getAllBadges() {
        return this.gamificationService.getAllBadges();
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Post)('award'),
    (0, swagger_1.ApiOperation)({ summary: 'Thưởng XP hoặc sao cho học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Đã trao thưởng XP thành công' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [award_xp_dto_1.AwardXpDto]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "awardXp", null);
__decorate([
    (0, common_1.Get)('profile/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin Gamification (XP, Cấp độ, Huy hiệu) của học sinh' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getStudentProfile", null);
__decorate([
    (0, common_1.Get)('my-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin Gamification của học sinh hiện tại' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getMyGamificationProfile", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy bảng xếp hạng học sinh trong lớp theo XP' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: true, description: 'ID của lớp học' }),
    __param(0, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('badges'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả các huy hiệu trong hệ thống' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getAllBadges", null);
exports.GamificationController = GamificationController = __decorate([
    (0, swagger_1.ApiTags)('gamification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('gamification'),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationController);
//# sourceMappingURL=gamification.controller.js.map