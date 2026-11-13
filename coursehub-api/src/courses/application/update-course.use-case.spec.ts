import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/jwt-payload.type.js';
import { UserRole } from '../../users/user-role.enum.js';
import { Course } from '../entities/course.entity.js';
import type { CourseRepository } from '../domain/course.repository.js';
import { UpdateCourseUseCase } from './update-course.use-case.js';

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

describe('UpdateCourseUseCase', () => {
  const findById = vi.fn();
  const save = vi.fn<(course: Course) => Promise<Course>>();
  const repository: CourseRepository = { findById, save };

  let useCase: UpdateCourseUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    save.mockImplementation(async (course) => course);
    useCase = new UpdateCourseUseCase(repository);
  });

  it('actualiza el curso del docente propietario', async () => {
    findById.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: owner.id });

    const result = await useCase.execute(
      3,
      { title: 'NestJS avanzado', level: 'advanced' },
      owner,
    );

    expect(result).toMatchObject({ title: 'NestJS avanzado' });
    expect(save).toHaveBeenCalledOnce();
  });

  it('rechaza al docente que no es propietario', async () => {
    findById.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: owner.id });

    await expect(
      useCase.execute(3, { title: 'NestJS avanzado', level: 'advanced' }, otherTeacher),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(save).not.toHaveBeenCalled();
  });

  it('rechaza un curso sin propietario salvo para admin', async () => {
    findById.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: null });

    await expect(
      useCase.execute(3, { title: 'NestJS avanzado', level: 'advanced' }, owner),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('permite al admin actualizar un curso ajeno', async () => {
    findById.mockResolvedValue({ id: 3, title: 'NestJS', createdByUserId: owner.id });

    await expect(
      useCase.execute(3, { title: 'NestJS avanzado', level: 'advanced' }, admin),
    ).resolves.toMatchObject({ title: 'NestJS avanzado' });
  });

  it('responde 404 si el curso no existe', async () => {
    findById.mockResolvedValue(null);

    await expect(
      useCase.execute(99, { title: 'NestJS avanzado', level: 'advanced' }, admin),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
