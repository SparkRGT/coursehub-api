import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { isSynchronizeEnabled } from './env.validation.js';

export function createTypeOrmOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  const nodeEnv = config.getOrThrow<string>('NODE_ENV');

  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DATABASE_HOST'),
    port: config.getOrThrow<number>('DATABASE_PORT'),
    username: config.getOrThrow<string>('DATABASE_USER'),
    password: config.getOrThrow<string>('DATABASE_PASSWORD'),
    database: config.getOrThrow<string>('DATABASE_NAME'),
    autoLoadEntities: true,
    synchronize: isSynchronizeEnabled(nodeEnv),
  };
}
