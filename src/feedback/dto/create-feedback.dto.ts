import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'ID of the parent submitting feedback' })
  @IsNumber()
  @IsNotEmpty()
  parentId: number;

  @ApiProperty({ description: 'Title of the feedback' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Content of the feedback' })
  @IsString()
  @IsNotEmpty()
  content: string;
} 