import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesController } from './estudiantes.controller.js';
import { EstudiantesService } from './estudiantes.service.js';

describe('EstudiantesController', () => {
  let controller: EstudiantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudiantesController],
      providers: [{ provide: EstudiantesService, useValue: {} }],
    }).compile();

    controller = module.get(EstudiantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
