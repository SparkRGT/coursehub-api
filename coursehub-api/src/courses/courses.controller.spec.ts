import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { UserRole } from '../users/user-role.enum.js';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

const actor: AuthenticatedUser = {
  id: 4,
  email: 'docente@example.com',
  role: UserRole.TEACHER,
};
const dto = { title: 'NestJS avanzado', level: 'advanced' as const };

describe('CoursesController', () => {
  let controller: CoursesController;

  const coursesService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  };
  const updateCourse = { execute: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: coursesService },
        { provide: UpdateCourseUseCase, useValue: updateCourse },
      ],
    }).compile();

    controller = module.get(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delega la actualización con id, DTO e identidad autenticada', async () => {
    updateCourse.execute.mockResolvedValue({ id: 7, ...dto });

    await expect(controller.update(7, dto, actor)).resolves.toEqual({
      id: 7,
      ...dto,
    });

    expect(updateCourse.execute).toHaveBeenCalledWith(7, dto, actor);
  });

  it('propaga el rechazo del caso de uso en lugar de responder 200', async () => {
    updateCourse.execute.mockRejectedValue(
      new ForbiddenException('No puedes modificar un curso que no te pertenece'),
    );

    await expect(controller.update(7, dto, actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('delega el listado con la consulta recibida', () => {
    const query = { page: 2, limit: 5 };

    controller.findAll(query);

    expect(coursesService.findAll).toHaveBeenCalledWith(query);
  });

  it('delega la búsqueda por id como cadena', () => {
    controller.findOne(7);

    expect(coursesService.findOne).toHaveBeenCalledWith('7');
  });

  it('delega la creación con el cuerpo y la identidad autenticada', async () => {
    const body = { title: 'NestJS', level: 'beginner' };
    coursesService.create.mockResolvedValue({ id: 8, ...body, createdByUserId: actor.id });

    await expect(controller.create(body, actor)).resolves.toMatchObject({ id: 8 });
    expect(coursesService.create).toHaveBeenCalledWith(body, actor);
  });

  it('delega la eliminación con el id convertido a cadena', () => {
    controller.remove(7);

    expect(coursesService.remove).toHaveBeenCalledWith('7');
  });
});
