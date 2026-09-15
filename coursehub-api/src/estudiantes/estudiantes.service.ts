import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AddEstudianteDto } from './dto/add-estudiante.dto.js';
import { EstudianteFiltersDto } from './dto/estudiante-filters.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';

export type Estudiante = {
  id: number;
  name: string;
  email: string;
  age: number;
    career: string;
  semester: number;
    isActive: boolean;
};

@Injectable()
export class EstudiantesService {
    private estudiantes: Estudiante[] = [
        { id: 1, name: 'Spark', email: 'spark@example.com', age: 20, career: 'Ingeniería', semester: 5, isActive: true },
        { id: 2, name: 'Luna', email: 'luna@example.com', age: 22, career: 'Medicina', semester: 3, isActive: true },
        { id: 3, name: 'Max', email: 'max@example.com', age: 25, career: 'Derecho', semester: 7, isActive: true }
    ];
    private nextId = 4;
    findAll(filters: EstudianteFiltersDto = {}): Estudiante[] {
        return this.estudiantes.filter((estudiante) =>
            (!filters.career || estudiante.career === filters.career) &&
            (filters.semester === undefined || estudiante.semester === filters.semester) &&
            (filters.isActive === undefined || estudiante.isActive === filters.isActive),
        );
    }

    findOne(id: number): Estudiante {
        const estudiante = this.estudiantes.find((item) => item.id === id);
        if (!estudiante) {
            throw new NotFoundException(`No existe el estudiante con id ${id}`);
        }
        return estudiante;
    }

    create(input: AddEstudianteDto): Estudiante {
        this.ensureUniqueEmail(input.email);
        const estudiante: Estudiante = { id: this.nextId++, ...input };
        this.estudiantes.push(estudiante);
        return estudiante;
    }

    update(id: number, input: UpdateEstudianteDto): Estudiante {
        const estudiante = this.findOne(id);
        if (input.email && input.email !== estudiante.email) {
            this.ensureUniqueEmail(input.email, id);
        }
        Object.assign(estudiante, input);
        return estudiante;
    }

    updateStatus(id: number, isActive: boolean): Estudiante {
        const estudiante = this.findOne(id);
        estudiante.isActive = isActive;
        return estudiante;
    }

    remove(id: number): Estudiante {
        const estudiante = this.findOne(id);
        if (!estudiante.isActive) {
            throw new ConflictException('No se puede eliminar un estudiante inactivo');
        }
        this.estudiantes = this.estudiantes.filter((item) => item.id !== id);
        return estudiante;
    }

    private ensureUniqueEmail(email: string, ignoredId?: number): void {
        if (this.estudiantes.some((estudiante) => estudiante.email === email && estudiante.id !== ignoredId)) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }
    }

}
