import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const ESTUDIANTE_SORT_FIELDS = [
  'id',
  'name',
  'email',
  'career',
  'semester',
] as const;
export const ESTUDIANTE_SORT_ORDERS = ['ASC', 'DESC'] as const;

export type EstudianteSortField = (typeof ESTUDIANTE_SORT_FIELDS)[number];
export type EstudianteSortOrder = (typeof ESTUDIANTE_SORT_ORDERS)[number];

export class EstudianteFiltersDto {
  @ApiPropertyOptional({ example: 'Ingeniería de Software', description: 'Coincidencia exacta' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiPropertyOptional({ type: Number, example: 5, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  semester?: number;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'ana',
    description: 'Compara, sin distinguir mayúsculas, con el nombre o el correo',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, example: 10, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ enum: ESTUDIANTE_SORT_FIELDS, example: 'name', default: 'id' })
  @IsOptional()
  @IsIn(ESTUDIANTE_SORT_FIELDS)
  sortBy?: EstudianteSortField;

  @ApiPropertyOptional({ enum: ESTUDIANTE_SORT_ORDERS, example: 'ASC', default: 'ASC' })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : String(value).toUpperCase(),
  )
  @IsIn(ESTUDIANTE_SORT_ORDERS)
  order?: EstudianteSortOrder;
}
