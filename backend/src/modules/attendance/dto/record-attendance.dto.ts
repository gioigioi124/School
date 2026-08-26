import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AttendanceItemDto {
  @ApiProperty({ description: 'ID học sinh (Profile ID)', example: 'f87a8b42-1718-4720-94cb-5b65103a8ec4' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Trạng thái điểm danh',
    enum: ['present', 'absent', 'late', 'leave'],
    example: 'present',
  })
  @IsString()
  @IsIn(['present', 'absent', 'late', 'leave'])
  status: string;

  @ApiPropertyOptional({ description: 'Ghi chú', example: 'Nghỉ có phép của phụ huynh' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class RecordAttendanceBatchDto {
  @ApiProperty({ description: 'ID của lớp học', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Ngày điểm danh (YYYY-MM-DD)', example: '2026-08-26' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Danh sách điểm danh các học sinh', type: [AttendanceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  records: AttendanceItemDto[];
}
