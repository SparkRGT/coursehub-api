import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

/**
 * Ajustes comunes a `bootstrap` y a las pruebas e2e. La app de prueba debe
 * validar los DTO y exponer las mismas rutas que la real; de lo contrario los
 * casos HTTP no representan al servidor que se despliega.
 *
 * El versionado es por URI y vive aquí por la misma razón: la versión forma
 * parte de la ruta pública (`/v1/courses`), así que el contrato solo coincide
 * con la API si la app de pruebas también la publica.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  return app;
}
