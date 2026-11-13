import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { buildPageMeta, resolveLimit, resolvePage } from '../common/pagination.js';
import { UserRole } from '../users/user-role.enum.js';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto.js';
import {
  COURSE_SORT_FIELDS,
  CoursesQueryDto,
  SORT_ORDERS,
} from './dto/courses-query.dto.js';
import { Course } from './entities/course.entity.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  async findAll(query: CoursesQueryDto) {
    const page = resolvePage(query.page);
    const limit = resolveLimit(query.limit);
    const sortBy = COURSE_SORT_FIELDS.includes(query.sortBy ?? 'id')
      ? (query.sortBy ?? 'id')
      : 'id';
    const order = SORT_ORDERS.includes(query.order ?? 'ASC')
      ? (query.order ?? 'ASC')
      : 'ASC';

    const [items, total] = await this.coursesRepository.findAndCount({
      where: query.level ? { level: query.level } : {},
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, meta: buildPageMeta(total, page, limit) };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOneBy({ id: Number(id) });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(dto: CreateCourseDto, actor: AuthenticatedUser) {
    const course = this.coursesRepository.create({
      ...dto,
      createdByUserId: actor.id,
    });
    return this.coursesRepository.save(course);
  }

  async update(id: string, dto: UpdateCourseDto, actor: AuthenticatedUser) {
    const course = await this.findOne(id);
    this.assertCanManage(course, actor);
    Object.assign(course, dto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
    return course;
  }

  private assertCanManage(course: Course, actor: AuthenticatedUser): void {
    if (actor.role === UserRole.ADMIN) return;
    if (course.createdByUserId !== null && course.createdByUserId === actor.id) return;
    throw new ForbiddenException('No puedes modificar un curso que no te pertenece');
  }
}
