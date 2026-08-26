import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class SubmitGameScoreDto {
  @ApiProperty({ description: 'Điểm số học sinh đạt được', example: 85 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score: number;

  @ApiPropertyOptional({ description: 'Điểm số tối đa của trò chơi', example: 100, default: 100 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxScore?: number;
}
