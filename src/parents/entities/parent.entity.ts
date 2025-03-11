import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'parent_name' })
  parentName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @ManyToMany(() => Student)
  @JoinTable({
    name: 'parent_students',
    joinColumn: { name: 'parent_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_usid', referencedColumnName: 'usid' },
  })
  students: Student[];
} 