import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { ApiErrorResponses } from '../common/openapi/error-response.dto.js';
import { UserRole } from '../users/user-role.enum.js';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { CoursesService } from './courses.service.js';
import { CourseResponseDto, PaginatedCoursesDto } from './dto/course-response.dto.js';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';

@ApiTags('cursos')
@Controller({ path: 'courses', version: '1' })
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly updateCourse: UpdateCourseUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar cursos',
    description:
      'Lectura pública. Sin coincidencias responde `200` con `items: []` y `meta.total: 0`.',
  })
  @ApiOkResponse({ type: PaginatedCoursesDto })
  @ApiErrorResponses(400)
  findAll(@Query() query: CoursesQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso por id' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiErrorResponses(400, 404)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(String(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un curso',
    description: 'Requiere rol `admin` o `teacher`. El curso queda a nombre del token.',
  })
  @ApiCreatedResponse({ type: CourseResponseDto })
  @ApiErrorResponses(400, 401, 403)
  create(@Body() body: CreateCourseDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.coursesService.create(body, actor);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un curso',
    description: '`admin` puede con cualquiera; `teacher`, solo con los suyos.',
  })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiErrorResponses(400, 401, 403, 404)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCourseDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.updateCourse.execute(id, body, actor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un curso', description: 'Solo `admin`.' })
  @ApiOkResponse({ type: CourseResponseDto })
  @ApiErrorResponses(400, 401, 403, 404)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(String(id));
  }
}
