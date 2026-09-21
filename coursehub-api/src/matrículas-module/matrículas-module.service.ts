import { ConflictException, ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service.js';
import { EstudiantesService } from '../estudiantes/estudiantes.service.js';
import { CreateEnrollmentDto, EnrollmentFiltersDto } from './dto/matricula-dto.js';

export type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class MatrículasModuleService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    @Optional() private readonly estudiantesService: EstudiantesService,
    @Optional() private readonly coursesService: CoursesService,
  ) {}

  findAll(filters: EnrollmentFiltersDto = {}): Enrollment[] {
    return this.enrollments.filter(
      (enrollment) =>
        (filters.studentId === undefined || enrollment.studentId === filters.studentId) &&
        (filters.courseId === undefined || enrollment.courseId === filters.courseId),
    );
  }

  create(input: CreateEnrollmentDto): Enrollment {
    const student = this.estudiantesService.findOne(input.studentId);
    if (!student.isActive) {
      throw new ForbiddenException(`El estudiante ${input.studentId} está inactivo`);
    }

    if (!this.coursesService.findOne(input.courseId)) {
      throw new NotFoundException(`No existe el curso con id ${input.courseId}`);
    }

    if (this.enrollments.some(
      (enrollment) => enrollment.studentId === input.studentId && enrollment.courseId === input.courseId,
    )) {
      throw new ConflictException('La matrícula ya existe');
    }

    const enrollment: Enrollment = { id: this.nextId++, ...input };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  findByStudent(studentId: number): Enrollment[] {
    this.estudiantesService.findOne(studentId);
    return this.findAll({ studentId });
  }

  findByCourse(courseId: number): Enrollment[] {
    if (!this.coursesService.findOne(courseId)) {
      throw new NotFoundException(`No existe el curso con id ${courseId}`);
    }
    return this.findAll({ courseId });
  }

  remove(id: number): Enrollment {
    const index = this.enrollments.findIndex((enrollment) => enrollment.id === id);
    if (index === -1) {
      throw new NotFoundException(`No existe la matrícula con id ${id}`);
    }
    const [enrollment] = this.enrollments.splice(index, 1);
    return enrollment;
  }
}

