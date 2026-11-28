import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../common/openapi/page-meta.dto.js';
import { CourseResponseDto } from '../../courses/dto/course-response.dto.js';
import { EstudianteResponseDto } from '../../estudiantes/dto/estudiante-response.dto.js';

export class EnrollmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: EstudianteResponseDto })
  student: EstudianteResponseDto;

  @ApiProperty({ type: CourseResponseDto })
  course: CourseResponseDto;
}

export class PaginatedEnrollmentsDto {
  @ApiProperty({ type: [EnrollmentResponseDto] })
  items: EnrollmentResponseDto[];

  @ApiProperty({ type: PageMetaDto })
  meta: PageMetaDto;
}
