import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseEstudianteIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);

    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('El identificador debe ser un entero positivo');
    }

    return id;
  }
}
