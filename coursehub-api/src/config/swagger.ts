import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Ruta de la interfaz navegable. */
export const SWAGGER_UI_PATH = 'docs';

/** Ruta del documento OpenAPI en JSON; es la que se compara con la API. */
export const SWAGGER_JSON_PATH = 'docs-json';

/**
 * Publica el contrato OpenAPI a partir de los decoradores de los controladores
 * y los DTO. El servidor de documentos describe la versión declarada en la ruta
 * (`/v1/...`), de modo que la documentación no pueda contradecir el versionado.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CourseHub API')
    .setDescription(
      [
        'Cursos, estudiantes y matrículas con autenticación por JWT.',
        '',
        'Las lecturas son públicas. Las escrituras requieren `Authorization: Bearer <accessToken>`',
        'con un rol suficiente: `admin` para estudiantes y matrículas, `admin` o `teacher` para cursos.',
        'Todos los errores comparten la misma forma: `statusCode`, `error`, `message`, `path`, `timestamp`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Token obtenido en `POST /v1/auth/login`',
    })
    .addTag('autenticación', 'Registro, inicio de sesión e identidad del token')
    .addTag('cursos', 'Recurso de cursos: lectura pública y escritura protegida')
    .addTag('estudiantes', 'Recurso de estudiantes; las escrituras son de administración')
    .addTag('matrículas', 'Relación entre un estudiante activo y un curso')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_UI_PATH, app, document, {
    jsonDocumentUrl: SWAGGER_JSON_PATH,
    swaggerOptions: { persistAuthorization: true },
  });
}
