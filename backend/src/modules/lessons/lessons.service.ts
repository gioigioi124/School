import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async createLesson(dto: CreateLessonDto, currentUserId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: dto.classId },
      include: { enrollments: true },
    });

    if (!classData) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    const isTeacher = classData.enrollments.some(
      (e) => e.profileId === currentUserId && e.role === 'teacher',
    );

    if (!isTeacher) {
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: currentUserId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Chỉ giáo viên của lớp mới có quyền tạo bài giảng');
      }
    }

    return this.prisma.lesson.create({
      data: {
        classId: dto.classId,
        teacherId: currentUserId,
        title: dto.title,
        description: dto.description,
        content: dto.content,
        videoUrl: dto.videoUrl,
        thumbnailUrl: dto.thumbnailUrl,
        duration: dto.duration ?? 0,
        orderIndex: dto.orderIndex ?? 0,
      },
      include: {
        teacher: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getLessonsByClass(classId: string, currentUserId?: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { classId },
      include: {
        teacher: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
        progresses: currentUserId
          ? {
              where: { studentId: currentUserId },
            }
          : false,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return lessons.map((lesson) => {
      const progress = lesson.progresses?.[0];
      return {
        ...lesson,
        isCompleted: progress?.isCompleted || false,
        xpEarned: progress?.xpEarned || 0,
        assignmentCount: lesson._count.assignments,
      };
    });
  }

  async getLessonById(id: string, currentUserId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        assignments: true,
        progresses: currentUserId
          ? {
              where: { studentId: currentUserId },
            }
          : false,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Bài giảng không tồn tại');
    }

    const progress = lesson.progresses?.[0];

    return {
      ...lesson,
      isCompleted: progress?.isCompleted || false,
      xpEarned: progress?.xpEarned || 0,
    };
  }

  async updateLesson(id: string, dto: UpdateLessonDto, currentUserId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Bài giảng không tồn tại');
    }

    if (lesson.teacherId !== currentUserId) {
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: currentUserId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài học này');
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
      },
    });
  }

  async deleteLesson(id: string, currentUserId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Bài giảng không tồn tại');
    }

    if (lesson.teacherId !== currentUserId) {
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: currentUserId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Bạn không có quyền xoá bài học này');
      }
    }

    return this.prisma.lesson.delete({ where: { id } });
  }

  async completeLesson(lessonId: string, studentId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại');
    }

    const progress = await this.prisma.studentProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        xpEarned: 10,
      },
      create: {
        studentId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
        xpEarned: 10,
      },
    });

    return {
      message: 'Chúc mừng bạn đã hoàn thành bài học! Nhận được +10 XP.',
      xpAwarded: 10,
      progress,
    };
  }
}
