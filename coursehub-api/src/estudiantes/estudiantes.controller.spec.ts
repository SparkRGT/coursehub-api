import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesController } from './estudiantes.controller.js';

describe('EstudiantesController', () => {
  let controller: EstudiantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudiantesController],
    }).compile();

    controller = module.get<EstudiantesController>(EstudiantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
