import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, QueryType } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
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
      parent_id: feedback.parent_id,
      parent_name: feedback.parent_name,
      query_type: feedback.query_type,
      student_usid: feedback.student_usid,
      status: feedback.status,
      created_at: feedback.created_at,
      updated_at: feedback.updated_at,
      details: {
        description: feedback.description,
        file_path: feedback.file_path,
        file_type: feedback.file_type
      }
    };
  }

  async create(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    const feedback = this.feedbackRepository.create({
      parent_id: createFeedbackDto.parent_id,
      parent_name: createFeedbackDto.parent_name,
      query_type: createFeedbackDto.query_type,
      student_usid: createFeedbackDto.student_usid,
      description: createFeedbackDto.description,
      file_path: createFeedbackDto.file_path,
      file_type: createFeedbackDto.file_type,
      status: 'pending'
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Publish feedback created event
    await this.pubSubService.publish('feedback:created', {
      id: savedFeedback.id,
      parent_name: savedFeedback.parent_name,
      query_type: savedFeedback.query_type,
      student_usid: savedFeedback.student_usid,
      description: savedFeedback.description,
      created_at: savedFeedback.created_at,
    });

    return this.transformToResponseDto(savedFeedback);
  }

  async findAll(): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      order: { created_at: 'DESC' },
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
      parent_name: updatedFeedback.parent_name,
      status: updatedFeedback.status,
      updated_at: updatedFeedback.updated_at,
    });

    return this.transformToResponseDto(updatedFeedback);
  }

  async findByStudentEnrollId(studentEnrollId: string): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { student_usid: studentEnrollId },
      order: { created_at: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }

  async findByQueryType(queryType: QueryType): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { query_type: queryType },
      order: { created_at: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }

  async findByParentName(parentName: string): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { parent_name: parentName },
      order: { created_at: 'DESC' },
    });
    return feedbacks.map(feedback => this.transformToResponseDto(feedback));
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // if (feedback.parent_name !== parentName) {
    //   throw new ForbiddenException('You can only update your own feedback');
    // }

    const updatedFeedback = await this.feedbackRepository.save({
      ...feedback,
      ...updateFeedbackDto,
    });

    await this.pubSubService.publish('feedback:updated', {
      id: updatedFeedback.id,
      parent_name: updatedFeedback.parent_name,
      query_type: updatedFeedback.query_type,
      student_usid: updatedFeedback.student_usid,
      updated_at: updatedFeedback.updated_at,
    });

    return this.transformToResponseDto(updatedFeedback);
  }
} 