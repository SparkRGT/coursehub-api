import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { COURSE_LEVELS } from './course-response.dto.js';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS desde cero' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: COURSE_LEVELS, example: 'beginner' })
  @IsIn(COURSE_LEVELS)
  level: string;
}

export class UpdateCourseDto {
  @ApiProperty({ example: 'NestJS desde cero, segunda edición' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: COURSE_LEVELS, example: 'intermediate' })
  @IsIn(COURSE_LEVELS)
  level: string;
}
