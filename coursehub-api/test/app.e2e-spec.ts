import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { User } from '../src/users/entities/users.entity.js';
import { UserRole } from '../src/users/user-role.enum.js';

const PASSWORD = 'contrasena-de-prueba';
const adminCredentials = { email: 'admin.e2e@example.com', password: PASSWORD };
const studentCredentials = {
  email: 'estudiante.e2e@example.com',
  password: PASSWORD,
};

describe('CourseHub API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let users: Repository<User>;
  let server: Parameters<typeof request>[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();

    server = app.getHttpServer();
    dataSource = app.get(DataSource);
    users = app.get(getRepositoryToken(User));
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await app.close();
  });

  async function truncateAllTables(): Promise<void> {
    const [{ current_database: database }] = (await dataSource.query(
      'SELECT current_database()',
    )) as [{ current_database: string }];

    if (!database.endsWith('_test')) {
      throw new Error(
        `Se rechaza vaciar la base "${database}": el nombre debe terminar en _test`,
      );
    }

    const tables = (await dataSource.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    )) as { tablename: string }[];

    if (tables.length === 0) return;

    await dataSource.query(
      `TRUNCATE TABLE ${tables
        .map(({ tablename }) => `"${tablename}"`)
        .join(', ')} RESTART IDENTITY CASCADE`,
    );
  }

  async function registerAndLogin(
    credentials: { email: string; password: string },
    role: UserRole = UserRole.STUDENT,
  ): Promise<string> {
    await request(server).post('/v1/auth/register').send(credentials).expect(201);

    if (role !== UserRole.STUDENT) {
      await users.update({ email: credentials.email }, { role });
    }

    const login = await request(server)
      .post('/v1/auth/login')
      .send(credentials)
      .expect(200);

    return login.body.accessToken as string;
  }

  it('GET /courses responde la ruta pública con la forma paginada', async () => {
    const response = await request(server).get('/v1/courses').expect(200);

    expect(response.body).toEqual({
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
  });

  it('POST /courses sin token responde 401 con el formato de error común', async () => {
    const response = await request(server)
      .post('/v1/courses')
      .send({ title: 'Curso sin credenciales', level: 'beginner' })
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      path: '/v1/courses',
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('POST /courses con rol student responde 403', async () => {
    const token = await registerAndLogin(studentCredentials);

    await request(server)
      .post('/v1/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Curso de estudiante', level: 'beginner' })
      .expect(403);
  });

  it('POST /courses con rol admin persiste el curso y lo expone en la lectura pública', async () => {
    const token = await registerAndLogin(adminCredentials, UserRole.ADMIN);

    const created = await request(server)
      .post('/v1/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'NestJS avanzado', level: 'advanced' })
      .expect(201);

    expect(created.body).toMatchObject({
      id: 1,
      title: 'NestJS avanzado',
      level: 'advanced',
    });
    expect(created.body.createdByUserId).toEqual(expect.any(Number));

    const list = await request(server).get('/v1/courses?level=advanced').expect(200);

    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0]).toMatchObject({ title: 'NestJS avanzado' });
    expect(list.body.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
  });

  it('POST /courses con un nivel fuera del contrato responde 400', async () => {
    const token = await registerAndLogin(adminCredentials, UserRole.ADMIN);

    const response = await request(server)
      .post('/v1/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Curso con nivel inválido', level: 'experto' })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.path).toBe('/v1/courses');
  });

  it('GET /courses/:id de un curso inexistente responde 404', async () => {
    const response = await request(server).get('/v1/courses/9999').expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      path: '/v1/courses/9999',
    });
  });
});
