import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { COURSE_REPOSITORY } from './domain/course.repository.js';
import { Course } from './entities/course.entity.js';
import { TypeOrmCourseRepository } from './infrastructure/typeorm-course.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    UpdateCourseUseCase,
    { provide: COURSE_REPOSITORY, useClass: TypeOrmCourseRepository },
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
