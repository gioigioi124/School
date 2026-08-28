import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockProfile = {
    id: 'user-uuid-1234',
    email: 'teacher@kinderly.edu.vn',
    displayName: 'Cô Giáo Mai Lan',
    phone: '0901234567',
    school: 'Trường Mầm Non Ánh Dương',
    avatarUrl: '👩‍🏫',
    parentPhone: null,
    parentName: null,
    createdAt: new Date('2026-08-20T08:30:00.000Z'),
    updatedAt: new Date('2026-08-27T03:15:00.000Z'),
    roleAssignments: [
      {
        id: 'ra-1',
        profileId: 'user-uuid-1234',
        roleId: 'role-1',
        role: { id: 'role-1', name: 'teacher', description: 'Giáo viên' },
      },
    ],
  };

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile with roleAssignments when user exists', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-uuid-1234');
      expect(result).toEqual(mockProfile);
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1234' },
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existing-id' },
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields successfully and return roleAssignments', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);
      const updateData = {
        displayName: 'Cô Nguyễn Mai Lan',
        phone: '0987654321',
        school: 'Trường Mầm Non Sao Mai',
        avatarUrl: '🌸',
      };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockPrismaService.profile.update.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile('user-uuid-1234', updateData);
      expect(result).toEqual(updatedProfile);
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1234' },
      });
      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1234' },
        data: updateData,
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });

    it('should handle partial updates cleanly without overwriting unspecified fields', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);
      const updateData = {
        school: 'Trường Mầm Non Họa Mi',
      };
      const updatedProfile = { ...mockProfile, school: 'Trường Mầm Non Họa Mi' };
      mockPrismaService.profile.update.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile('user-uuid-1234', updateData);
      expect(result).toEqual(updatedProfile);
      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1234' },
        data: { school: 'Trường Mầm Non Họa Mi' },
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });

    it('should throw NotFoundException when updating non-existing user', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existing-id', { displayName: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existing-id' },
      });
      expect(mockPrismaService.profile.update).not.toHaveBeenCalled();
    });
  });
});
