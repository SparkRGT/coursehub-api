import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { CreateEnrollmentDto } from './dto/matricula-dto.js';
import { MatrículasModuleService } from './matrículas-module.service.js';

@Controller('enrollments')
export class MatrículasModuleController {
	constructor(private readonly enrollmentsService: MatrículasModuleService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
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
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.enrollmentsService.remove(id);
	}
}
