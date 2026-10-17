import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';

describe('CoursesService', () => {
  let service: CoursesService;
  const findAndCount = vi.fn();

  beforeEach(async () => {
    findAndCount.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: { findAndCount },
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
});
