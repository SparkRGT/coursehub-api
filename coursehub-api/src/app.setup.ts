import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Ajustes comunes a `bootstrap` y a las pruebas e2e. La app de prueba debe
 * validar los DTO igual que la real; de lo contrario los casos HTTP no
 * representan al servidor que se despliega.
 */
export function configureApp(app: INestApplication): INestApplication {
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
