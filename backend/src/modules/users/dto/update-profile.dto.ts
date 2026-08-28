import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    required: false,
    description: 'Tên hiển thị của người dùng / giáo viên',
    example: 'Cô Nguyễn Mai Lan',
  })
  @IsString({ message: 'Tên hiển thị phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(100, { message: 'Tên hiển thị không được vượt quá 100 ký tự' })
  displayName?: string;

  @ApiProperty({
    required: false,
    description: 'Số điện thoại liên hệ',
    example: '0912345678',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' })
  phone?: string;

  @ApiProperty({
    required: false,
    description: 'Trường học / Đơn vị giảng dạy',
    example: 'Trường Mầm non Sao Mai',
  })
  @IsString({ message: 'Tên trường học phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(200, { message: 'Tên trường học không được vượt quá 200 ký tự' })
  school?: string;

  @ApiProperty({
    required: false,
    description: 'URL ảnh đại diện hoặc avatar preset key / emoji',
    example: '👩‍🏫',
  })
  @IsString({ message: 'URL ảnh đại diện phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'URL ảnh đại diện không được vượt quá 500 ký tự' })
  avatarUrl?: string;
}

