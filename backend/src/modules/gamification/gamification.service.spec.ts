import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: any;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
    },
    badge: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    userXp: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    xpHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    classEnrollment: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('awardXp', () => {
    it('should throw NotFoundException if student does not exist', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(
        service.awardXp({
          studentId: 'non-existing-id',
          xpAmount: 50,
          action: 'Test Award',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should award XP and calculate level correctly', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({ id: 'student-1', displayName: 'Bé Nam' });
      mockPrismaService.userXp.findUnique.mockResolvedValue({ totalXp: 950, totalStars: 5, currentLevel: 1 });
      mockPrismaService.userXp.upsert.mockResolvedValue({
        totalXp: 1050,
        totalStars: 6,
        currentLevel: 2,
      });
      mockPrismaService.badge.findUnique.mockResolvedValue(null);

      const result = await service.awardXp({
        studentId: 'student-1',
        xpAmount: 100,
        starsAmount: 1,
        action: 'Chăm ngoan',
      });

      expect(result.totalXp).toBe(1050);
      expect(result.currentLevel).toBe(2);
      expect(result.totalStars).toBe(6);
      expect(mockPrismaService.xpHistory.create).toHaveBeenCalled();
    });
  });

  describe('getStudentProfile', () => {
    it('should return student profile with level progress and badges', async () => {
      mockPrismaService.userXp.findUnique.mockResolvedValue({
        totalXp: 1250,
        currentLevel: 2,
        totalStars: 8,
      });
      mockPrismaService.badge.findMany.mockResolvedValue([
        { id: 'b1', code: 'first_lesson', name: 'First Lesson' },
      ]);
      mockPrismaService.userBadge.findMany.mockResolvedValue([
        { badgeId: 'b1', unlockedAt: new Date() },
      ]);
      mockPrismaService.xpHistory.findMany.mockResolvedValue([]);

      const result = await service.getStudentProfile('student-1');

      expect(result.totalXp).toBe(1250);
      expect(result.currentLevel).toBe(2);
      expect(result.progressPercent).toBe(25); // (1250 - 1000) / 1000 * 100
      expect(result.badges[0].isUnlocked).toBe(true);
    });
  });
});
