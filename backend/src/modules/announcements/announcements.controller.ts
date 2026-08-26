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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thông báo mới cho lớp học' })
  @ApiResponse({ status: 201, description: 'Thông báo đã được tạo thành công' })
  async createAnnouncement(
    @CurrentUser() user: any,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.createAnnouncement(dto, user.id);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Lấy bảng tin thông báo các lớp của người dùng' })
  async getFeed(@CurrentUser() user: any) {
    return this.announcementsService.getFeedForUser(user.id);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách thông báo theo lớp' })
  async getAnnouncementsByClass(
    @Param('classId') classId: string,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.getAnnouncementsByClass(classId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết thông báo' })
  async getAnnouncementById(@Param('id') id: string) {
    return this.announcementsService.getAnnouncementById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Chỉnh sửa thông báo' })
  async updateAnnouncement(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.updateAnnouncement(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá thông báo' })
  async deleteAnnouncement(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.deleteAnnouncement(id, user.id);
  }
}
