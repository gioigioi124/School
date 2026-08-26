import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';

@Injectable()
export class ClassEnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enrollStudent(dto: EnrollStudentDto, currentUserId: string) {
    // 1. Check if class exists
    const classData = await this.prisma.class.findUnique({
      where: { id: dto.classId },
      include: {
        enrollments: true,
      },
    });

    if (!classData) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    // 2. Check if student profile exists
    const studentProfile = await this.prisma.profile.findUnique({
      where: { id: dto.studentId },
    });

    if (!studentProfile) {
      throw new NotFoundException('Hồ sơ học sinh không tồn tại');
    }

    // 3. Check if current user is teacher of the class or admin
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
        throw new ForbiddenException('Bạn không có quyền thêm học sinh vào lớp học này');
      }
    }

    // 4. Check if already enrolled
    const existingEnrollment = await this.prisma.classEnrollment.findUnique({
      where: {
        classId_profileId: {
          classId: dto.classId,
          profileId: dto.studentId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Học sinh đã có trong lớp này');
    }

    // 5. Create enrollment
    return this.prisma.classEnrollment.create({
      data: {
        classId: dto.classId,
        profileId: dto.studentId,
        role: dto.role || 'student',
      },
      include: {
        profile: true,
        class: true,
      },
    });
  }

  async getEnrollmentsByClass(classId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    return this.prisma.classEnrollment.findMany({
      where: { classId },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async removeStudent(classId: string, studentId: string, currentUserId: string) {
    // Check permission
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
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
        throw new ForbiddenException('Bạn không có quyền xoá học sinh khỏi lớp học này');
      }
    }

    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: {
        classId_profileId: {
          classId,
          profileId: studentId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Học sinh không có trong lớp học này');
    }

    return this.prisma.classEnrollment.delete({
      where: {
        classId_profileId: {
          classId,
          profileId: studentId,
        },
      },
    });
  }
}
