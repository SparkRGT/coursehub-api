import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Enrollment } from '../../matrículas-module/entities/matricula.entity.js';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  level: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Relation<Enrollment[]>;
}
