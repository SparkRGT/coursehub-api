import { Injectable } from '@nestjs/common';
type Estudiante = {
  id: number;
  name: string;
  email: string;
  age: number;
  curso: string;
  semester: number;
  IsActive: boolean;
};
@Injectable()
export class EstudiantesService {
    private estudiantes: Estudiante[] = [
        { id: 1, name: 'Spark', email: 'spark@example.com', age: 20, curso: 'Ingeniería', semester: 5, IsActive: true },
        { id: 2, name: 'Luna', email: 'luna@example.com', age: 22, curso: 'Medicina', semester: 3, IsActive: true },
        { id: 3, name: 'Max', email: 'max@example.com', age: 25, curso: 'Derecho', semester: 7, IsActive: true }
    ];
    private nextId = 4;

    
}
