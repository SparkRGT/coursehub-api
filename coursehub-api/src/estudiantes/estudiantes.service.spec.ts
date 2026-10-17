import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity.js';
import { EstudiantesService } from './estudiantes.service.js';

describe('EstudiantesService', () => {
  let service: EstudiantesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudiantesService,
        { provide: getRepositoryToken(Estudiante), useValue: {} },
      ],
    }).compile();

    service = module.get(EstudiantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
