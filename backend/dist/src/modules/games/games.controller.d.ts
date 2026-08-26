import { GamesService } from './games.service';
import { SubmitGameScoreDto } from './dto/submit-game-score.dto';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
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
    getGameById(id: string): Promise<{
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
    submitScore(id: string, user: any, dto: SubmitGameScoreDto): Promise<{
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
    getLeaderboard(id: string): Promise<({
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
