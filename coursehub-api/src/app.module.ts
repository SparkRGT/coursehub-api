import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TimingInterceptor } from './common/interceptors/timing.interceptor.js';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';
import { validateEnv } from './config/env.validation.js';
import { createTypeOrmOptions } from './config/typeorm.config.js';
import { CoursesModule } from './courses/courses.module.js';
import { EstudiantesModule } from './estudiantes/estudiantes.module.js';
import { MatrículasModuleModule } from './matrículas-module/matrículas-module.module.js';
import { UsersModule } from './users/users.module.js';
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
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 20 }],
      // Las pruebas e2e envían todas sus solicitudes desde la misma IP en
      // segundos; el límite se cubre por unidad y aquí solo impediría que el
      // conjunto fuese repetible.
      skipIf: () => process.env.NODE_ENV === 'test',
    }),
    CoursesModule,
    EstudiantesModule,
    MatrículasModuleModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, WelcomeController],
  providers: [
    AppService,
    WelcomeService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('{*splat}');
  }
}
