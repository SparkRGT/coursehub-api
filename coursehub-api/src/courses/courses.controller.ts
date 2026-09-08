import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
