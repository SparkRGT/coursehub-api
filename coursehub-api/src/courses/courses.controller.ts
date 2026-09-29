
import { Body,  Controller, Delete, Get, Param, Patch, Post, Query,} from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto, UpdateCourseDto} from './dto/create-course.dto.js';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query('level') level?: string) {
    return this.coursesService.findAll(level);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(String(id));
  }

  @Post()
  create(@Body() body: CreateCourseDto) {
    return this.coursesService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCourseDto,
  ) {
    return this.coursesService.update(String(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(String(id));
  }
}