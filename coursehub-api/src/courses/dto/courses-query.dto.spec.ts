import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CoursesQueryDto } from './courses-query.dto.js';

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true },
});

function parseQuery(query: Record<string, unknown>) {
  return pipe.transform(query, {
    type: 'query',
    metatype: CoursesQueryDto,
    data: '',
  });
}

describe('CoursesQueryDto', () => {
  it('normaliza order y convierte page y limit', async () => {
    const dto = await parseQuery({
      level: 'beginner',
      page: '1',
      limit: '2',
      sortBy: 'title',
      order: 'asc',
    });

    expect(dto).toMatchObject({
      level: 'beginner',
      page: 1,
      limit: 2,
      sortBy: 'title',
      order: 'ASC',
    });
  });

  it('permite omitir los parámetros', async () => {
    await expect(parseQuery({})).resolves.toBeInstanceOf(CoursesQueryDto);
  });

  it('responde 400 si sortBy no está permitido', async () => {
    await expect(parseQuery({ sortBy: 'name' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('responde 400 si limit supera 50', async () => {
    await expect(parseQuery({ limit: '51' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
