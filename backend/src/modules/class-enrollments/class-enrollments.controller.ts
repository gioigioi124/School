import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassEnrollmentsService } from './class-enrollments.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('class-enrollments')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('class-enrollments')
export class ClassEnrollmentsController {
  constructor(
    private readonly classEnrollmentsService: ClassEnrollmentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Thêm học sinh vào lớp học' })
  @ApiResponse({ status: 201, description: 'Học sinh đã được thêm vào lớp' })
  async enrollStudent(
    @CurrentUser() user: any,
    @Body() enrollStudentDto: EnrollStudentDto,
  ) {
    return this.classEnrollmentsService.enrollStudent(
      enrollStudentDto,
      user.id,
    );
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách thành viên trong lớp học' })
  async getEnrollmentsByClass(@Param('classId') classId: string) {
    return this.classEnrollmentsService.getEnrollmentsByClass(classId);
  }

  @Delete('class/:classId/student/:studentId')
  @ApiOperation({ summary: 'Xoá học sinh khỏi lớp học' })
  async removeStudent(
    @CurrentUser() user: any,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classEnrollmentsService.removeStudent(
      classId,
      studentId,
      user.id,
    );
  }
}
