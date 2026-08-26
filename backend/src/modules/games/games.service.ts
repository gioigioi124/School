import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitGameScoreDto } from './dto/submit-game-score.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async listGames() {
    return this.prisma.game.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async getGameById(idOrCode: string) {
    const game = await this.prisma.game.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
    });

    if (!game) {
      throw new NotFoundException('Trò chơi không tồn tại');
    }

    return game;
  }

  async submitGameScore(
    idOrCode: string,
    studentId: string,
    dto: SubmitGameScoreDto,
  ) {
    const game = await this.getGameById(idOrCode);

    const maxScore = dto.maxScore || 100;
    const ratio = Math.min(1, Math.max(0, dto.score / maxScore));
    // Reward XP based on performance, minimum 5 XP for participation
    const xpEarned = Math.max(5, Math.round(ratio * game.xpReward));

    return this.prisma.$transaction(async (tx) => {
      // 1. Record score
      const gameScore = await tx.gameScore.create({
        data: {
          gameId: game.id,
          studentId,
          score: dto.score,
          maxScore,
          xpEarned,
        },
      });

      // 2. Update user_xp
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

      // 3. Record in xp_history
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

  async getGameLeaderboard(idOrCode: string) {
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
}
