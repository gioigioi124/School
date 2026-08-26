import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async createAssignment(dto: CreateAssignmentDto, currentUserId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { class: { include: { enrollments: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Bài giảng không tồn tại');
    }

    const isTeacher = lesson.class.enrollments.some(
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
        throw new ForbiddenException('Chỉ giáo viên của lớp mới có quyền tạo bài tập');
      }
    }

    return this.prisma.assignment.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        description: dto.description,
        type: dto.type || 'quiz',
        content: dto.content,
        xpReward: dto.xpReward ?? 20,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async getAssignmentsByLesson(lessonId: string, studentId?: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: { lessonId },
      include: {
        submissions: studentId
          ? {
              where: { studentId },
            }
          : false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return assignments.map((a) => {
      const sub = a.submissions?.[0];
      return {
        ...a,
        submission: sub || null,
        isSubmitted: !!sub,
        isGraded: sub?.status === 'graded',
      };
    });
  }

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    dto: SubmitAssignmentDto,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Bài tập không tồn tại');
    }

    // Default awarded XP on submission
    const defaultXp = assignment.xpReward || 20;

    const submission = await this.prisma.submission.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        content: dto.content,
        status: 'submitted',
        submittedAt: new Date(),
      },
      create: {
        studentId,
        assignmentId,
        content: dto.content,
        status: 'submitted',
        xpEarned: defaultXp,
      },
    });

    return {
      message: 'Nộp bài tập thành công! Bạn nhận được +' + defaultXp + ' XP.',
      xpAwarded: defaultXp,
      submission,
    };
  }

  async getSubmissionsForTeacher(assignmentId: string, currentUserId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: {
          include: {
            class: { include: { enrollments: true } },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Bài tập không tồn tại');
    }

    const isTeacher = assignment.lesson.class.enrollments.some(
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
        throw new ForbiddenException('Bạn không có quyền xem danh sách bài nộp');
      }
    }

    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async gradeSubmission(
    submissionId: string,
    currentUserId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            lesson: {
              include: { class: { include: { enrollments: true } } },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Bài làm không tồn tại');
    }

    const isTeacher = submission.assignment.lesson.class.enrollments.some(
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
        throw new ForbiddenException('Bạn không có quyền chấm bài này');
      }
    }

    // Award bonus XP if grade is 100%
    const calculatedXp =
      dto.xpEarned ??
      (dto.grade >= 9 ? 30 : dto.grade >= 5 ? 20 : 10);

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: dto.grade,
        feedback: dto.feedback,
        xpEarned: calculatedXp,
        status: 'graded',
        gradedAt: new Date(),
      },
    });
  }
}
