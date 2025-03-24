import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'parent_name' })
  parentName: string;

  @Column({ name: 'phonenumber' })
  phoneNumber: string;

  @Column('text', { array: true, name: 'students', nullable: true })
  students: string[];

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ nullable: true })
  campus: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column()
  password: string;

  @Column({ default: 'parent' })
  role: string;

  studentData?: Student[];
} 