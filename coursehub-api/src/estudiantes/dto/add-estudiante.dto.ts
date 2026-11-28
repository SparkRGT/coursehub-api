import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class AddEstudianteDto {
    @ApiProperty({ example: 'Ana Pérez' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ format: 'email', example: 'ana.perez@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 21, minimum: 0 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    age: number;

    @ApiProperty({ example: 'Ingeniería de Software' })
    @IsString()
    @IsNotEmpty()
    career: string;

    @ApiProperty({ example: 5, minimum: 1, maximum: 10 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(10)
    semester: number;

    @ApiProperty({
        example: true,
        description: 'Un estudiante inactivo no puede matricularse',
    })
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}
