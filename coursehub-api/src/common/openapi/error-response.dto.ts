import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';

/**
 * Forma única de error que produce `HttpExceptionFilter`. El contrato la
 * publica para que el cliente no tenga que adivinarla ni mirar el código.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 404, description: 'Código HTTP de la respuesta' })
  statusCode: number;

  @ApiPropertyOptional({
    example: 'Not Found',
    description: 'Nombre del estado HTTP, cuando la excepción lo aporta',
  })
  error?: string;

  @ApiProperty({
    description:
      'Mensaje legible. En un 400 de validación es un arreglo con un mensaje por campo inválido.',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
    example: 'Course 3 not found',
  })
  message: string | string[];

  @ApiProperty({
    example: '/v1/courses/3',
    description: 'Ruta solicitada, ya versionada',
  })
  path: string;

  @ApiProperty({
    example: '2026-11-28T15:20:00.000Z',
    format: 'date-time',
  })
  timestamp: string;
}

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Solicitud inválida: parámetros, cuerpo o ruta fuera del contrato',
  401: 'Falta el token, o su firma o vigencia no son válidas',
  403: 'El token es válido pero el rol o la propiedad del recurso no alcanzan',
  404: 'El recurso solicitado no existe',
  409: 'Conflicto de unicidad: el recurso ya existe',
  429: 'Límite de peticiones superado',
};

/** Declara en OpenAPI los errores reales de una ruta, con el esquema común. */
export function ApiErrorResponses(...statuses: number[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        type: ErrorResponseDto,
        description: ERROR_DESCRIPTIONS[status] ?? 'Error',
      }),
    ),
  );
}
