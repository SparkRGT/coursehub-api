import { Injectable } from '@nestjs/common';

export type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class MatrículasModuleService {
    private readonly enrollments: Enrollment[] = [];
    private nextId = 1;

    findAll(filters: ): Enrollment[] {
        return this.enrollments;
    }

}

