import { Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CoursesService } from './courses.service.js';

@Controller('courses')
export class CoursesController {
    constructor (private readonly courseService: CoursesService){}

    @Get()
    findAll(@Query('level') level?: string) {
        return this.courseService.findAll(level);
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.courseService.findOne(Number(id));
    }
    @Post(':id')
    update(@Param('id') id: string) {
        return this.courseService.update(Number(id), {});
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.courseService.remove(Number(id));
    }
    @Patch(':id')
    updateCourse(@Param('id') id: string, @Body() input: UpdateCourseInput) {
        return this.courseService.update(Number(id), input);
    }
}
