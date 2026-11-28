import { ApiProperty } from '@nestjs/swagger';

/** Metadatos de paginación que acompañan a todo listado. */
export class PageMetaDto {
  @ApiProperty({ example: 12, description: 'Total de elementos que cumplen el filtro' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 2, description: 'Cantidad de páginas; 0 si no hay datos' })
  totalPages: number;
}
