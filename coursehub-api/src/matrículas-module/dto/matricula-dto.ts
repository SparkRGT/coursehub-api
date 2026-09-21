import {Transform, Type} from 'class-transformer';
import {IsInt, IsOptional, IsString, Max, Min} from 'class-validator';

export class MatriculaFiltersDto {
  @IsOptional()
  @IsString()
  student?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  studentId?: number;
  @IsOptional()
