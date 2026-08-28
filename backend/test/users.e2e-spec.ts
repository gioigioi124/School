import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../src/modules/users/users.controller';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SupabaseAuthGuard } from '../src/common/guards/supabase-auth.guard';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Users API Endpoints (E2E Integration & Security)', () => {
  let app: INestApplication;
  let mockPrismaService: any;
  let mockUser = { id: 'teacher-user-uuid-123', email: 'teacher@kinderly.vn' };

  const sampleProfile = {
    id: 'teacher-user-uuid-123',
    email: 'teacher@kinderly.vn',
    displayName: 'Cô Nguyễn Mai Lan',
    phone: '0912345678',
    school: 'Trường Mầm Non Họa Mi',
    avatarUrl: '👩‍🏫',
    parentPhone: null,
    parentName: null,
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-27T00:00:00Z'),
    roleAssignments: [
      {
        id: 'ra-1',
        profileId: 'teacher-user-uuid-123',
        roleId: 'role-teacher',
        role: { id: 'role-teacher', name: 'teacher', description: 'Giáo viên' },
      },
    ],
  };

  beforeAll(async () => {
    mockPrismaService = {
      profile: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/profile', () => {
    it('should return 200 and profile payload for authenticated teacher', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(sampleProfile);

      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('teacher-user-uuid-123');
      expect(response.body.data.displayName).toBe('Cô Nguyễn Mai Lan');
      expect(response.body.data.roleAssignments[0].role.name).toBe('teacher');
    });

    it('should return 404 if profile is not found in database', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Profile not found');
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should successfully update valid fields (Vietnamese text, phone, school, emoji avatar)', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(sampleProfile);
      const updatedMock = {
        ...sampleProfile,
        displayName: 'Cô Lê Thị Kim Ngân 🌸',
        phone: '0988776655',
        school: 'Trường Mầm Non Sao Mai (Cơ sở 2)',
        avatarUrl: '🌸',
      };
      mockPrismaService.profile.update.mockResolvedValue(updatedMock);

      const payload = {
        displayName: 'Cô Lê Thị Kim Ngân 🌸',
        phone: '0988776655',
        school: 'Trường Mầm Non Sao Mai (Cơ sở 2)',
        avatarUrl: '🌸',
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.displayName).toBe('Cô Lê Thị Kim Ngân 🌸');
      expect(response.body.data.phone).toBe('0988776655');
      expect(response.body.data.avatarUrl).toBe('🌸');
    });

    it('should reject with 400 when malicious non-whitelisted fields are provided', async () => {
      const maliciousPayload = {
        displayName: 'Cô Mai Lan',
        role: 'ADMIN',
        isAdmin: true,
        permissions: ['*'],
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send(maliciousPayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'property role should not exist',
          'property isAdmin should not exist',
          'property permissions should not exist',
        ]),
      );
      expect(mockPrismaService.profile.update).not.toHaveBeenCalled();
    });

    it('should reject with 400 when displayName exceeds 100 characters', async () => {
      const payload = {
        displayName: 'A'.repeat(101),
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['Tên hiển thị không được vượt quá 100 ký tự']),
      );
    });

    it('should reject with 400 when phone exceeds 20 characters', async () => {
      const payload = {
        phone: '123456789012345678901',
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['Số điện thoại không được vượt quá 20 ký tự']),
      );
    });

    it('should reject with 400 when school exceeds 200 characters', async () => {
      const payload = {
        school: 'S'.repeat(201),
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['Tên trường học không được vượt quá 200 ký tự']),
      );
    });

    it('should reject with 400 when avatarUrl exceeds 500 characters', async () => {
      const payload = {
        avatarUrl: 'https://cdn.example.com/' + 'x'.repeat(480),
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['URL ảnh đại diện không được vượt quá 500 ký tự']),
      );
    });

    it('should return 404 if user profile does not exist when updating', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .send({ displayName: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Profile not found');
      expect(mockPrismaService.profile.update).not.toHaveBeenCalled();
    });
  });
});
