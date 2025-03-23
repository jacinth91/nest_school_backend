import { ApiProperty } from '@nestjs/swagger';
import { QueryType } from '../entities/feedback.entity';

export class FeedbackResponseDto {
  @ApiProperty({ description: 'Unique identifier of the feedback' })
  id: number;

  @ApiProperty({ description: 'Name of the parent who submitted the feedback' })
  parent_name: string;

  @ApiProperty({ description: 'Type of query/feedback' })
  query_type: QueryType;

  @ApiProperty({ description: 'Student enrollment ID' })
  student_enroll_id: string;

  @ApiProperty({ description: 'Status of the feedback' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Feedback details' })
  details: {
    description: string;
    file_attachment?: string;
  };
} 