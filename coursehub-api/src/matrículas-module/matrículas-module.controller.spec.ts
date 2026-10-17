import { Test, TestingModule } from '@nestjs/testing';
import { MatrículasModuleController } from './matrículas-module.controller.js';
import { MatrículasModuleService } from './matrículas-module.service.js';

describe('MatrículasModuleController', () => {
  let controller: MatrículasModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatrículasModuleController],
      providers: [{ provide: MatrículasModuleService, useValue: {} }],
    }).compile();

    controller = module.get(MatrículasModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
