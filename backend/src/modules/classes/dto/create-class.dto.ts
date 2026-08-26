import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ description: 'Tên lớp học', example: 'Lớp Mầm A1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả lớp học', example: 'Lớp dành cho các bé 3-4 tuổi' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Trường học', example: 'Trường Mầm non Hoa Sen' })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiPropertyOptional({ description: 'Khối lớp', example: 'Mẫu giáo bé' })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện lớp học hoặc icon', example: '🏫' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
