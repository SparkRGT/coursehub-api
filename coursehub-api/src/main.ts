import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
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

  Logger.log(
    `NODE_ENV=${nodeEnv}; TypeORM synchronize=${isSynchronizeEnabled(nodeEnv)}`,
    'Bootstrap',
  );
  await app.listen(port);
}

await bootstrap();
