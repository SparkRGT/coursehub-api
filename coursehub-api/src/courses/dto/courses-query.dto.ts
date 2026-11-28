import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const COURSE_SORT_FIELDS = ['id', 'title', 'level'] as const;
export const SORT_ORDERS = ['ASC', 'DESC'] as const;

export type CourseSortField = (typeof COURSE_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

export class CoursesQueryDto {
  @ApiPropertyOptional({
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner',
    description: 'Coincidencia exacta con el nivel del curso',
  })
  @IsOptional()
  @IsString()
  level?: string;

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

  @ApiPropertyOptional({ enum: COURSE_SORT_FIELDS, example: 'title', default: 'id' })
  @IsOptional()
  @IsIn(COURSE_SORT_FIELDS)
  sortBy?: CourseSortField;

  @ApiPropertyOptional({ enum: SORT_ORDERS, example: 'ASC', default: 'ASC' })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : String(value).toUpperCase(),
  )
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
