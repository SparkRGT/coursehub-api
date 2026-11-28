import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { SWAGGER_JSON_PATH, setupSwagger } from '../src/config/swagger.js';

type ApiOperation = {
  security?: Record<string, string[]>[];
  responses?: Record<
    string,
    { content?: Record<string, { schema?: { $ref?: string } }> }
  >;
};

type OpenApiDocument = {
  info: { title: string; version: string };
  paths: Record<string, Record<string, ApiOperation> | undefined>;
  components?: { schemas?: Record<string, unknown> };
};

/**
 * La documentación no reemplaza a las pruebas: aquí se comprueba que el
 * documento publicado describa la API que realmente responde. Si alguien
 * cambia una ruta, un guard o un error sin documentarlo, este conjunto falla.
 */
describe('Contrato OpenAPI (e2e)', () => {
  let app: INestApplication;
  let document: OpenApiDocument;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication());
    setupSwagger(app);
    await app.init();

    const response = await request(app.getHttpServer())
      .get(`/${SWAGGER_JSON_PATH}`)
      .expect(200);

    document = response.body as OpenApiDocument;
  });

  afterAll(async () => {
    await app.close();
  });

  function operation(path: string, method: string): ApiOperation {
    const entry = document.paths[path]?.[method];
    expect(entry, `${method.toUpperCase()} ${path} no está documentada`).toBeDefined();
    return entry as ApiOperation;
  }

  function errorSchemaRef(path: string, method: string, status: number): string | undefined {
    return operation(path, method).responses?.[status]?.content?.['application/json']?.schema
      ?.$ref;
  }

  it('publica el documento con el título y la versión del contrato', () => {
    expect(document.info).toMatchObject({ title: 'CourseHub API', version: '1.0' });
  });

  it('documenta las rutas con la versión explícita que responde la API', () => {
    expect(Object.keys(document.paths)).toEqual(
      expect.arrayContaining([
        '/v1/auth/login',
        '/v1/auth/register',
        '/v1/courses',
        '/v1/courses/{id}',
        '/v1/estudiantes',
        '/v1/enrollments',
      ]),
    );

    // Ninguna ruta sin versión: la documentación no puede contradecir /v1.
    // La raíz también está versionada y se publica como `/v1`, no como `/`.
    expect(
      Object.keys(document.paths).filter(
        (path) => path !== '/v1' && !path.startsWith('/v1/'),
      ),
    ).toEqual([]);
  });

  it('documenta la lectura pública de cursos con la forma paginada', () => {
    const schema = operation('/v1/courses', 'get').responses?.['200']?.content?.[
      'application/json'
    ]?.schema;

    expect(schema?.$ref).toBe('#/components/schemas/PaginatedCoursesDto');
    expect(document.components?.schemas).toHaveProperty('PaginatedCoursesDto');
    expect(document.components?.schemas).toHaveProperty('PageMetaDto');
  });

  it('marca la escritura de cursos como protegida y documenta 400, 401 y 403', () => {
    const post = operation('/v1/courses', 'post');

    expect(post.security).toEqual([{ bearer: [] }]);
    expect(Object.keys(post.responses ?? {})).toEqual(
      expect.arrayContaining(['201', '400', '401', '403']),
    );

    for (const status of [400, 401, 403]) {
      expect(errorSchemaRef('/v1/courses', 'post', status)).toBe(
        '#/components/schemas/ErrorResponseDto',
      );
    }
  });

  it('documenta el 404 de un curso inexistente y no expone detalles internos', () => {
    expect(errorSchemaRef('/v1/courses/{id}', 'get', 404)).toBe(
      '#/components/schemas/ErrorResponseDto',
    );

    const published = JSON.stringify(document);
    for (const secret of ['JWT_SECRET', 'DATABASE_PASSWORD', 'passwordHash', 'postgres']) {
      expect(published).not.toContain(secret);
    }
  });
});
