import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { SubmitGameScoreDto } from './dto/submit-game-score.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('games')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các trò chơi học tập' })
  async listGames() {
    return this.gamesService.listGames();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết và cấu hình của một trò chơi' })
  async getGameById(@Param('id') id: string) {
    return this.gamesService.getGameById(id);
  }

  @Post(':id/scores')
  @ApiOperation({ summary: 'Gửi kết quả điểm số sau khi chơi game để nhận XP' })
  @ApiResponse({ status: 200, description: 'Điểm số đã được ghi nhận và cộng XP' })
  async submitScore(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitGameScoreDto,
  ) {
    return this.gamesService.submitGameScore(id, user.id, dto);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng điểm cao của trò chơi' })
  async getLeaderboard(@Param('id') id: string) {
    return this.gamesService.getGameLeaderboard(id);
  }
}
