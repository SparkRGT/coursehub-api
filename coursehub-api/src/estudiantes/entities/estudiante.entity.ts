import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Enrollment } from '../../matrículas-module/entities/matricula.entity.js';

@Entity()
export class Estudiante {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    age: number;

    @Column()
    career: string;

    @Column()
    semester: number;

    @Column()
    isActive: boolean;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.estudiante)
    enrollments: Relation<Enrollment[]>;
}
