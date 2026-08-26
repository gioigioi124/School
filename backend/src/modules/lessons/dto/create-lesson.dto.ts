import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'ID của lớp học', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Tiêu đề bài giảng', example: 'Bài 1: Làm quen với chữ cái A, Ă, Â' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả tóm tắt bài giảng', example: 'Giúp các bé nhận diện và phát âm chuẩn các chữ cái đầu tiên.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Nội dung chi tiết của bài học (HTML / Markdown / Text)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn video bài giảng', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Hình ảnh thumbnail đại diện', example: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Thời lượng bài giảng (phút)', example: 15, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Thứ tự hiển thị trong khoá học', example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  orderIndex?: number;
}
