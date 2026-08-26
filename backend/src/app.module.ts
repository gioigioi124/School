import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ClassEnrollmentsModule } from './modules/class-enrollments/class-enrollments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { GamesModule } from './modules/games/games.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    ClassEnrollmentsModule,
    AttendanceModule,
    AnnouncementsModule,
    NotificationsModule,
    LessonsModule,
    AssignmentsModule,
    GamificationModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}





