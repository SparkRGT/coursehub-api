import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPageMeta, resolveLimit, resolvePage } from '../common/pagination.js';
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
  ) {} // 1

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
    const course = await this.coursesRepository.findOneBy({ id: Number(id) }); // 4
    if (!course) throw new NotFoundException(`Course ${id} not found`); // 5
    return course;
  }

  create(dto: CreateCourseDto) { // 6
    const course = this.coursesRepository.create(dto);
    return this.coursesRepository.save(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id); // 7
    Object.assign(course, dto);
    return this.coursesRepository.save(course); // 8
  }

  async remove(id: string) {
    const course = await this.findOne(id); // 9
    await this.coursesRepository.remove(course); // 10
    return course;
  }
}