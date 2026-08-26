import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty({ description: 'ID của lớp học', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'ID của học sinh (Profile ID)', example: 'f87a8b42-1718-4720-94cb-5b65103a8ec4' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'Vai trò (student / teacher)', example: 'student', default: 'student' })
  @IsString()
  @IsOptional()
  role?: string;
}
