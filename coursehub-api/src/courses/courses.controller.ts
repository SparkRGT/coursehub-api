
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto, UpdateCourseDto} from './dto/create-course.dto.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() query: CoursesQueryDto) {
  return this.coursesService.findAll(query);
}
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(String(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateCourseDto) {
    return this.coursesService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCourseDto,
  ) {
    return this.coursesService.update(String(id), body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(String(id));
  }
}