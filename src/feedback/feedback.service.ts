import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, QueryType } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { PubSubService } from '../notifications/pub-sub.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly pubSubService: PubSubService,
  ) {}

  private transformToResponseDto(feedback: Feedback): FeedbackResponseDto {
    return {
      id: feedback.id,
      parent_name: feedback.parentName,
      query_type: feedback.queryType,
      student_enroll_id: feedback.studentEnrollId,
      status: feedback.status,
      created_at: feedback.createdAt,
      updated_at: feedback.updatedAt,
      details: {
        description: feedback.description,
        file_attachment: feedback.fileAttachment
      }
    };
  }

  async create(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    const feedback = this.feedbackRepository.create({
      parentName: createFeedbackDto.parentName,
      queryType: createFeedbackDto.queryType,
      studentEnrollId: createFeedbackDto.studentEnrollId,
      description: createFeedbackDto.description,
      fileAttachment: createFeedbackDto.fileAttachment,
      status: 'pending'
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Publish feedback created event
    await this.pubSubService.publish('feedback:created', {
      id: savedFeedback.id,
      parent_name: savedFeedback.parentName,
      query_type: savedFeedback.queryType,
      student_enroll_id: savedFeedback.studentEnrollId,
      description: savedFeedback.description,
      created_at: savedFeedback.createdAt,
    });

    return this.transformToResponseDto(savedFeedback);
  }

  async findAll(): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }

  async findOne(id: number): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return this.transformToResponseDto(feedback);
  }

  async updateStatus(id: number, status: string): Promise<FeedbackResponseDto> {
    const feedback = await this.findOne(id);
    const updatedFeedback = await this.feedbackRepository.save({
      ...feedback,
      status
    });

    // Publish status updated event
    await this.pubSubService.publish('feedback:status:updated', {
      id: updatedFeedback.id,
      parent_name: updatedFeedback.parentName,
      status: updatedFeedback.status,
      updated_at: updatedFeedback.updatedAt,
    });

    return this.transformToResponseDto(updatedFeedback);
  }

  async findByStudentEnrollId(studentEnrollId: string): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { studentEnrollId },
      order: { createdAt: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }

  async findByQueryType(queryType: QueryType): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { queryType },
      order: { createdAt: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }

  async findByParentName(parentName: string): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { parentName },
      order: { createdAt: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }
} 