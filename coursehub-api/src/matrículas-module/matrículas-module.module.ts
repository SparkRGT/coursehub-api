import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module.js';
import { EstudiantesModule } from '../estudiantes/estudiantes.module.js';
import { MatrículasModuleService } from './matrículas-module.service.js';
import { MatrículasModuleController } from './matrículas-module.controller.js';

@Module({
  imports: [CoursesModule, EstudiantesModule],
  providers: [MatrículasModuleService],
  controllers: [MatrículasModuleController],
})
export class MatrículasModuleModule {}
