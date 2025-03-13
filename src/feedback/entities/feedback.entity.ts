import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('feedback')
export class Feedback {
  @ApiProperty({ description: 'Unique identifier of the feedback' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'ID of the parent who submitted the feedback' })
  @ManyToOne(() => Parent)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;

  @ApiProperty({ description: 'ID of the parent who submitted the feedback' })
  @Column({ name: 'parent_id' })
  parentId: number;

  @ApiProperty({ description: 'Title of the feedback' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Content of the feedback' })
  @Column('text')
  content: string;

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