import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async createClass(userId: string, dto: CreateClassDto) {
    return this.prisma.$transaction(async (tx) => {
      const newClass = await tx.class.create({
        data: {
          name: dto.name,
          description: dto.description,
          school: dto.school,
          grade: dto.grade,
          avatarUrl: dto.avatarUrl,
        },
      });

      // Automatically enroll the creator as teacher
      await tx.classEnrollment.create({
        data: {
          classId: newClass.id,
          profileId: userId,
          role: 'teacher',
        },
      });

      return newClass;
    });
  }

  async getClassesForUser(userId: string) {
    // 1. Get enrollments for the user
    const userEnrollments = await this.prisma.classEnrollment.findMany({
      where: { profileId: userId },
      include: {
        class: {
          include: {
            _count: {
              select: {
                enrollments: {
                  where: { role: 'student' },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (userEnrollments.length > 0) {
      return userEnrollments.map((e) => ({
        ...e.class,
        role: e.role,
        studentCount: e.class._count.enrollments,
      }));
    }

    // Fallback: list all classes (e.g. for initial browsing)
    const allClasses = await this.prisma.class.findMany({
      include: {
        _count: {
          select: {
            enrollments: {
              where: { role: 'student' },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return allClasses.map((cls) => ({
      ...cls,
      role: 'viewer',
      studentCount: cls._count.enrollments,
    }));
  }

  async getClassById(classId: string, userId?: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { role: 'student' },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    const teachers = classData.enrollments
      .filter((e) => e.role === 'teacher')
      .map((e) => e.profile);

    const students = classData.enrollments
      .filter((e) => e.role === 'student')
      .map((e) => e.profile);

    return {
      ...classData,
      teachers,
      students,
      studentCount: classData._count.enrollments,
    };
  }

  async updateClass(classId: string, userId: string, dto: UpdateClassDto) {
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: {
        classId,
        profileId: userId,
        role: 'teacher',
      },
    });

    // Check if user is teacher of the class
    if (!enrollment) {
      // Check if user is admin
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: userId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa lớp học này');
      }
    }

    return this.prisma.class.update({
      where: { id: classId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.school !== undefined && { school: dto.school }),
        ...(dto.grade !== undefined && { grade: dto.grade }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
    });
  }

  async deleteClass(classId: string, userId: string) {
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: {
        classId,
        profileId: userId,
        role: 'teacher',
      },
    });

    if (!enrollment) {
      const isAdmin = await this.prisma.roleAssignment.findFirst({
        where: {
          profileId: userId,
          role: { name: 'admin' },
        },
      });

      if (!isAdmin) {
        throw new ForbiddenException('Bạn không có quyền xoá lớp học này');
      }
    }

    return this.prisma.class.delete({
      where: { id: classId },
    });
  }
}
