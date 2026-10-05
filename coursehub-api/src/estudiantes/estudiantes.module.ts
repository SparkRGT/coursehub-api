import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudiantesController } from './estudiantes.controller.js';
import { EstudiantesService } from './estudiantes.service.js';
import { Estudiante } from './entities/estudiante.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante])],
  controllers: [EstudiantesController],
  providers: [EstudiantesService],
  exports: [EstudiantesService],
})
export class EstudiantesModule {}
