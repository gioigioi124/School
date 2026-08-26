import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceBatchDto } from './dto/record-attendance.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('batch')
  @ApiOperation({ summary: 'Lưu điểm danh cả lớp theo ngày' })
  @ApiResponse({ status: 200, description: 'Điểm danh đã được lưu thành công' })
  async recordBatch(
    @CurrentUser() user: any,
    @Body() dto: RecordAttendanceBatchDto,
  ) {
    return this.attendanceService.recordBatch(dto, user.id);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách điểm danh lớp học theo ngày' })
  @ApiQuery({ name: 'date', required: true, description: 'Ngày điểm danh định dạng YYYY-MM-DD' })
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getClassAttendanceByDate(classId, date);
  }

  @Get('student/:studentId/streak')
  @ApiOperation({ summary: 'Lấy chuỗi chuyên cần (Streak) của học sinh' })
  @ApiQuery({ name: 'classId', required: false, description: 'ID lớp học (tuỳ chọn)' })
  async getStudentStreak(
    @Param('studentId') studentId: string,
    @Query('classId') classId?: string,
  ) {
    return this.attendanceService.getStudentStreak(studentId, classId);
  }
}
