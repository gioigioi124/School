import { PrismaService } from '../../prisma/prisma.service';
import { AwardXpDto } from './dto/award-xp.dto';
export declare class GamificationService {
    private prisma;
    constructor(prisma: PrismaService);
    awardXp(dto: AwardXpDto): Promise<{
        message: string;
        totalXp: number;
        currentLevel: number;
        totalStars: number;
    }>;
    private checkAndUnlockBadges;
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
    getClassLeaderboard(classId: string): Promise<{
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
