import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service.js';
import { EstudiantesService } from '../estudiantes/estudiantes.service.js';
import { CreateEnrollmentDto, EnrollmentFiltersDto } from './dto/matricula-dto.js';
import { Enrollment } from './entities/matricula.entity.js';

@Injectable()
export class MatrículasModuleService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly estudiantesService: EstudiantesService,
    private readonly coursesService: CoursesService,
  ) {}

  findAll(filters: EnrollmentFiltersDto = {}) {
    const where: FindOptionsWhere<Enrollment> = {};
    if (filters.studentId !== undefined) where.studentId = filters.studentId;
    if (filters.courseId !== undefined) where.courseId = filters.courseId;
    return this.enrollmentRepository.find({ where });
  }

  async create(input: CreateEnrollmentDto): Promise<Enrollment> {
    const student = await this.estudiantesService.findOne(input.studentId);
    if (!student.isActive) {
      throw new ForbiddenException(`El estudiante ${input.studentId} está inactivo`);
    }

    await this.coursesService.findOne(String(input.courseId));

    const existing = await this.enrollmentRepository.findOne({
      where: { studentId: input.studentId, courseId: input.courseId },
    });
    if (existing) {
      throw new ConflictException('La matrícula ya existe');
    }

    const enrollment = this.enrollmentRepository.create(input);
    return this.enrollmentRepository.save(enrollment);
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.estudiantesService.findOne(studentId);
    return this.findAll({ studentId });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(String(courseId));
    return this.findAll({ courseId });
  }

  async remove(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException(`No existe la matrícula con id ${id}`);
    }
    await this.enrollmentRepository.delete(id);
    return enrollment;
  }
}
