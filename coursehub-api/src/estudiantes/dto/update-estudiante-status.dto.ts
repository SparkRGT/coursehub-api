import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateEstudianteStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
