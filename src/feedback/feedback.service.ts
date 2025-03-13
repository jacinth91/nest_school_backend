import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PubSubService } from '../notifications/pub-sub.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly pubSubService: PubSubService,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Publish feedback created event
    await this.pubSubService.publish('feedback:created', {
      id: savedFeedback.id,
      parentId: savedFeedback.parentId,
      title: savedFeedback.title,
      content: savedFeedback.content,
      createdAt: savedFeedback.createdAt,
    });

    return savedFeedback;
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      relations: ['parent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async updateStatus(id: number, status: string): Promise<Feedback> {
    const feedback = await this.findOne(id);
    feedback.status = status;
    const updatedFeedback = await this.feedbackRepository.save(feedback);

    // Publish status updated event
    await this.pubSubService.publish('feedback:status:updated', {
      id: updatedFeedback.id,
      parentId: updatedFeedback.parentId,
      status: updatedFeedback.status,
      updatedAt: updatedFeedback.updatedAt,
    });

    return updatedFeedback;
  }

  async findByParent(parentId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { parentId },
      order: { createdAt: 'DESC' },
    });
  }
} 