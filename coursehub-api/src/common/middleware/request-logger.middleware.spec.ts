import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestLoggerMiddleware } from './request-logger.middleware.js';

describe('RequestLoggerMiddleware', () => {
  it('registra método, ruta, estado y duración sin cabeceras', () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const finishHandlers: Array<() => void> = [];
    const request = {
      method: 'POST',
      originalUrl: '/courses?level=beginner',
      headers: { authorization: 'Bearer token-secreto' },
      body: { title: 'NestJS' },
    } as unknown as Request;
    const response = {
      statusCode: 201,
      on: (event: string, handler: () => void) => {
        if (event === 'finish') finishHandlers.push(handler);
      },
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    new RequestLoggerMiddleware().use(request, response, next);
    finishHandlers.forEach((handler) => handler());

    expect(next).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^POST \/courses\?level=beginner 201 \d+ms$/),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('token-secreto');

    log.mockRestore();
  });
});
