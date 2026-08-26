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
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GamificationService = class GamificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async awardXp(dto) {
        const student = await this.prisma.profile.findUnique({
            where: { id: dto.studentId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Học sinh không tồn tại');
        }
        return this.prisma.$transaction(async (tx) => {
            let userXp = await tx.userXp.findUnique({
                where: { studentId: dto.studentId },
            });
            const currentXp = userXp ? userXp.totalXp : 0;
            const currentStars = userXp ? userXp.totalStars : 0;
            const newTotalXp = currentXp + dto.xpAmount;
            const newStars = currentStars + (dto.starsAmount || 0);
            const newLevel = Math.floor(newTotalXp / 1000) + 1;
            userXp = await tx.userXp.upsert({
                where: { studentId: dto.studentId },
                update: {
                    totalXp: newTotalXp,
                    currentLevel: newLevel,
                    totalStars: newStars,
                    updatedAt: new Date(),
                },
                create: {
                    studentId: dto.studentId,
                    totalXp: newTotalXp,
                    currentLevel: newLevel,
                    totalStars: newStars,
                },
            });
            await tx.xpHistory.create({
                data: {
                    studentId: dto.studentId,
                    action: dto.action,
                    xpAmount: dto.xpAmount,
                    sourceType: dto.sourceType || 'award',
                    sourceId: dto.sourceId || null,
                },
            });
            await this.checkAndUnlockBadges(tx, dto.studentId, newTotalXp, newLevel);
            return {
                message: `Đã cộng +${dto.xpAmount} XP cho học sinh thành công!`,
                totalXp: newTotalXp,
                currentLevel: newLevel,
                totalStars: newStars,
            };
        });
    }
    async checkAndUnlockBadges(tx, studentId, totalXp, level) {
        const unlockBadge = async (code) => {
            const badge = await tx.badge.findUnique({ where: { code } });
            if (badge) {
                await tx.userBadge.upsert({
                    where: {
                        studentId_badgeId: {
                            studentId,
                            badgeId: badge.id,
                        },
                    },
                    update: {},
                    create: {
                        studentId,
                        badgeId: badge.id,
                    },
                });
            }
        };
        if (totalXp >= 10) {
            await unlockBadge('first_lesson');
        }
        if (level >= 5) {
            await unlockBadge('level_5');
        }
    }
    async getStudentProfile(studentId) {
        const userXp = await this.prisma.userXp.findUnique({
            where: { studentId },
        });
        const totalXp = userXp ? userXp.totalXp : 0;
        const currentLevel = userXp ? userXp.currentLevel : 1;
        const totalStars = userXp ? userXp.totalStars : 0;
        const nextLevelXp = currentLevel * 1000;
        const currentLevelBaseXp = (currentLevel - 1) * 1000;
        const levelProgressXp = Math.max(0, totalXp - currentLevelBaseXp);
        const progressPercent = Math.min(100, Math.round((levelProgressXp / 1000) * 100));
        const allBadges = await this.prisma.badge.findMany();
        const userBadges = await this.prisma.userBadge.findMany({
            where: { studentId },
            include: { badge: true },
        });
        const unlockedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
        const badges = allBadges.map((b) => ({
            ...b,
            isUnlocked: unlockedBadgeIds.has(b.id),
            unlockedAt: userBadges.find((ub) => ub.badgeId === b.id)?.unlockedAt || null,
        }));
        const recentHistory = await this.prisma.xpHistory.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return {
            studentId,
            totalXp,
            currentLevel,
            nextLevelXp,
            levelProgressXp,
            progressPercent,
            totalStars,
            badges,
            unlockedCount: userBadges.length,
            totalBadgesCount: allBadges.length,
            recentHistory,
        };
    }
    async getClassLeaderboard(classId) {
        const enrollments = await this.prisma.classEnrollment.findMany({
            where: {
                classId,
                role: 'student',
            },
            include: {
                profile: {
                    include: {
                        userXp: true,
                    },
                },
            },
        });
        const leaderboard = enrollments.map((e) => {
            const xp = e.profile.userXp?.totalXp || 0;
            const level = e.profile.userXp?.currentLevel || 1;
            const stars = e.profile.userXp?.totalStars || 0;
            return {
                studentId: e.profile.id,
                displayName: e.profile.displayName || 'Học sinh',
                avatarUrl: e.profile.avatarUrl || '🐻',
                email: e.profile.email,
                totalXp: xp,
                currentLevel: level,
                totalStars: stars,
            };
        });
        leaderboard.sort((a, b) => b.totalXp - a.totalXp);
        return leaderboard.map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
    }
    async getAllBadges() {
        return this.prisma.badge.findMany({
            orderBy: { xpBonus: 'asc' },
        });
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map