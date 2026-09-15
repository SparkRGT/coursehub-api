import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UpdateEstudianteStatusDto } from './dto/update-estudiante-status.dto.js';
import { EstudianteFiltersDto } from './dto/estudiante-filters.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';
import { EstudiantesService } from './estudiantes.service.js';
import { AddEstudianteDto } from './dto/add-estudiante.dto.js';
import { ParseEstudianteIdPipe } from './pipes/parse-estudiante-id.pipe.js';

@Controller('estudiantes')
export class EstudiantesController {
    constructor(private readonly estudiantesService: EstudiantesService) {}

    @Get()
    findAll(@Query() filters: EstudianteFiltersDto) {
        return this.estudiantesService.findAll(filters);
    }
    @Get(':id')
    findOne(@Param('id', ParseEstudianteIdPipe) id: number) {
        return this.estudiantesService.findOne(id);
    }
    @Post()
    create(@Body() body: AddEstudianteDto) {
        return this.estudiantesService.create(body);
    }

    @Patch(':id')
    update(@Param('id', ParseEstudianteIdPipe) id: number, @Body() body: UpdateEstudianteDto) {
        return this.estudiantesService.update(id, body);
    }

    @Patch(':id/status')
    updateStatus(@Param('id', ParseEstudianteIdPipe) id: number, @Body() body: UpdateEstudianteStatusDto) {
        return this.estudiantesService.updateStatus(id, body.isActive);
    }

    @Delete(':id')
    remove(@Param('id', ParseEstudianteIdPipe) id: number) {
        return this.estudiantesService.remove(id);
    }
}
