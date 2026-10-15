import { Body, Controller, Delete, Get, Optional, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { CreateEnrollmentDto } from './dto/matricula-dto.js';
import { MatrículasModuleService } from './matrículas-module.service.js';

@Controller('enrollments')
export class MatrículasModuleController {
	constructor(@Optional() private readonly enrollmentsService: MatrículasModuleService) {}

	@Post()
	create(@Body() body: CreateEnrollmentDto) {
		return this.enrollmentsService.create(body);
	}

	@Get()
	findAll(@Query() query: EnrollmentsQueryDto) {
		return this.enrollmentsService.findAll(query);
	}

	@Get('students/:studentId')
	findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
		return this.enrollmentsService.findByStudent(studentId);
	}

	@Get('courses/:courseId')
	findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
		return this.enrollmentsService.findByCourse(courseId);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.enrollmentsService.remove(id);
	}
}
