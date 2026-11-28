import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { SWAGGER_JSON_PATH, SWAGGER_UI_PATH, setupSwagger } from './config/swagger.js';
import { isSynchronizeEnabled } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const nodeEnv = config.getOrThrow<string>('NODE_ENV');
  const port = config.getOrThrow<number>('PORT');
  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  configureApp(app);

  // El contrato se publica fuera de producción: en producción la interfaz
  // navegable expondría la superficie completa de la API a cualquiera.
  const swaggerEnabled = nodeEnv !== 'production';
  if (swaggerEnabled) setupSwagger(app);

  Logger.log(
    `NODE_ENV=${nodeEnv}; TypeORM synchronize=${isSynchronizeEnabled(nodeEnv)}`,
    'Bootstrap',
  );

  if (swaggerEnabled) {
    Logger.log(
      `Contrato OpenAPI en /${SWAGGER_UI_PATH} (JSON en /${SWAGGER_JSON_PATH})`,
      'Bootstrap',
    );
  }

  await app.listen(port);
}

await bootstrap();
