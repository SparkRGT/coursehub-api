import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email', example: 'docente@coursehub.test' })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'contrasena-de-ejemplo',
    minLength: 8,
    maxLength: 72,
    description: 'Contraseña en claro solo en la petición; el servidor guarda su hash',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
