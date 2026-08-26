import { Module } from '@nestjs/common';
import { ClassEnrollmentsController } from './class-enrollments.controller';
import { ClassEnrollmentsService } from './class-enrollments.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassEnrollmentsController],
  providers: [ClassEnrollmentsService],
  exports: [ClassEnrollmentsService],
})
export class ClassEnrollmentsModule {}
