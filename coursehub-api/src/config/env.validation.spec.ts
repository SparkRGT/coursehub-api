import { ConfigService } from '@nestjs/config';
import { createTypeOrmOptions } from './typeorm.config.js';
import { isSynchronizeEnabled, validateEnv } from './env.validation.js';

const validEnv = {
  NODE_ENV: 'development',
  PORT: '4500',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USER: 'postgres',
  DATABASE_PASSWORD: 'cambia-esta-clave',
  DATABASE_NAME: 'coursehub',
};

describe('validateEnv', () => {
  it('acepta el esquema y convierte los puertos a número', () => {
    const env = validateEnv(validEnv);

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4500);
    expect(env.DATABASE_PORT).toBe(5432);
  });

  it('rechaza el arranque si falta una variable requerida', () => {
    const { DATABASE_PASSWORD: _password, ...incomplete } = validEnv;

    expect(() => validateEnv(incomplete)).toThrow(/DATABASE_PASSWORD/);
  });

  it('rechaza un NODE_ENV desconocido', () => {
    expect(() => validateEnv({ ...validEnv, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });
});

describe('isSynchronizeEnabled', () => {
  it('solo activa synchronize en development', () => {
    expect(isSynchronizeEnabled('development')).toBe(true);
    expect(isSynchronizeEnabled('production')).toBe(false);
    expect(isSynchronizeEnabled('test')).toBe(false);
    expect(isSynchronizeEnabled(undefined)).toBe(false);
  });
});

describe('createTypeOrmOptions', () => {
  it('construye la conexión desde ConfigService y apaga synchronize en producción', () => {
    const values: Record<string, string | number> = {
      ...validEnv,
      NODE_ENV: 'production',
      PORT: 4500,
      DATABASE_PORT: 5432,
    };
    const config = {
      getOrThrow: (key: string) => values[key],
    } as ConfigService;

    const options = createTypeOrmOptions(config);

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'coursehub',
      autoLoadEntities: true,
      synchronize: false,
    });
  });
});
