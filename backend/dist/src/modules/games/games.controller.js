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
exports.GamesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const games_service_1 = require("./games.service");
const submit_game_score_dto_1 = require("./dto/submit-game-score.dto");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GamesController = class GamesController {
    gamesService;
    constructor(gamesService) {
        this.gamesService = gamesService;
    }
    async listGames() {
        return this.gamesService.listGames();
    }
    async getGameById(id) {
        return this.gamesService.getGameById(id);
    }
    async submitScore(id, user, dto) {
        return this.gamesService.submitGameScore(id, user.id, dto);
    }
    async getLeaderboard(id) {
        return this.gamesService.getGameLeaderboard(id);
    }
};
exports.GamesController = GamesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả các trò chơi học tập' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "listGames", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết và cấu hình của một trò chơi' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "getGameById", null);
__decorate([
    (0, common_1.Post)(':id/scores'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi kết quả điểm số sau khi chơi game để nhận XP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Điểm số đã được ghi nhận và cộng XP' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, submit_game_score_dto_1.SubmitGameScoreDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "submitScore", null);
__decorate([
    (0, common_1.Get)(':id/leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy bảng xếp hạng điểm cao của trò chơi' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "getLeaderboard", null);
exports.GamesController = GamesController = __decorate([
    (0, swagger_1.ApiTags)('games'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('games'),
    __metadata("design:paramtypes", [games_service_1.GamesService])
], GamesController);
//# sourceMappingURL=games.controller.js.map