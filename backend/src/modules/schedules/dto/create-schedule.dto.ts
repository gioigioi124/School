import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID lớp học', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty({ message: 'Class ID không được để trống' })
  classId: string;

  @ApiPropertyOptional({ description: 'ID giáo viên phụ trách môn học', example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({ description: 'Thứ trong tuần (2 = Thứ Hai, ..., 8 = Chủ Nhật)', example: 2 })
  @IsInt({ message: 'Thứ trong tuần phải là số nguyên' })
  @Min(2, { message: 'Thứ trong tuần từ 2 (Thứ Hai) đến 8 (Chủ Nhật)' })
  @Max(8, { message: 'Thứ trong tuần từ 2 (Thứ Hai) đến 8 (Chủ Nhật)' })
  dayOfWeek: number;

  @ApiProperty({ description: 'Giờ bắt đầu (HH:mm)', example: '08:00' })
  @IsString()
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ bắt đầu phải theo định dạng HH:mm (ví dụ 08:00)' })
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc (HH:mm)', example: '08:45' })
  @IsString()
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ kết thúc phải theo định dạng HH:mm (ví dụ 08:45)' })
  endTime: string;

  @ApiProperty({ description: 'Tên môn học hoặc hoạt động', example: 'Toán tư duy & Khám phá' })
  @IsString()
  @IsNotEmpty({ message: 'Tên môn học không được để trống' })
  subject: string;

  @ApiPropertyOptional({ description: 'Phòng học hoặc vị trí hoạt động', example: 'Phòng Montessori 01' })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiPropertyOptional({ description: 'Mã màu nhận diện môn học', example: '#4F46E5' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Ghi chú thêm về nội dung hoặc chuẩn bị', example: 'Chuẩn bị que tính và thẻ hình học' })
  @IsString()
  @IsOptional()
  description?: string;
}
