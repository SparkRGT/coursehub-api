import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity.js';
import { EstudiantesService } from './estudiantes.service.js';

function uniqueViolation() {
  const driverError = new Error('duplicate key') as Error & { code: string };
  driverError.code = '23505';
  return new QueryFailedError('INSERT', [], driverError);
}

describe('EstudiantesService', () => {
  let service: EstudiantesService;

  const queryBuilder = {
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    skip: vi.fn(),
    take: vi.fn(),
    getManyAndCount: vi.fn(),
  };

  const repository = {
    createQueryBuilder: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((dto: Partial<Estudiante>) => dto),
    save: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    queryBuilder.andWhere.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.skip.mockReturnValue(queryBuilder);
    queryBuilder.take.mockReturnValue(queryBuilder);
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    repository.create.mockImplementation((dto: Partial<Estudiante>) => dto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudiantesService,
        { provide: getRepositoryToken(Estudiante), useValue: repository },
      ],
    }).compile();

    service = module.get(EstudiantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('pagina, filtra, busca y ordena estudiantes', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[{ id: 1 }], 3]);

    const result = await service.findAll({
      career: 'Ingeniería de Software',
      semester: 5,
      isActive: true,
      search: 'ana',
      page: 2,
      limit: 2,
      sortBy: 'name',
      order: 'DESC',
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'student.career = :career',
      { career: 'Ingeniería de Software' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'student.semester = :semester',
      { semester: 5 },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'student.isActive = :isActive',
      { isActive: true },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(student.name ILIKE :search OR student.email ILIKE :search)',
      { search: '%ana%' },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('student.name', 'DESC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(2);
    expect(queryBuilder.take).toHaveBeenCalledWith(2);
    expect(result).toEqual({
      items: [{ id: 1 }],
      meta: { total: 3, page: 2, limit: 2, totalPages: 2 },
    });
  });

  it('usa página, límite y orden por defecto', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll({});

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('student.id', 'ASC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  });

  it('crea un estudiante con un correo libre', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: 1, email: 'ana@example.com' });

    await expect(
      service.create({
        name: 'Ana',
        email: 'ana@example.com',
        age: 21,
        career: 'Ingeniería de Software',
        semester: 5,
        isActive: true,
      }),
    ).resolves.toEqual({ id: 1, email: 'ana@example.com' });
  });

  it('rechaza un correo ya registrado desde el servicio', async () => {
    repository.findOne.mockResolvedValue({ id: 2, email: 'ana@example.com' });

    await expect(
      service.create({
        name: 'Ana',
        email: 'ana@example.com',
        age: 21,
        career: 'Ingeniería de Software',
        semester: 5,
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('traduce la restricción única de la base de datos a 409', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.save.mockRejectedValue(uniqueViolation());

    await expect(
      service.create({
        name: 'Ana',
        email: 'ana@example.com',
        age: 21,
        career: 'Ingeniería de Software',
        semester: 5,
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
