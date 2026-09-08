import { Injectable } from '@nestjs/common';

type Course = {
  id: number;
  title: string;
  level:string;
}

@Injectable()
export class CoursesService {
    private readonly courses: Course[] = [
        {id: 1, title: 'NestJS', level: 'Intermediate'},
        {id: 2, title: 'React', level: 'Beginner'},
        {id: 3, title: 'Angular', level: 'Advanced'},
    ];
    findAll(level?: string): Course[] {
        if (!level) {
            return this.courses;
        }
        return this.courses.filter(course => course.level === level);
        
    }
    findOne(id: number): Course | undefined {
        return this.courses.find(course => course.id === id);
    }
}
