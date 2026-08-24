---
name: nestjs
description: NestJS module, controller, service structure, DTOs, Guards, Pipes, and Exception handling.
---

# Kỹ năng NestJS

1. **Mô hình 3 lớp**: Controller (nhận request, validate) -> Service (xử lý logic) -> Prisma (data access). Không viết business logic ở Controller.
2. **Validation**: Bắt buộc tạo class DTO (`create-xyz.dto.ts`), thêm decorator từ `class-validator` và `class-transformer`. App đã được cấu hình `ValidationPipe` global.
3. **Guards & Decorators**: Sử dụng `SupabaseAuthGuard` cho các private endpoints. Sử dụng `@Roles('admin', 'teacher')` kết hợp với `RolesGuard` để authorization. Lấy user qua `@CurrentUser()` decorator.
4. **Exceptions**: Throw các error bằng chuẩn `HttpException` (vd `NotFoundException`, `BadRequestException`) để global filter bắt và transform về chuẩn response format.
5. **Swagger**: Gắn decorator `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` cho mọi Controller để sinh API docs tự động.
