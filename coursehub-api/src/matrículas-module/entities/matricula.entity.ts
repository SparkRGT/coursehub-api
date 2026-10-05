import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Course } from '../../courses/entities/course.entity.js';
import { Estudiante } from '../../estudiantes/entities/estudiante.entity.js';

@Entity()
export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: number;

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.enrollments)
    @JoinColumn({ name: 'studentId' })
    estudiante: Relation<Estudiante>;

    @Column()
    courseId: number;

    @ManyToOne(() => Course, (course) => course.enrollments)
    @JoinColumn({ name: 'courseId' })
    course: Relation<Course>;
}
