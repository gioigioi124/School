import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ thời khóa biểu của lớp học' })
  @ApiResponse({ status: 200, description: 'Danh sách thời khóa biểu thành công' })
  async getByClass(@Param('classId') classId: string) {
    return this.schedulesService.findAllByClass(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một tiết học' })
  @ApiResponse({ status: 200, description: 'Chi tiết tiết học' })
  async getOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới một tiết học trong thời khóa biểu' })
  @ApiResponse({ status: 201, description: 'Tạo tiết học thành công' })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin một tiết học' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một tiết học khỏi thời khóa biểu' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.delete(id, user.id);
  }

  @Post('template/:classId')
  @ApiOperation({ summary: 'Nạp thời khóa biểu mẫu chuẩn mầm non/tiểu học cho lớp' })
  @ApiQuery({ name: 'replace', required: false, type: Boolean, description: 'Xóa dữ liệu cũ trước khi nạp mẫu (mặc định false)' })
  @ApiResponse({ status: 201, description: 'Nạp mẫu thời khóa biểu thành công' })
  async applyTemplate(
    @Param('classId') classId: string,
    @CurrentUser() user: any,
    @Query('replace') replace?: string,
  ) {
    const replaceExisting = replace === 'true' || replace === '1';
    return this.schedulesService.applyTemplate(classId, user.id, replaceExisting);
  }
}
