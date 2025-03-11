import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'usid',
    nullable: false,
    unique: true
  })
  usid: string;

  @Column({ name: 'student_name' })
  studentName: string;

  @Column({ name: 'father_name' })
  fatherName: string;

  @Column()
  gender: string;

  @Column()
  campus: string;

  @Column({ name: 'class' })
  class: string;

  @Column()
  section: string;

  @Column()
  address: string;

  @Column()
  house: string;
} 