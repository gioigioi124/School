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
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GamesService = class GamesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listGames() {
        return this.prisma.game.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }
    async getGameById(idOrCode) {
        const game = await this.prisma.game.findFirst({
            where: {
                OR: [{ id: idOrCode }, { code: idOrCode }],
            },
        });
        if (!game) {
            throw new common_1.NotFoundException('Trò chơi không tồn tại');
        }
        return game;
    }
    async submitGameScore(idOrCode, studentId, dto) {
        const game = await this.getGameById(idOrCode);
        const maxScore = dto.maxScore || 100;
        const ratio = Math.min(1, Math.max(0, dto.score / maxScore));
        const xpEarned = Math.max(5, Math.round(ratio * game.xpReward));
        return this.prisma.$transaction(async (tx) => {
            const gameScore = await tx.gameScore.create({
                data: {
                    gameId: game.id,
                    studentId,
                    score: dto.score,
                    maxScore,
                    xpEarned,
                },
            });
            let userXp = await tx.userXp.findUnique({
                where: { studentId },
            });
            const currentXp = userXp ? userXp.totalXp : 0;
            const currentStars = userXp ? userXp.totalStars : 0;
            const newTotalXp = currentXp + xpEarned;
            const bonusStars = dto.score >= maxScore ? 1 : 0;
            const newStars = currentStars + bonusStars;
            const newLevel = Math.floor(newTotalXp / 1000) + 1;
            await tx.userXp.upsert({
                where: { studentId },
                update: {
                    totalXp: newTotalXp,
                    currentLevel: newLevel,
                    totalStars: newStars,
                    updatedAt: new Date(),
                },
                create: {
                    studentId,
                    totalXp: newTotalXp,
                    currentLevel: newLevel,
                    totalStars: newStars,
                },
            });
            await tx.xpHistory.create({
                data: {
                    studentId,
                    action: `Chơi trò chơi: ${game.title} (Điểm: ${dto.score}/${maxScore})`,
                    xpAmount: xpEarned,
                    sourceType: 'game',
                    sourceId: game.id,
                },
            });
            return {
                message: `Hoàn thành trò chơi! Bạn đạt ${dto.score}/${maxScore} điểm và nhận được +${xpEarned} XP!`,
                score: dto.score,
                maxScore,
                xpEarned,
                bonusStars,
                gameScore,
            };
        });
    }
    async getGameLeaderboard(idOrCode) {
        const game = await this.getGameById(idOrCode);
        return this.prisma.gameScore.findMany({
            where: { gameId: game.id },
            include: {
                student: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { score: 'desc' },
            take: 20,
        });
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamesService);
//# sourceMappingURL=games.service.js.map