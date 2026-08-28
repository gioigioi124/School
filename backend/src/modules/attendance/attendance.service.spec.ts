import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockPrismaService = {
    class: {
      findUnique: jest.fn(),
    },
    roleAssignment: {
      findFirst: jest.fn(),
    },
    attendance: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordBatch', () => {
    it('should throw NotFoundException if class does not exist', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.recordBatch(
          {
            classId: 'class-1',
            date: '2026-08-26',
            records: [{ studentId: 's1', status: 'present' }],
          },
          'teacher-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not teacher or admin', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'other-teacher', role: 'teacher' }],
      });
      mockPrismaService.roleAssignment.findFirst.mockResolvedValue(null);

      await expect(
        service.recordBatch(
          {
            classId: 'class-1',
            date: '2026-08-26',
            records: [{ studentId: 's1', status: 'present' }],
          },
          'unauthorized-user',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should record attendance when user is teacher', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });
      mockPrismaService.attendance.upsert.mockResolvedValue({
        id: 'att-1',
        classId: 'class-1',
        studentId: 's1',
        status: 'present',
      });

      const result = await service.recordBatch(
        {
          classId: 'class-1',
          date: '2026-08-26',
          records: [{ studentId: 's1', status: 'present' }],
        },
        'teacher-1',
      );

      expect(result.count).toBe(1);
      expect(result.message).toContain('thành công');
    });
  });

  describe('getStudentStreak', () => {
    it('should calculate consecutive streak correctly', async () => {
      mockPrismaService.attendance.findMany.mockResolvedValue([
        { status: 'present', date: new Date('2026-08-26') },
        { status: 'present', date: new Date('2026-08-25') },
        { status: 'absent', date: new Date('2026-08-24') },
        { status: 'present', date: new Date('2026-08-23') },
      ]);

      const result = await service.getStudentStreak('s1', 'class-1');

      expect(result.currentStreak).toBe(2);
      expect(result.totalPresentDays).toBe(3);
    });
  });
});
