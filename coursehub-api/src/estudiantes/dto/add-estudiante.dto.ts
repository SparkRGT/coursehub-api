import { IsBoolean,  IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class AddEstudianteDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;
    
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    age: number;

    @IsString()
    @IsNotEmpty()
    career: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(10)
    semester: number;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}