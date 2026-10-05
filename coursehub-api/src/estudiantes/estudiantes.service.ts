import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AddEstudianteDto } from './dto/add-estudiante.dto.js';
import { EstudianteFiltersDto } from './dto/estudiante-filters.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';
import { Estudiante } from './entities/estudiante.entity.js';

@Injectable()
export class EstudiantesService {
    constructor(
        @InjectRepository(Estudiante)
        private readonly estudianteRepository: Repository<Estudiante>,
    ) {}

    findAll(filters: EstudianteFiltersDto = {}) {
        const where: FindOptionsWhere<Estudiante> = {};
        if (filters.career) where.career = filters.career;
        if (filters.semester !== undefined) where.semester = filters.semester;
        if (filters.isActive !== undefined) where.isActive = filters.isActive;
        return this.estudianteRepository.find({ where });
    }

    async findOne(id: number): Promise<Estudiante> {
        const estudiante = await this.estudianteRepository.findOne({ where: { id } });
        if (!estudiante) {
            throw new NotFoundException(`No existe el estudiante con id ${id}`);
        }
        return estudiante;
    }

    async create(input: AddEstudianteDto): Promise<Estudiante> {
        await this.ensureUniqueEmail(input.email);
        const estudiante = this.estudianteRepository.create(input);
        return this.estudianteRepository.save(estudiante);
    }

    async update(id: number, input: UpdateEstudianteDto): Promise<Estudiante> {
        const estudiante = await this.findOne(id);
        if (input.email && input.email !== estudiante.email) {
            await this.ensureUniqueEmail(input.email, id);
        }
        Object.assign(estudiante, input);
        return this.estudianteRepository.save(estudiante);
    }

    async updateStatus(id: number, isActive: boolean): Promise<Estudiante> {
        const estudiante = await this.findOne(id);
        estudiante.isActive = isActive;
        return this.estudianteRepository.save(estudiante);
    }

    async remove(id: number): Promise<Estudiante> {
        const estudiante = await this.findOne(id);
        if (!estudiante.isActive) {
            throw new ConflictException('No se puede eliminar un estudiante inactivo');
        }
        await this.estudianteRepository.delete(id);
        return estudiante;
    }

    private async ensureUniqueEmail(email: string, ignoredId?: number): Promise<void> {
        const existing = await this.estudianteRepository.findOne({ where: { email } });
        if (existing && existing.id !== ignoredId) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }
    }
}
