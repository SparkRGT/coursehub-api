import { Module } from '@nestjs/common';
import { EstudiantesController } from './estudiantes.controller.js';
import { EstudiantesService } from './estudiantes.service.js';

@Module({
  controllers: [EstudiantesController],
  providers: [EstudiantesService]
})
export class EstudiantesModule {}
