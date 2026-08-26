import { PrismaService } from '../../prisma/prisma.service';
import { SubmitGameScoreDto } from './dto/submit-game-score.dto';
export declare class GamesService {
    private prisma;
    constructor(prisma: PrismaService);
    listGames(): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        thumbnailUrl: string | null;
        xpReward: number;
        code: string;
        category: string | null;
        config: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    getGameById(idOrCode: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        thumbnailUrl: string | null;
        xpReward: number;
        code: string;
        category: string | null;
        config: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    submitGameScore(idOrCode: string, studentId: string, dto: SubmitGameScoreDto): Promise<{
        message: string;
        score: number;
        maxScore: number;
        xpEarned: number;
        bonusStars: number;
        gameScore: {
            id: string;
            studentId: string;
            xpEarned: number;
            score: number;
            maxScore: number;
            playedAt: Date;
            gameId: string;
        };
    }>;
    getGameLeaderboard(idOrCode: string): Promise<({
        student: {
            displayName: string | null;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        id: string;
        studentId: string;
        xpEarned: number;
        score: number;
        maxScore: number;
        playedAt: Date;
        gameId: string;
    })[]>;
}
