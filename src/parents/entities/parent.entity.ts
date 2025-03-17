import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'parent_name' })
  parentName: string;

  @Column('simple-array', { name: 'students' })
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
} 