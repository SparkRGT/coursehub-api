import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { buildPageMeta, resolveLimit, resolvePage } from '../common/pagination.js';
import { CoursesService } from '../courses/courses.service.js';
import { EstudiantesService } from '../estudiantes/estudiantes.service.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { CreateEnrollmentDto } from './dto/matricula-dto.js';
import { Enrollment } from './entities/matricula.entity.js';

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string } | undefined)?.code === '23505'
  );
}

@Injectable()
export class MatrículasModuleService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly estudiantesService: EstudiantesService,
    private readonly coursesService: CoursesService,
  ) {}

  async findAll(query: EnrollmentsQueryDto) {
    const qb = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.student', 'student')
      .innerJoinAndSelect('enrollment.course', 'course');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(student.name ILIKE :search OR course.title ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (query.studentId) {
      qb.andWhere('student.id = :studentId', { studentId: query.studentId });
    }
    if (query.courseId) {
      qb.andWhere('course.id = :courseId', { courseId: query.courseId });
    }
    if (query.activeOnly === 'true') {
      qb.andWhere('student.isActive = :active', { active: true });
    }

    const page = resolvePage(query.page);
    const limit = resolveLimit(query.limit);

    qb.orderBy('enrollment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPageMeta(total, page, limit) };
  }

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const student = await this.estudiantesService.findOne(dto.studentId);
    if (!student.isActive) {
      throw new BadRequestException('Inactive students cannot enroll');
    }

    const course = await this.coursesService.findOne(String(dto.courseId));

    const duplicate = await this.enrollmentRepository.findOne({
      where: { student: { id: student.id }, course: { id: course.id } },
    });
    if (duplicate) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    try {
      return await this.enrollmentRepository.save(
        this.enrollmentRepository.create({ student, course }),
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Student is already enrolled in this course');
      }
      throw error;
    }
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.estudiantesService.findOne(studentId);
    return this.enrollmentRepository.find({
      where: { student: { id: studentId } },
      relations: { student: true, course: true },
      order: { id: 'ASC' },
    });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(String(courseId));
    return this.enrollmentRepository.find({
      where: { course: { id: courseId } },
      relations: { student: true, course: true },
      order: { id: 'ASC' },
    });
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
