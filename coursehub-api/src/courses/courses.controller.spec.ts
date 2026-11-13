import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCourseUseCase } from './application/update-course.use-case.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

describe('CoursesController', () => {
  let controller: CoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: {} },
        { provide: UpdateCourseUseCase, useValue: {} },
      ],
    }).compile();

    controller = module.get(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
