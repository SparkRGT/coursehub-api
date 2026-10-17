import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { isSynchronizeEnabled } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const nodeEnv = config.getOrThrow<string>('NODE_ENV');
  const port = config.getOrThrow<number>('PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  Logger.log(
    `NODE_ENV=${nodeEnv}; TypeORM synchronize=${isSynchronizeEnabled(nodeEnv)}`,
    'Bootstrap',
  );
  await app.listen(port);
}

await bootstrap();
