import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum QueryType {
  ACADEMIC = 'academic',
  ADMINISTRATIVE = 'administrative',
  FINANCIAL = 'financial',
  TECHNICAL = 'technical',
  OTHER = 'other'
}

@Entity('feedback')
export class Feedback {
  @ApiProperty({ description: 'Unique identifier of the feedback' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Name of the parent submitting feedback' })
  @Column({ name: 'parent_name' })
  parentName: string;

  @ApiProperty({ 
    description: 'Type of query/feedback',
    enum: QueryType,
    enumName: 'QueryType'
  })
  @Column({
    name: 'query_type',
    type: 'enum',
    enum: QueryType,
    default: QueryType.OTHER
  })
  queryType: QueryType;

  @ApiProperty({ description: 'Student enrollment ID' })
  @Column({ name: 'student_enroll_id' })
  studentEnrollId: string;

  @ApiProperty({ description: 'Detailed description of the feedback/query' })
  @Column('text', { name: 'description' })
  description: string;

  @ApiProperty({ description: 'File attachment URL', nullable: true })
  @Column({ name: 'file_attachment', nullable: true })
  fileAttachment: string;

  @ApiProperty({ description: 'Status of the feedback' })
  @Column({
    type: 'enum',
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 