import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài giảng mới' })
  @ApiResponse({ status: 201, description: 'Bài giảng đã được tạo thành công' })
  async createLesson(
    @CurrentUser() user: any,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.createLesson(dto, user.id);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách bài giảng theo lớp học' })
  async getLessonsByClass(
    @Param('classId') classId: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.getLessonsByClass(classId, user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết bài giảng và tiến độ' })
  async getLessonById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.getLessonById(id, user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật nội dung bài giảng' })
  async updateLesson(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá bài giảng' })
  async deleteLesson(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.deleteLesson(id, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Học sinh đánh dấu hoàn thành bài học để nhận XP' })
  async completeLesson(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.completeLesson(id, user.id);
  }
}
