import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Adversarial & Boundary Verification: Users Module & UpdateProfileDto', () => {
  let targetPipe: ValidationPipe;
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UpdateProfileDto,
  };

  beforeAll(() => {
    targetPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

  describe('1. DTO String Length Boundaries & Validation Rules', () => {
    it('should PASS when displayName is exactly 100 characters', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        displayName: 'A'.repeat(100),
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should FAIL when displayName exceeds 100 characters (101 characters)', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        displayName: 'A'.repeat(101),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('displayName');
      expect(errors[0].constraints?.maxLength).toContain('không được vượt quá 100 ký tự');
    });

    it('should PASS when phone is exactly 20 characters', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        phone: '01234567890123456789',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should FAIL when phone exceeds 20 characters (21 characters)', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        phone: '012345678901234567891',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('phone');
      expect(errors[0].constraints?.maxLength).toContain('không được vượt quá 20 ký tự');
    });

    it('should PASS when school is exactly 200 characters', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        school: 'S'.repeat(200),
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should FAIL when school exceeds 200 characters (201 characters)', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        school: 'S'.repeat(201),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('school');
      expect(errors[0].constraints?.maxLength).toContain('không được vượt quá 200 ký tự');
    });

    it('should PASS when avatarUrl is exactly 500 characters', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatarUrl: 'https://example.com/' + 'a'.repeat(480),
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should FAIL when avatarUrl exceeds 500 characters (501 characters)', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatarUrl: 'https://example.com/' + 'a'.repeat(481),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('avatarUrl');
      expect(errors[0].constraints?.maxLength).toContain('không được vượt quá 500 ký tự');
    });

    it('should FAIL when non-string types are supplied', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        displayName: 12345,
        phone: true,
        school: ['Trường Mầm Non'],
        avatarUrl: { url: 'https://avatar.png' },
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(4);
      const props = errors.map((e) => e.property);
      expect(props).toContain('displayName');
      expect(props).toContain('phone');
      expect(props).toContain('school');
      expect(props).toContain('avatarUrl');
    });
  });

  describe('2. Whitelist & Malicious Field Rejection via Global ValidationPipe', () => {
    it('should reject unexpected / injected properties (e.g. role, isAdmin, id, password)', async () => {
      const maliciousPayload = {
        displayName: 'Cô Giáo Hiền',
        role: 'ADMIN',
        isAdmin: true,
        id: 'attacker-uuid',
        password: 'hacked_password',
        parentPhone: '0999999999',
      };

      await expect(
        targetPipe.transform(maliciousPayload, metadata),
      ).rejects.toThrow(BadRequestException);

      try {
        await targetPipe.transform(maliciousPayload, metadata);
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);
        const response = err.getResponse();
        expect(response.message).toEqual(
          expect.arrayContaining([
            'property role should not exist',
            'property isAdmin should not exist',
            'property id should not exist',
            'property password should not exist',
            'property parentPhone should not exist',
          ]),
        );
      }
    });

    it('should accept valid whitelist payload without extra fields', async () => {
      const validPayload = {
        displayName: 'Cô Nguyễn Mai Lan',
        phone: '0987654321',
        school: 'Trường Mầm Non Ánh Dương',
        avatarUrl: '👩‍🏫',
      };

      const result = await targetPipe.transform(validPayload, metadata);
      expect(result).toBeInstanceOf(UpdateProfileDto);
      expect(result.displayName).toBe('Cô Nguyễn Mai Lan');
      expect(result.phone).toBe('0987654321');
      expect(result.school).toBe('Trường Mầm Non Ánh Dương');
      expect(result.avatarUrl).toBe('👩‍🏫');
    });

    it('should accept empty payload {} since all fields are optional', async () => {
      const emptyPayload = {};
      const result = await targetPipe.transform(emptyPayload, metadata);
      expect(result).toBeInstanceOf(UpdateProfileDto);
      expect(result.displayName).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.school).toBeUndefined();
      expect(result.avatarUrl).toBeUndefined();
    });
  });

  describe('3. Unicode Vietnamese Diacritics & Emoji Preservation', () => {
    it('should preserve complex Vietnamese diacritics and multiple emojis in DTO and Service', async () => {
      const complexUnicodeData = {
        displayName: 'Cô Giáo Đỗ Thị Hải Yến 🌸 (Tổ Trưởng Mầm Non)',
        phone: '+84 912 345 678',
        school: 'Trường Mầm Non Thực Hành Hoa Sen - Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh 🇻🇳',
        avatarUrl: '🦉',
      };

      const transformed = await targetPipe.transform(complexUnicodeData, metadata);
      expect(transformed.displayName).toBe(complexUnicodeData.displayName);
      expect(transformed.school).toBe(complexUnicodeData.school);
      expect(transformed.avatarUrl).toBe('🦉');

      // Check service persistence with mock prisma
      const mockPrisma: any = {
        profile: {
          findUnique: jest.fn().mockResolvedValue({ id: 'user-vn-123' }),
          update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'user-vn-123', ...data })),
        },
      };
      const usersService = new UsersService(mockPrisma);
      const updated = await usersService.updateProfile('user-vn-123', transformed);

      expect(updated.displayName).toBe(complexUnicodeData.displayName);
      expect(updated.school).toBe(complexUnicodeData.school);
      expect(updated.avatarUrl).toBe('🦉');
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'user-vn-123' },
        data: complexUnicodeData,
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });

    it('should correctly count multi-byte UTF-16 characters and emojis within length limits', async () => {
      // 12 preset emojis tested
      const emojis = ['👩‍🏫', '👨‍🏫', '🌸', '🦉', '🦁', '🐼', '🎨', '📚', '🌟', '🌻', '🐬', '🚀'];
      for (const emoji of emojis) {
        const dto = plainToInstance(UpdateProfileDto, { avatarUrl: emoji });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });

  describe('4. User Isolation & Controller Security Binding', () => {
    let usersService: UsersService;
    let usersController: UsersController;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        profile: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
      };
      usersService = new UsersService(mockPrisma);
      usersController = new UsersController(usersService);
    });

    it('should strictly use authenticated user id from CurrentUser decorator, ignoring any spoofed id', async () => {
      const authenticatedUser = { id: 'authenticated-user-uuid', email: 'teacher@kinderly.vn' };
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'authenticated-user-uuid',
        displayName: 'Cô Mai',
      });
      mockPrisma.profile.update.mockResolvedValue({
        id: 'authenticated-user-uuid',
        displayName: 'Cô Mai Lan Mới',
      });

      const updatePayload: UpdateProfileDto = {
        displayName: 'Cô Mai Lan Mới',
      };

      const result = await usersController.updateProfile(authenticatedUser, updatePayload);

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'authenticated-user-uuid' },
      });
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'authenticated-user-uuid' },
        data: { displayName: 'Cô Mai Lan Mới' },
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });

    it('should strictly retrieve authenticated user profile on getProfile', async () => {
      const authenticatedUser = { id: 'authenticated-user-uuid', email: 'teacher@kinderly.vn' };
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'authenticated-user-uuid',
        email: 'teacher@kinderly.vn',
        roleAssignments: [],
      });

      await usersController.getProfile(authenticatedUser);

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'authenticated-user-uuid' },
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });
    });

    it('should throw NotFoundException if profile does not exist in DB', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(
        usersController.getProfile({ id: 'ghost-user' }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        usersController.updateProfile({ id: 'ghost-user' }, { displayName: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('5. Partial Update Sanitization', () => {
    it('should only update provided fields and NOT set undefined fields to null in Prisma update', async () => {
      const mockPrisma: any = {
        profile: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'u1',
            displayName: 'Old Name',
            phone: '0123456789',
            school: 'Old School',
            avatarUrl: '🌸',
          }),
          update: jest.fn().mockResolvedValue({ id: 'u1' }),
        },
      };
      const usersService = new UsersService(mockPrisma);

      // Only update phone
      await usersService.updateProfile('u1', { phone: '0988888888' });

      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { phone: '0988888888' },
        include: {
          roleAssignments: {
            include: { role: true },
          },
        },
      });

      const updateDataArg = mockPrisma.profile.update.mock.calls[0][0].data;
      expect(updateDataArg).not.toHaveProperty('displayName');
      expect(updateDataArg).not.toHaveProperty('school');
      expect(updateDataArg).not.toHaveProperty('avatarUrl');
    });
  });
});
