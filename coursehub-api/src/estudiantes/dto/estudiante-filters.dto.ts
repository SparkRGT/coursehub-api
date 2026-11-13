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
  @IsOptional()
  @IsString()
  career?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  semester?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsIn(ESTUDIANTE_SORT_FIELDS)
  sortBy?: EstudianteSortField;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : String(value).toUpperCase(),
  )
  @IsIn(ESTUDIANTE_SORT_ORDERS)
  order?: EstudianteSortOrder;
}
