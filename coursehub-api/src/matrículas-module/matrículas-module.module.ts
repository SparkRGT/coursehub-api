import { Module } from '@nestjs/common';
import { MatrículasModuleService } from './matrículas-module.service.js';
import { MatrículasModuleController } from './matrículas-module.controller.js';

@Module({
  providers: [MatrículasModuleService],
  controllers: [MatrículasModuleController]
})
export class MatrículasModuleModule {}
