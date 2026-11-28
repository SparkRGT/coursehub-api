import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../common/openapi/page-meta.dto.js';

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export class CourseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'NestJS desde cero' })
  title: string;

  @ApiProperty({ enum: COURSE_LEVELS, example: 'beginner' })
  level: string;

  @ApiProperty({
    nullable: true,
    example: 4,
    description:
      'Usuario que creó el curso. `null` en cursos anteriores a la autorización por propiedad.',
  })
  createdByUserId: number | null;
}

export class PaginatedCoursesDto {
  @ApiProperty({ type: [CourseResponseDto] })
  items: CourseResponseDto[];

  @ApiProperty({ type: PageMetaDto })
  meta: PageMetaDto;
}
