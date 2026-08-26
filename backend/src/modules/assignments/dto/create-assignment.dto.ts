import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'ID của bài giảng (Lesson ID)', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ description: 'Tiêu đề bài tập', example: 'Câu đố trắc nghiệm: Đố vui nhận biết chữ A' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả yêu cầu bài tập' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Loại bài tập (quiz / text / drag_drop)', example: 'quiz', default: 'quiz' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Cấu trúc nội dung câu hỏi (JSON)', example: { questions: [{ question: 'Chữ nào là chữ A?', options: ['A', 'B', 'C'], answer: 'A' }] } })
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({ description: 'Số điểm XP thưởng khi hoàn thành', example: 20, default: 20 })
  @IsInt()
  @Min(0)
  @IsOptional()
  xpReward?: number;

  @ApiPropertyOptional({ description: 'Hạn nộp bài (ISO Date String)', example: '2026-09-01T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
