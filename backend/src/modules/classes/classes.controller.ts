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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo lớp học mới' })
  @ApiResponse({ status: 201, description: 'Lớp học đã được tạo thành công' })
  async createClass(
    @CurrentUser() user: any,
    @Body() createClassDto: CreateClassDto,
  ) {
    return this.classesService.createClass(user.id, createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lớp học của người dùng' })
  async getClasses(@CurrentUser() user: any) {
    return this.classesService.getClassesForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lớp học kèm danh sách học sinh' })
  async getClassById(
    @CurrentUser() user: any,
    @Param('id') classId: string,
  ) {
    return this.classesService.getClassById(classId, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin lớp học' })
  async updateClass(
    @CurrentUser() user: any,
    @Param('id') classId: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.updateClass(classId, user.id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá lớp học' })
  async deleteClass(
    @CurrentUser() user: any,
    @Param('id') classId: string,
  ) {
    return this.classesService.deleteClass(classId, user.id);
  }
}
