import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnv } from './config/env.validation.js';
import { createTypeOrmOptions } from './config/typeorm.config.js';
import { CoursesModule } from './courses/courses.module.js';
import { EstudiantesModule } from './estudiantes/estudiantes.module.js';
import { MatrículasModuleModule } from './matrículas-module/matrículas-module.module.js';
import { WelcomeController } from './welcome.controller.js';
import { WelcomeService } from './welcome.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createTypeOrmOptions(config),
    }),
    CoursesModule,
    EstudiantesModule,
    MatrículasModuleModule,
  ],
  controllers: [AppController, WelcomeController],
  providers: [AppService, WelcomeService],
})
export class AppModule {}
