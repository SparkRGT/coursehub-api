import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export const NODE_ENVS = ['development', 'production', 'test'] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

export class EnvironmentVariables {
  @IsIn(NODE_ENVS)
  NODE_ENV: NodeEnv;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '15m';
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const normalizedConfig = {
    ...config,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? '15m',
  };

  const validated = plainToInstance(EnvironmentVariables, normalizedConfig, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => {
        const constraints = Object.values(error.constraints ?? {}).join(', ');
        return `${error.property}: ${constraints}`;
      })
      .join('; ');
    throw new Error(`Variables de entorno inválidas: ${details}`);
  }

  return validated;
}

export function isSynchronizeEnabled(nodeEnv: string | undefined): boolean {
  return nodeEnv === 'development';
}
