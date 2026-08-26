import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ description: 'Điểm số bài làm (Thang 10 hoặc 100)', example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  grade: number;

  @ApiPropertyOptional({ description: 'Nhận xét của giáo viên', example: 'Con làm bài rất tốt, chữ viết sạch đẹp!' })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiPropertyOptional({ description: 'Điểm XP thưởng thực tế', example: 30 })
  @IsInt()
  @Min(0)
  @IsOptional()
  xpEarned?: number;
}
