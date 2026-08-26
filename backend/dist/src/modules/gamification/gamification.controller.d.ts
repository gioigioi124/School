import { GamificationService } from './gamification.service';
import { AwardXpDto } from './dto/award-xp.dto';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    awardXp(dto: AwardXpDto): Promise<{
        message: string;
        totalXp: number;
        currentLevel: number;
        totalStars: number;
    }>;
    getStudentProfile(studentId: string): Promise<{
        studentId: string;
        totalXp: number;
        currentLevel: number;
        nextLevelXp: number;
        levelProgressXp: number;
        progressPercent: number;
        totalStars: number;
        badges: {
            isUnlocked: boolean;
            unlockedAt: Date | null;
            description: string | null;
            id: string;
            createdAt: Date;
            name: string;
            code: string;
            icon: string;
            category: string | null;
            xpBonus: number;
        }[];
        unlockedCount: number;
        totalBadgesCount: number;
        recentHistory: {
            id: string;
            createdAt: Date;
            studentId: string;
            xpAmount: number;
            action: string;
            sourceType: string | null;
            sourceId: string | null;
        }[];
    }>;
    getMyGamificationProfile(user: any): Promise<{
        studentId: string;
        totalXp: number;
        currentLevel: number;
        nextLevelXp: number;
        levelProgressXp: number;
        progressPercent: number;
        totalStars: number;
        badges: {
            isUnlocked: boolean;
            unlockedAt: Date | null;
            description: string | null;
            id: string;
            createdAt: Date;
            name: string;
            code: string;
            icon: string;
            category: string | null;
            xpBonus: number;
        }[];
        unlockedCount: number;
        totalBadgesCount: number;
        recentHistory: {
            id: string;
            createdAt: Date;
            studentId: string;
            xpAmount: number;
            action: string;
            sourceType: string | null;
            sourceId: string | null;
        }[];
    }>;
    getLeaderboard(classId: string): Promise<{
        rank: number;
        studentId: string;
        displayName: string;
        avatarUrl: string;
        email: string;
        totalXp: number;
        currentLevel: number;
        totalStars: number;
    }[]>;
    getAllBadges(): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        name: string;
        code: string;
        icon: string;
        category: string | null;
        xpBonus: number;
    }[]>;
}
