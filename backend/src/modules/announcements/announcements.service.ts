import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async createAnnouncement(dto: CreateAnnouncementDto, currentUserId: string) {
    // 1. Verify class exists & user is teacher or admin
    const classData = await this.prisma.class.findUnique({
      where: { id: dto.classId },
      include: {
        enrollments: true,
      },
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
        throw new ForbiddenException('Chỉ giáo viên của lớp mới có quyền tạo thông báo');
      }
    }

    // 2. Create announcement and fan out notifications to all enrolled students
    return this.prisma.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          teacherId: currentUserId,
          classId: dto.classId,
          title: dto.title,
          content: dto.content,
          isImportant: dto.isImportant ?? false,
        },
        include: {
          teacher: true,
          class: true,
        },
      });

      const studentEnrollments = classData.enrollments.filter(
        (e) => e.role === 'student' && e.profileId !== currentUserId,
      );

      if (studentEnrollments.length > 0) {
        await tx.notification.createMany({
          data: studentEnrollments.map((e) => ({
            userId: e.profileId,
            announcementId: announcement.id,
            title: dto.isImportant
              ? `[QUAN TRỌNG] ${dto.title}`
              : `Thông báo mới từ ${classData.name}: ${dto.title}`,
            content: dto.content.slice(0, 150),
          })),
        });
      }

      return announcement;
    });
  }

  async getAnnouncementsByClass(classId: string, userId?: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    return this.prisma.announcement.findMany({
      where: { classId },
      include: {
        teacher: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFeedForUser(userId: string) {
    // Get all class IDs user is part of
    const userEnrollments = await this.prisma.classEnrollment.findMany({
      where: { profileId: userId },
      select: { classId: true },
    });

    const classIds = userEnrollments.map((e) => e.classId);

    if (classIds.length === 0) {
      // Return public or recent announcements
      return this.prisma.announcement.findMany({
        include: {
          teacher: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          class: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });
    }

    return this.prisma.announcement.findMany({
      where: {
        classId: { in: classIds },
      },
      include: {
        teacher: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        class: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAnnouncementById(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        teacher: true,
        class: true,
      },
    });

    if (!announcement) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    return announcement;
  }

  async updateAnnouncement(
    id: string,
    dto: UpdateAnnouncementDto,
    currentUserId: string,
  ) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    if (announcement.teacherId !== currentUserId) {
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: currentUserId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa thông báo này');
      }
    }

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.isImportant !== undefined && { isImportant: dto.isImportant }),
      },
    });
  }

  async deleteAnnouncement(id: string, currentUserId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    if (announcement.teacherId !== currentUserId) {
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: currentUserId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Bạn không có quyền xoá thông báo này');
      }
    }

    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
