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
import { GamificationService } from './gamification.service';
import { AwardXpDto } from './dto/award-xp.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Post('award')
  @ApiOperation({ summary: 'Thưởng XP hoặc sao cho học sinh' })
  @ApiResponse({ status: 200, description: 'Đã trao thưởng XP thành công' })
  async awardXp(@Body() dto: AwardXpDto) {
    return this.gamificationService.awardXp(dto);
  }

  @Get('profile/:studentId')
  @ApiOperation({ summary: 'Lấy thông tin Gamification (XP, Cấp độ, Huy hiệu) của học sinh' })
  async getStudentProfile(@Param('studentId') studentId: string) {
    return this.gamificationService.getStudentProfile(studentId);
  }

  @Get('my-profile')
  @ApiOperation({ summary: 'Lấy thông tin Gamification của học sinh hiện tại' })
  async getMyGamificationProfile(@CurrentUser() user: any) {
    return this.gamificationService.getStudentProfile(user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng học sinh trong lớp theo XP' })
  @ApiQuery({ name: 'classId', required: true, description: 'ID của lớp học' })
  async getLeaderboard(@Query('classId') classId: string) {
    return this.gamificationService.getClassLeaderboard(classId);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các huy hiệu trong hệ thống' })
  async getAllBadges() {
    return this.gamificationService.getAllBadges();
  }
}
