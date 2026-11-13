import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { buildPageMeta, resolveLimit, resolvePage } from '../common/pagination.js';
import { AddEstudianteDto } from './dto/add-estudiante.dto.js';
import {
  ESTUDIANTE_SORT_FIELDS,
  ESTUDIANTE_SORT_ORDERS,
  EstudianteFiltersDto,
} from './dto/estudiante-filters.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';
import { Estudiante } from './entities/estudiante.entity.js';

function isUniqueViolation(error: unknown): boolean {
    return (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string } | undefined)?.code === '23505'
    );
}

@Injectable()
export class EstudiantesService {
    constructor(
        @InjectRepository(Estudiante)
        private readonly estudianteRepository: Repository<Estudiante>,
    ) {}

    async findAll(filters: EstudianteFiltersDto = {}) {
        const page = resolvePage(filters.page);
        const limit = resolveLimit(filters.limit);
        const sortBy = ESTUDIANTE_SORT_FIELDS.includes(filters.sortBy ?? 'id')
            ? (filters.sortBy ?? 'id')
            : 'id';
        const order = ESTUDIANTE_SORT_ORDERS.includes(filters.order ?? 'ASC')
            ? (filters.order ?? 'ASC')
            : 'ASC';

        const qb = this.estudianteRepository.createQueryBuilder('student');
        if (filters.career) {
            qb.andWhere('student.career = :career', { career: filters.career });
        }
        if (filters.semester !== undefined) {
            qb.andWhere('student.semester = :semester', { semester: filters.semester });
        }
        if (filters.isActive !== undefined) {
            qb.andWhere('student.isActive = :isActive', { isActive: filters.isActive });
        }
        const search = filters.search?.trim();
        if (search) {
            qb.andWhere(
                '(student.name ILIKE :search OR student.email ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        qb.orderBy(`student.${sortBy}`, order)
            .skip((page - 1) * limit)
            .take(limit);

        const [items, total] = await qb.getManyAndCount();
        return { items, meta: buildPageMeta(total, page, limit) };
    }

    async findOne(id: number): Promise<Estudiante> {
        const estudiante = await this.estudianteRepository.findOneBy({ id });
        if (!estudiante) {
            throw new NotFoundException(`No existe el estudiante con id ${id}`);
        }
        return estudiante;
    }

    async create(dto: AddEstudianteDto): Promise<Estudiante> {
        await this.ensureUniqueEmail(dto.email);
        const estudiante = this.estudianteRepository.create(dto);
        try {
            return await this.estudianteRepository.save(estudiante);
        } catch (error) {
            this.rethrowDuplicateEmail(error);
        }
    }

    async update(id: number, input: UpdateEstudianteDto): Promise<Estudiante> {
        const estudiante = await this.findOne(id);
        if (input.email && input.email !== estudiante.email) {
            await this.ensureUniqueEmail(input.email, id);
        }
        Object.assign(estudiante, input);
        try {
            return await this.estudianteRepository.save(estudiante);
        } catch (error) {
            this.rethrowDuplicateEmail(error);
        }
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

    private rethrowDuplicateEmail(error: unknown): never {
        if (isUniqueViolation(error)) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }
        throw error;
    }
}
