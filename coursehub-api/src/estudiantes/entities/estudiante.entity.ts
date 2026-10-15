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

    @Column({type: 'int'})
    age: number;

    @Column()
    career: string;

    @Column({type: 'int'})
    semester: number;

    @Column({default: true})
    isActive: boolean;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
    enrollments: Relation<Enrollment[]>;
}
