import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('SchedulesService', () => {
  let service: SchedulesService;

  const mockPrismaService = {
    class: {
      findUnique: jest.fn(),
    },
    roleAssignment: {
      findFirst: jest.fn(),
    },
    classEnrollment: {
      findFirst: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
    },
    schedule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callbackOrArray) => {
      if (typeof callbackOrArray === 'function') {
        return callbackOrArray(mockPrismaService);
      }
      return Promise.all(callbackOrArray);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTeacherOrAdmin', () => {
    it('should throw NotFoundException if class does not exist', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.validateTeacherOrAdmin('non-existent-class', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is neither teacher nor admin', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'other-teacher', role: 'teacher' }],
      });
      mockPrismaService.roleAssignment.findFirst.mockResolvedValue(null);

      await expect(
        service.validateTeacherOrAdmin('class-1', 'unauthorized-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow enrolled teacher', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });

      const res = await service.validateTeacherOrAdmin('class-1', 'teacher-1');
      expect(res.id).toBe('class-1');
    });

    it('should allow admin user even if not enrolled as teacher', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [],
      });
      mockPrismaService.roleAssignment.findFirst.mockResolvedValue({
        id: 'role-assign-1',
        role: { name: 'admin' },
      });

      const res = await service.validateTeacherOrAdmin('class-1', 'admin-user');
      expect(res.id).toBe('class-1');
    });
  });

  describe('findAllByClass', () => {
    it('should throw NotFoundException if class is not found', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(service.findAllByClass('invalid-class')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return sorted schedules for class', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      const fakeSchedules = [
        { id: 's1', dayOfWeek: 2, startTime: '08:00', endTime: '08:45', subject: 'Toán' },
        { id: 's2', dayOfWeek: 2, startTime: '09:00', endTime: '09:45', subject: 'Vẽ' },
      ];
      mockPrismaService.schedule.findMany.mockResolvedValue(fakeSchedules);

      const result = await service.findAllByClass('class-1');
      expect(result).toEqual(fakeSchedules);
      expect(mockPrismaService.schedule.findMany).toHaveBeenCalledWith({
        where: { classId: 'class-1' },
        include: expect.any(Object),
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if startTime >= endTime', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });

      await expect(
        service.create(
          {
            classId: 'class-1',
            dayOfWeek: 2,
            startTime: '09:00',
            endTime: '08:30', // invalid: end before start
            subject: 'Toán',
          },
          'teacher-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create schedule successfully', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });
      mockPrismaService.schedule.create.mockResolvedValue({
        id: 'new-sched-1',
        classId: 'class-1',
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '08:45',
        subject: 'Toán tư duy',
      });

      const result = await service.create(
        {
          classId: 'class-1',
          dayOfWeek: 2,
          startTime: '08:00',
          endTime: '08:45',
          subject: 'Toán tư duy',
        },
        'teacher-1',
      );

      expect(result.id).toBe('new-sched-1');
      expect(result.subject).toBe('Toán tư duy');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if schedule does not exist', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { subject: 'Tiếng Anh' }, 'teacher-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update schedule successfully', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue({
        id: 'sched-1',
        classId: 'class-1',
        startTime: '08:00',
        endTime: '08:45',
      });
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });
      mockPrismaService.schedule.update.mockResolvedValue({
        id: 'sched-1',
        classId: 'class-1',
        subject: 'Mỹ thuật nâng cao',
      });

      const result = await service.update(
        'sched-1',
        { subject: 'Mỹ thuật nâng cao' },
        'teacher-1',
      );

      expect(result.subject).toBe('Mỹ thuật nâng cao');
    });
  });

  describe('delete', () => {
    it('should delete schedule successfully', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue({
        id: 'sched-1',
        classId: 'class-1',
      });
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });
      mockPrismaService.schedule.delete.mockResolvedValue({ id: 'sched-1' });

      const result = await service.delete('sched-1', 'teacher-1');
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe('sched-1');
    });
  });

  describe('applyTemplate', () => {
    it('should apply preschool weekly template slots', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        enrollments: [{ profileId: 'teacher-1', role: 'teacher' }],
      });
      mockPrismaService.schedule.create.mockImplementation(({ data }) => ({
        id: 'generated-id',
        ...data,
      }));

      const result = await service.applyTemplate('class-1', 'teacher-1', false);
      expect(result.classId).toBe('class-1');
      expect(result.count).toBeGreaterThan(15);
      expect(result.message).toContain('thành công');
    });
  });
});
