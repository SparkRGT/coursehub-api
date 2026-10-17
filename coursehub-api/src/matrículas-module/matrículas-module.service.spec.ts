import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CoursesService } from '../courses/courses.service.js';
import { EstudiantesService } from '../estudiantes/estudiantes.service.js';
import { Enrollment } from './entities/matricula.entity.js';
import { MatrículasModuleService } from './matrículas-module.service.js';

describe('MatrículasModuleService', () => {
  let service: MatrículasModuleService;
  const enrollmentRepository = {
    createQueryBuilder: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn((value) => value),
    save: vi.fn(),
    find: vi.fn(),
    delete: vi.fn(),
  };
  const estudiantesService = { findOne: vi.fn() };
  const coursesService = { findOne: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatrículasModuleService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: enrollmentRepository,
        },
        { provide: EstudiantesService, useValue: estudiantesService },
        { provide: CoursesService, useValue: coursesService },
      ],
    }).compile();

    service = module.get(MatrículasModuleService);
  });

  it('rechaza un estudiante inexistente', async () => {
    estudiantesService.findOne.mockRejectedValue(
      new NotFoundException('No existe el estudiante con id 99'),
    );

    await expect(
      service.create({ studentId: 99, courseId: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(coursesService.findOne).not.toHaveBeenCalled();
  });

  it('rechaza un estudiante inactivo', async () => {
    estudiantesService.findOne.mockResolvedValue({ id: 4, isActive: false });

    await expect(
      service.create({ studentId: 4, courseId: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(coursesService.findOne).not.toHaveBeenCalled();
  });

  it('rechaza un curso inexistente', async () => {
    estudiantesService.findOne.mockResolvedValue({ id: 4, isActive: true });
    coursesService.findOne.mockRejectedValue(
      new NotFoundException('Course 9 not found'),
    );

    await expect(
      service.create({ studentId: 4, courseId: 9 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza una matrícula duplicada', async () => {
    estudiantesService.findOne.mockResolvedValue({ id: 4, isActive: true });
    coursesService.findOne.mockResolvedValue({ id: 1 });
    enrollmentRepository.findOne.mockResolvedValue({ id: 10 });

    await expect(
      service.create({ studentId: 4, courseId: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(enrollmentRepository.save).not.toHaveBeenCalled();
  });

  it('traduce la restricción única de PostgreSQL a 409', async () => {
    estudiantesService.findOne.mockResolvedValue({ id: 4, isActive: true });
    coursesService.findOne.mockResolvedValue({ id: 1 });
    enrollmentRepository.findOne.mockResolvedValue(null);
    const driverError = new Error('duplicate key') as Error & { code: string };
    driverError.code = '23505';
    enrollmentRepository.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], driverError),
    );

    await expect(
      service.create({ studentId: 4, courseId: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('parametriza la búsqueda y combina filtros', async () => {
    const andWhere = vi.fn().mockReturnThis();
    const qb = {
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      andWhere,
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
    };
    enrollmentRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findAll({
      search: 'nest',
      studentId: 4,
      courseId: 1,
      activeOnly: 'true',
      page: 1,
      limit: 5,
    });

    const searchCall = andWhere.mock.calls.find((call) =>
      String(call[0]).includes(':search'),
    );
    expect(searchCall?.[0]).not.toContain('nest');
    expect(searchCall?.[1]).toEqual({ search: '%nest%' });
    expect(andWhere).toHaveBeenCalledWith('student.id = :studentId', {
      studentId: 4,
    });
    expect(andWhere).toHaveBeenCalledWith('course.id = :courseId', {
      courseId: 1,
    });
    expect(result).toEqual({
      items: [],
      meta: { total: 0, page: 1, limit: 5, totalPages: 0 },
    });
  });
});
