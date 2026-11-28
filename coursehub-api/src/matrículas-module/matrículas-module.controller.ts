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
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApiErrorResponses } from '../common/openapi/error-response.dto.js';
import { UserRole } from '../users/user-role.enum.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { CreateEnrollmentDto } from './dto/matricula-dto.js';
import {
	EnrollmentResponseDto,
	PaginatedEnrollmentsDto,
} from './dto/enrollment-response.dto.js';
import { MatrículasModuleService } from './matrículas-module.service.js';

@ApiTags('matrículas')
@Controller({ path: 'enrollments', version: '1' })
export class MatrículasModuleController {
	constructor(private readonly enrollmentsService: MatrículasModuleService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Matricular a un estudiante en un curso',
		description: 'Solo `admin`. El estudiante debe estar activo y la pareja no puede repetirse.',
	})
	@ApiCreatedResponse({ type: EnrollmentResponseDto })
	@ApiErrorResponses(400, 401, 403, 404, 409)
	create(@Body() body: CreateEnrollmentDto) {
		return this.enrollmentsService.create(body);
	}

	@Get()
	@ApiOperation({
		summary: 'Listar matrículas',
		description:
			'Lectura pública. Cada matrícula trae su estudiante y su curso; `search` compara con el nombre del estudiante o el título del curso.',
	})
	@ApiOkResponse({ type: PaginatedEnrollmentsDto })
	@ApiErrorResponses(400)
	findAll(@Query() query: EnrollmentsQueryDto) {
		return this.enrollmentsService.findAll(query);
	}

	@Get('students/:studentId')
	@ApiOperation({ summary: 'Matrículas de un estudiante' })
	@ApiOkResponse({ type: [EnrollmentResponseDto] })
	@ApiErrorResponses(400, 404)
	findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
		return this.enrollmentsService.findByStudent(studentId);
	}

	@Get('courses/:courseId')
	@ApiOperation({ summary: 'Matrículas de un curso' })
	@ApiOkResponse({ type: [EnrollmentResponseDto] })
	@ApiErrorResponses(400, 404)
	findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
		return this.enrollmentsService.findByCourse(courseId);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cancelar una matrícula', description: 'Solo `admin`.' })
	@ApiOkResponse({ type: EnrollmentResponseDto })
	@ApiErrorResponses(400, 401, 403, 404)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.enrollmentsService.remove(id);
	}
}
