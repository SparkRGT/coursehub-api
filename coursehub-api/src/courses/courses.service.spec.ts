import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { UserRole } from '../users/user-role.enum.js';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';

const owner: AuthenticatedUser = {
  id: 5,
  email: 'docente@example.com',
  role: UserRole.TEACHER,
};
const otherTeacher: AuthenticatedUser = {
  id: 6,
  email: 'otro@example.com',
  role: UserRole.TEACHER,
};
const admin: AuthenticatedUser = {
  id: 1,
  email: 'admin@example.com',
  role: UserRole.ADMIN,
};

describe('CoursesService', () => {
  let service: CoursesService;
  const findAndCount = vi.fn();
  const findOneBy = vi.fn();
  const create = vi.fn((dto: Partial<Course>) => dto);
  const save = vi.fn();
  const remove = vi.fn();

  beforeEach(async () => {
    vi.resetAllMocks();
    create.mockImplementation((dto: Partial<Course>) => dto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: { findAndCount, findOneBy, create, save, remove },
        },
      ],
    }).compile();

    service = module.get(CoursesService);
  });

  it('pagina, filtra y ordena con valores por defecto', async () => {
    findAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll({});

    expect(findAndCount).toHaveBeenCalledWith({
      where: {},
      order: { id: 'ASC' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
  });

  it('aplica level, page, limit, sortBy y order', async () => {
    findAndCount.mockResolvedValue([[{ id: 2, title: 'API', level: 'beginner' }], 3]);

    const result = await service.findAll({
      level: 'beginner',
      page: 2,
      limit: 1,
      sortBy: 'title',
      order: 'DESC',
    });

    expect(findAndCount).toHaveBeenCalledWith({
      where: { level: 'beginner' },
      order: { title: 'DESC' },
      skip: 1,
      take: 1,
    });
    expect(result.meta).toEqual({
      total: 3,
      page: 2,
      limit: 1,
      totalPages: 3,
    });
  });

  it('ignora un sortBy fuera de la lista permitida', async () => {
    findAndCount.mockResolvedValue([[], 0]);

    await service.findAll({ sortBy: 'name' as 'id' });

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ order: { id: 'ASC' } }),
    );
  });

  it('registra al usuario autenticado como propietario del curso', async () => {
    save.mockImplementation((course: Partial<Course>) => course);

    await service.create({ title: 'NestJS', level: 'beginner' }, owner);

    expect(create).toHaveBeenCalledWith({
      title: 'NestJS',
      level: 'beginner',
      createdByUserId: owner.id,
    });
    expect(save).toHaveBeenCalled();
  });

  it('permite al docente propietario actualizar su curso', async () => {
    findOneBy.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: owner.id });
    save.mockImplementation((course: Partial<Course>) => course);

    const result = await service.update('3', { title: 'NestJS avanzado', level: 'advanced' }, owner);

    expect(result).toMatchObject({ title: 'NestJS avanzado', createdByUserId: owner.id });
  });

  it('rechaza con 403 al docente que no es propietario', async () => {
    findOneBy.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: owner.id });

    await expect(
      service.update('3', { title: 'NestJS avanzado', level: 'advanced' }, otherTeacher),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(save).not.toHaveBeenCalled();
  });

  it('permite al admin actualizar un curso ajeno', async () => {
    findOneBy.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: owner.id });
    save.mockImplementation((course: Partial<Course>) => course);

    await expect(
      service.update('3', { title: 'NestJS avanzado', level: 'advanced' }, admin),
    ).resolves.toMatchObject({ title: 'NestJS avanzado' });
  });

  it('rechaza la actualización de un curso sin propietario salvo para admin', async () => {
    findOneBy.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: null });

    await expect(
      service.update('3', { title: 'NestJS avanzado', level: 'advanced' }, owner),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
