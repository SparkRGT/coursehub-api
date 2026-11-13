import { ArgumentsHost, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

function hostFor(url = '/courses/abc') {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'GET', originalUrl: url }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('conserva el mensaje de una excepción HTTP', () => {
    const { host, status, json } = hostFor('/courses/3');

    filter.catch(new NotFoundException('Course 3 not found'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Course 3 not found',
        path: '/courses/3',
        timestamp: expect.any(String),
      }),
    );
  });

  it('mantiene los mensajes de validación', () => {
    const { host, status, json } = hostFor('/courses');

    filter.catch(
      new BadRequestException({
        message: ['title should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: ['title should not be empty'],
      }),
    );
  });

  it('oculta los detalles de un error inesperado', () => {
    const { host, status, json } = hostFor('/courses');

    filter.catch(new Error('SELECT * FROM users failed'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body).toMatchObject({
      statusCode: 500,
      message: 'Internal server error',
      path: '/courses',
    });
    expect(JSON.stringify(body)).not.toContain('SELECT');
  });
});
