import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service.js';
import { EstudiantesService } from '../estudiantes/estudiantes.service.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { CreateEnrollmentDto } from './dto/matricula-dto.js';
import { Enrollment } from './entities/matricula.entity.js';

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
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course');

    if (query.search) {
      qb.andWhere('(student.name ILIKE :search OR course.title ILIKE :search)', {
        search: `%${query.search.trim()}%`,
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

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    qb.orderBy('enrollment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
  const student = await this.estudiantesService.findOne(dto.studentId);
  if (!student.isActive) throw new BadRequestException('Inactive students cannot enroll');

  const course = await this.coursesService.findOne(String(dto.courseId));

  const duplicate = await this.enrollmentRepository.findOne({
    where: { student: { id: student.id }, course: { id: course.id } },
  });
  if (duplicate) throw new ConflictException('Student is already enrolled in this course');

  return this.enrollmentRepository.save(
    this.enrollmentRepository.create({ student, course }),
  );
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
