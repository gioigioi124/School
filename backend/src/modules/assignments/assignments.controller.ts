import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài tập mới cho bài học' })
  @ApiResponse({ status: 201, description: 'Bài tập đã được tạo thành công' })
  async createAssignment(
    @CurrentUser() user: any,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.createAssignment(dto, user.id);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy danh sách bài tập theo bài học' })
  async getAssignmentsByLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.assignmentsService.getAssignmentsByLesson(lessonId, user?.id);
  }

  @Post(':id/submissions')
  @ApiOperation({ summary: 'Học sinh nộp bài tập' })
  async submitAssignment(
    @Param('id') assignmentId: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentsService.submitAssignment(assignmentId, user.id, dto);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Giáo viên xem danh sách bài làm của học sinh' })
  async getSubmissions(
    @Param('id') assignmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.assignmentsService.getSubmissionsForTeacher(
      assignmentId,
      user.id,
    );
  }

  @Patch('submissions/:submissionId/grade')
  @ApiOperation({ summary: 'Giáo viên chấm điểm và nhận xét bài làm' })
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: any,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      user.id,
      dto,
    );
  }
}
