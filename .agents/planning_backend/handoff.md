# Backend Planning & Architecture Report: Teacher Settings

## 1. Observation

### 1.1 Prisma Schema & Database Models
Direct inspection of `backend/prisma/schema.prisma` lines 9–35:
```prisma
model Profile {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid // Matches auth.users.id or student record
  email       String   @unique
  phone       String?
  parentPhone String?  @map("parent_phone")
  parentName  String?  @map("parent_name")
  displayName String?  @map("display_name")
  avatarUrl   String?  @map("avatar_url")
  school      String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  roleAssignments       RoleAssignment[]
  ...
  @@map("profiles")
}
```
- **Finding**: All required profile fields (`displayName`, `phone`, `school`, `avatarUrl`) **already exist** in `Profile` schema and in the underlying `profiles` PostgreSQL database table.
- **Migration Need**: **None** (Zero database migrations required).

---

### 1.2 Current Users Module Implementation

#### DTO: `backend/src/modules/users/dto/update-profile.dto.ts` (lines 1–15)
```typescript
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
```
- **Deficiency**: Missing `phone` and `school` fields.
- **Impact**: Because NestJS has global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` configured in `backend/src/main.ts` (lines 15–21), sending `phone` or `school` in a `PATCH /api/users/profile` request results in `400 Bad Request: property phone/school should not exist`.

#### Service: `backend/src/modules/users/users.service.ts` (lines 1–35)
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        displayName: updateData.displayName,
        avatarUrl: updateData.avatarUrl,
      },
    });
  }
}
```
- **Deficiencies**:
  1. `updateProfile` hardcodes only `displayName` and `avatarUrl` in `data: { ... }`.
  2. `updateProfile` does NOT include `roleAssignments` in the return value (unlike `getProfile`), forcing frontend clients to maintain asymmetric profile structures or re-fetch.
  3. `updateProfile` does not check for existence prior to update or provide rich `NotFoundException` handling.

#### Controller: `backend/src/modules/users/users.controller.ts` (lines 1–30)
```typescript
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateData);
  }
}
```
- **Observation**:
  - `SupabaseAuthGuard` (`backend/src/common/guards/supabase-auth.guard.ts`) validates the Supabase JWT token.
  - `SupabaseStrategy` extracts `payload.sub` as `user.id`.
  - `@CurrentUser()` provides authenticated `user.id`.
  - Current endpoints: `GET /api/users/profile` and `PATCH /api/users/profile`.

#### Unit Tests:
- `backend/src/modules/users/users.service.spec.ts` does not yet exist.

---

## 2. Logic Chain

```
[Prisma Schema Inspection]
    │
    ├── Profile model contains (id, email, phone, displayName, avatarUrl, school)
    └── Result: Database schema is 100% ready. No SQL migration needed.
    │
[Validation & Pipeline Analysis]
    │
    ├── main.ts enforces ValidationPipe with whitelist=true, forbidNonWhitelisted=true
    ├── UpdateProfileDto currently only contains (displayName, avatarUrl)
    └── Ingestion of (phone, school) fails with 400 Bad Request
    │
[Service Logic Analysis]
    │
    ├── users.service.ts updateProfile() only writes displayName and avatarUrl
    ├── Prisma update does not include relation roleAssignments
    └── Result: phone and school are discarded, returned data lacks role info
    │
[Target Implementation Specification]
    │
    ├── 1. Expand UpdateProfileDto with phone, school, max length validation rules
    ├── 2. Update users.service.ts to persist phone, school, and return roleAssignments
    ├── 3. Enhance users.controller.ts with Swagger @ApiResponse documentation
    └── 4. Implement users.service.spec.ts to verify unit test coverage & edge cases
```

---

## 3. Caveats

1. **Password Updates**: Password changes are handled on the client via `supabase.auth.updateUser({ password: newPassword })` using Supabase Auth SDK. Backend NestJS does NOT and SHOULD NOT store or process raw passwords.
2. **Notification & Preference Persistence**: User notification toggles (sound, submission alert) and preferences (theme, language) are teacher client-side preferences (stored in `localStorage` or browser state) and do not require DB columns unless persistent cross-device settings are specified in future phases.
3. **Role Assignments**: Profiles can have multiple roles (`RoleAssignment`), but Teacher Settings view operates on current user's profile regardless of role.

---

## 4. Conclusion & Concrete Action Plan for Developer Agent

### Summary of Changes

| File | Action | Purpose |
|---|---|---|
| `backend/src/modules/users/dto/update-profile.dto.ts` | **Modify** | Add `phone`, `school` with class-validator decorators (`@IsString`, `@IsOptional`, `@MaxLength`), Swagger annotations. |
| `backend/src/modules/users/users.service.ts` | **Modify** | Handle updating `displayName`, `phone`, `school`, `avatarUrl`, check user existence, return `roleAssignments` with nested `role`. |
| `backend/src/modules/users/users.controller.ts` | **Modify** | Add `@ApiResponse` Swagger decorators for 200, 400, 404 responses. |
| `backend/src/modules/users/users.service.spec.ts` | **Create** | Unit tests covering `getProfile` (success, not found) and `updateProfile` (success with all fields, not found). |

---

### Detailed Code Blueprints for Developer Agent

#### 1. `backend/src/modules/users/dto/update-profile.dto.ts`
```typescript
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, description: 'Tên hiển thị người dùng', example: 'Cô Nguyễn Thu Hà' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Tên hiển thị không được vượt quá 100 ký tự' })
  displayName?: string;

  @ApiProperty({ required: false, description: 'Số điện thoại liên hệ', example: '0912345678' })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' })
  phone?: string;

  @ApiProperty({ required: false, description: 'Trường học / Cơ sở giảng dạy', example: 'Trường Mầm non Hoa Sen' })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Tên trường học không được vượt quá 200 ký tự' })
  school?: string;

  @ApiProperty({ required: false, description: 'URL ảnh đại diện hoặc avatar preset key', example: '/avatars/teacher-1.png' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'URL ảnh đại diện không được vượt quá 500 ký tự' })
  avatarUrl?: string;
}
```

#### 2. `backend/src/modules/users/users.service.ts`
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        ...(updateData.displayName !== undefined && { displayName: updateData.displayName }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.school !== undefined && { school: updateData.school }),
        ...(updateData.avatarUrl !== undefined && { avatarUrl: updateData.avatarUrl }),
      },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });
  }
}
```

#### 3. `backend/src/modules/users/users.controller.ts`
```typescript
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy hồ sơ thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Cập nhật hồ sơ thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateData);
  }
}
```

#### 4. `backend/src/modules/users/users.service.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockProfile = {
    id: 'user-uuid-1234',
    email: 'teacher@kinderly.edu.vn',
    displayName: 'Cô Giáo Mai',
    phone: '0901234567',
    school: 'Trường Mầm Non Ánh Dương',
    avatarUrl: '/avatars/teacher-1.png',
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
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields successfully', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);
      const updateData = {
        displayName: 'Cô Nguyễn Mai',
        phone: '0987654321',
        school: 'Trường Mầm Non Sao Mai',
        avatarUrl: '/avatars/teacher-2.png',
      };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockPrismaService.profile.update.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile('user-uuid-1234', updateData);
      expect(result).toEqual(updatedProfile);
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

    it('should throw NotFoundException when updating non-existing user', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existing-id', { displayName: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## 5. Verification Method

### Step 1: Typecheck and Build Verification
Execute backend build to verify TypeScript compilation:
```powershell
npm --prefix backend run build
```
*Expected Result*: Exit code 0, no compilation errors.

### Step 2: Unit Testing Verification
Execute backend unit tests:
```powershell
npm --prefix backend run test -- src/modules/users/users.service.spec.ts
```
*Expected Result*: All tests in `users.service.spec.ts` pass (4/4 tests).

Execute full test suite:
```powershell
npm --prefix backend run test
```
*Expected Result*: All test suites pass.

### Step 3: Invalidation Conditions
- Any changes to database schema required: **Invalidates if unexpected schema column rename or type mismatch occurs** (None detected).
- Missing token headers in frontend API call: **Invalidates with 401 Unauthorized** (Frontend Axios interceptor handles Supabase session token injection).
