import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { CreateCourseDto,UpdateCourseDto } from './dto/create-course.dto.js';


@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  findAll(level?: string) { 
    return this.courseRepository.find({ where: level ? { level } : {} }); // 3
  }

  async findOne(id:string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id: Number(id) } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

create(dto: CreateCourseDto) { // 6
    const course = this.courseRepository.create(dto);
    return this.courseRepository.save(course);
  }

 async update(id: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id); // 7
    Object.assign(course, dto);
    return this.courseRepository.save(course); // 8
  }

  async remove(id: string) {
    const course = await this.findOne(id); // 9
    await this.courseRepository.remove(course); // 10
    return course;
  }
}