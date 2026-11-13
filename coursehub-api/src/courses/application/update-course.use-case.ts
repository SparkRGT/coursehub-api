import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/jwt-payload.type.js';
import { UserRole } from '../../users/user-role.enum.js';
import { COURSE_REPOSITORY } from '../domain/course.repository.js';
import type { CourseRepository } from '../domain/course.repository.js';
import { UpdateCourseDto } from '../dto/create-course.dto.js';
import { Course } from '../entities/course.entity.js';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courses: CourseRepository,
  ) {}

  async execute(
    id: number,
    changes: UpdateCourseDto,
    actor: AuthenticatedUser,
  ): Promise<Course> {
    const course = await this.courses.findById(id);
    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    if (actor.role !== UserRole.ADMIN && course.createdByUserId !== actor.id) {
      throw new ForbiddenException('No puedes modificar un curso que no te pertenece');
    }

    Object.assign(course, changes);
    return this.courses.save(course);
  }
}
