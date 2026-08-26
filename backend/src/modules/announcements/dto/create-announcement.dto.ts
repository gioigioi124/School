import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'ID lớp học', example: 'd3b07384-d113-40a1-9a74-d4b2e675037d' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Tiêu đề thông báo', example: 'Thông báo lịch dã ngoại công viên Thủ Lệ' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Nội dung thông báo chi tiết', example: 'Kính gửi quý phụ huynh, thứ 6 tuần này các con sẽ có buổi dã ngoại...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Đánh dấu thông báo quan trọng', default: false, example: true })
  @IsBoolean()
  @IsOptional()
  isImportant?: boolean;
}
