import { Test, TestingModule } from '@nestjs/testing';
import { MatrículasModuleController } from './matrículas-module.controller.js';

describe('MatrículasModuleController', () => {
  let controller: MatrículasModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatrículasModuleController],
    }).compile();

    controller = module.get<MatrículasModuleController>(MatrículasModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
