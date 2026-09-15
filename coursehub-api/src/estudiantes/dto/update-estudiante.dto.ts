import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateEstudianteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  career?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  semester?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
