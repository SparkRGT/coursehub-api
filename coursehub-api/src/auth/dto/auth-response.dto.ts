import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/user-role.enum.js';

export class PublicUserDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 'docente@coursehub.test' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  role: UserRole;

  @ApiProperty({ example: '2026-11-28T15:20:00.000Z', format: 'date-time' })
  createdAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT para la cabecera `Authorization: Bearer <accessToken>`',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ type: PublicUserDto })
  user: PublicUserDto;
}

export class AuthenticatedUserDto {
  @ApiProperty({ example: 7, description: 'Identificador del usuario (`sub` del token)' })
  id: number;

  @ApiProperty({ example: 'docente@coursehub.test' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TEACHER })
  role: UserRole;
}
