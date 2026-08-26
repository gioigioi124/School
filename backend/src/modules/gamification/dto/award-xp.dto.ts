import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AwardXpDto {
  @ApiProperty({ description: 'ID của học sinh (Profile ID)', example: 'f87a8b42-1718-4720-94cb-5b65103a8ec4' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Số điểm XP trao thưởng', example: 50 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  xpAmount: number;

  @ApiProperty({ description: 'Lý do / Hành động nhận thưởng', example: 'Hăng hái phát biểu trong giờ học' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({ description: 'Loại nguồn (lesson, assignment, streak, award)', example: 'award' })
  @IsString()
  @IsOptional()
  sourceType?: string;

  @ApiPropertyOptional({ description: 'ID nguồn liên quan', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' })
  @IsUUID()
  @IsOptional()
  sourceId?: string;

  @ApiPropertyOptional({ description: 'Số sao thưởng tặng kèm', example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  starsAmount?: number;
}
