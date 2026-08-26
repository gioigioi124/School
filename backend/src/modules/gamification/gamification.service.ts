import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AwardXpDto } from './dto/award-xp.dto';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async awardXp(dto: AwardXpDto) {
    const student = await this.prisma.profile.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Học sinh không tồn tại');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Get or create user_xp
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

      // 2. Record in xp_history
      await tx.xpHistory.create({
        data: {
          studentId: dto.studentId,
          action: dto.action,
          xpAmount: dto.xpAmount,
          sourceType: dto.sourceType || 'award',
          sourceId: dto.sourceId || null,
        },
      });

      // 3. Check milestone badges automatically
      await this.checkAndUnlockBadges(tx, dto.studentId, newTotalXp, newLevel);

      return {
        message: `Đã cộng +${dto.xpAmount} XP cho học sinh thành công!`,
        totalXp: newTotalXp,
        currentLevel: newLevel,
        totalStars: newStars,
      };
    });
  }

  private async checkAndUnlockBadges(
    tx: any,
    studentId: string,
    totalXp: number,
    level: number,
  ) {
    const unlockBadge = async (code: string) => {
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

  async getStudentProfile(studentId: string) {
    const userXp = await this.prisma.userXp.findUnique({
      where: { studentId },
    });

    const totalXp = userXp ? userXp.totalXp : 0;
    const currentLevel = userXp ? userXp.currentLevel : 1;
    const totalStars = userXp ? userXp.totalStars : 0;

    const nextLevelXp = currentLevel * 1000;
    const currentLevelBaseXp = (currentLevel - 1) * 1000;
    const levelProgressXp = Math.max(0, totalXp - currentLevelBaseXp);
    const progressPercent = Math.min(
      100,
      Math.round((levelProgressXp / 1000) * 100),
    );

    // Get badges
    const allBadges = await this.prisma.badge.findMany();
    const userBadges = await this.prisma.userBadge.findMany({
      where: { studentId },
      include: { badge: true },
    });

    const unlockedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    const badges = allBadges.map((b) => ({
      ...b,
      isUnlocked: unlockedBadgeIds.has(b.id),
      unlockedAt:
        userBadges.find((ub) => ub.badgeId === b.id)?.unlockedAt || null,
    }));

    // Get recent history
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

  async getClassLeaderboard(classId: string) {
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

    // Sort by XP descending
    leaderboard.sort((a, b) => b.totalXp - a.totalXp);

    // Assign rank
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
}
