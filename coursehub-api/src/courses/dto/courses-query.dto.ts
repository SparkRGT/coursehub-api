import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const COURSE_SORT_FIELDS = ['id', 'title', 'level'] as const;
export const SORT_ORDERS = ['ASC', 'DESC'] as const;

export type CourseSortField = (typeof COURSE_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

export class CoursesQueryDto {
  @IsOptional()
  @IsString()
  level?: string;

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
  @IsIn(COURSE_SORT_FIELDS)
  sortBy?: CourseSortField;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : String(value).toUpperCase(),
  )
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
