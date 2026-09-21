import { Test, TestingModule } from '@nestjs/testing';
import { MatrículasModuleService } from './matrículas-module.service.js';

describe('MatrículasModuleService', () => {
  let service: MatrículasModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatrículasModuleService],
    }).compile();

    service = module.get<MatrículasModuleService>(MatrículasModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
