import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../common/openapi/page-meta.dto.js';

export class EstudianteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ana Pérez' })
  name: string;

  @ApiProperty({ example: 'ana.perez@example.com' })
  email: string;

  @ApiProperty({ example: 21 })
  age: number;

  @ApiProperty({ example: 'Ingeniería de Software' })
  career: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 10 })
  semester: number;

  @ApiProperty({
    example: true,
    description: 'Un estudiante inactivo no puede matricularse',
  })
  isActive: boolean;
}

export class PaginatedEstudiantesDto {
  @ApiProperty({ type: [EstudianteResponseDto] })
  items: EstudianteResponseDto[];

  @ApiProperty({ type: PageMetaDto })
  meta: PageMetaDto;
}
