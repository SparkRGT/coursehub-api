import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApiErrorResponses } from '../common/openapi/error-response.dto.js';
import { UserRole } from '../users/user-role.enum.js';
import { UpdateEstudianteStatusDto } from './dto/update-estudiante-status.dto.js';
import { EstudianteFiltersDto } from './dto/estudiante-filters.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';
import {
    EstudianteResponseDto,
    PaginatedEstudiantesDto,
} from './dto/estudiante-response.dto.js';
import { EstudiantesService } from './estudiantes.service.js';
import { AddEstudianteDto } from './dto/add-estudiante.dto.js';
import { ParseEstudianteIdPipe } from './pipes/parse-estudiante-id.pipe.js';

@ApiTags('estudiantes')
@Controller({ path: 'estudiantes', version: '1' })
export class EstudiantesController {
    constructor(private readonly estudiantesService: EstudiantesService) {}

    @Get()
    @ApiOperation({
        summary: 'Listar estudiantes',
        description:
            'Lectura pública con filtros combinados, búsqueda por nombre o correo, página y orden.',
    })
    @ApiOkResponse({ type: PaginatedEstudiantesDto })
    @ApiErrorResponses(400)
    findAll(@Query() filters: EstudianteFiltersDto) {
        return this.estudiantesService.findAll(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un estudiante por id' })
    @ApiOkResponse({ type: EstudianteResponseDto })
    @ApiErrorResponses(400, 404)
    findOne(@Param('id', ParseEstudianteIdPipe) id: number) {
        return this.estudiantesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear un estudiante', description: 'Solo `admin`.' })
    @ApiCreatedResponse({ type: EstudianteResponseDto })
    @ApiErrorResponses(400, 401, 403, 409)
    create(@Body() body: AddEstudianteDto) {
        return this.estudiantesService.create(body);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar un estudiante', description: 'Solo `admin`.' })
    @ApiOkResponse({ type: EstudianteResponseDto })
    @ApiErrorResponses(400, 401, 403, 404, 409)
    update(@Param('id', ParseEstudianteIdPipe) id: number, @Body() body: UpdateEstudianteDto) {
        return this.estudiantesService.update(id, body);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Activar o desactivar un estudiante',
        description: 'Un estudiante inactivo no puede matricularse.',
    })
    @ApiOkResponse({ type: EstudianteResponseDto })
    @ApiErrorResponses(400, 401, 403, 404)
    updateStatus(@Param('id', ParseEstudianteIdPipe) id: number, @Body() body: UpdateEstudianteStatusDto) {
        return this.estudiantesService.updateStatus(id, body.isActive);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Eliminar un estudiante',
        description: 'Solo `admin`, y solo si el estudiante está activo.',
    })
    @ApiOkResponse({ type: EstudianteResponseDto })
    @ApiErrorResponses(400, 401, 403, 404)
    remove(@Param('id', ParseEstudianteIdPipe) id: number) {
        return this.estudiantesService.remove(id);
    }
}
