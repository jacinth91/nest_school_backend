import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueryType } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Name of the parent submitting feedback' })
  @IsString()
  @IsNotEmpty()
  parentName: string;

  @ApiProperty({ 
    description: 'Type of query/feedback',
    enum: QueryType,
    enumName: 'QueryType'
  })
  @IsEnum(QueryType)
  @IsNotEmpty()
  queryType: QueryType;

  @ApiProperty({ description: 'Student enrollment ID' })
  @IsString()
  @IsNotEmpty()
  studentEnrollId: string;

  @ApiProperty({ description: 'Detailed description of the feedback/query' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'File attachment URL',
    required: false
  })
  @IsString()
  @IsOptional()
  fileAttachment?: string;
} 