import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from '../courses/courses.module.js';
import { EstudiantesModule } from '../estudiantes/estudiantes.module.js';
import { MatrículasModuleService } from './matrículas-module.service.js';
import { MatrículasModuleController } from './matrículas-module.controller.js';
import { Enrollment } from './entities/matricula.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment]), CoursesModule, EstudiantesModule],
  providers: [MatrículasModuleService],
  controllers: [MatrículasModuleController],
})
export class MatrículasModuleModule {}
