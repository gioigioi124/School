import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordAttendanceBatchDto } from './dto/record-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async recordBatch(dto: RecordAttendanceBatchDto, currentUserId: string) {
    // 1. Verify class exists & user is teacher or admin
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
        throw new ForbiddenException('Bạn không có quyền điểm danh cho lớp học này');
      }
    }

    const attendanceDate = new Date(dto.date);

    // 2. Perform upsert in transaction
    const results = await this.prisma.$transaction(
      dto.records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            classId_studentId_date: {
              classId: dto.classId,
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status,
            note: record.note,
          },
          create: {
            classId: dto.classId,
            studentId: record.studentId,
            date: attendanceDate,
            status: record.status,
            note: record.note,
          },
        }),
      ),
    );

    return {
      message: 'Cập nhật điểm danh thành công',
      date: dto.date,
      count: results.length,
      records: results,
    };
  }

  async getClassAttendanceByDate(classId: string, dateString: string) {
    const targetDate = new Date(dateString);
    return this.prisma.attendance.findMany({
      where: {
        classId,
        date: targetDate,
      },
      include: {
        student: true,
      },
    });
  }

  async getStudentStreak(studentId: string, classId?: string) {
    const whereCondition: any = {
      studentId,
    };

    if (classId) {
      whereCondition.classId = classId;
    }

    const history = await this.prisma.attendance.findMany({
      where: whereCondition,
      orderBy: {
        date: 'desc',
      },
    });

    let currentStreak = 0;
    for (const record of history) {
      if (record.status === 'present') {
        currentStreak++;
      } else if (record.status === 'absent') {
        break;
      }
      // Note: 'late' or 'leave' doesn't necessarily break streak unless strict
    }

    return {
      studentId,
      classId,
      currentStreak,
      totalPresentDays: history.filter((r) => r.status === 'present').length,
      historyCount: history.length,
    };
  }
}
