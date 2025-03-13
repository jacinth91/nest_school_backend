import { Controller, Get, Post, Body, Param, Put, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles('parent')
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully', type: Feedback })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @User() user: { id: number }
  ): Promise<Feedback> {
    createFeedbackDto.parentId = user.id;
    return await this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({ status: 200, description: 'List of all feedback', type: [Feedback] })
  async findAll(): Promise<Feedback[]> {
    return await this.feedbackService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'parent')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiResponse({ status: 200, description: 'Feedback found', type: Feedback })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: { id: number; role: string }
  ): Promise<Feedback> {
    const feedback = await this.feedbackService.findOne(id);
    
    // Parents can only view their own feedback
    if (user.role === 'parent' && feedback.parentId !== user.id) {
      throw new ForbiddenException('You can only view your own feedback');
    }
    
    return feedback;
  }

  @Get('parent/:parentId')
  @Roles('admin', 'parent')
  @ApiOperation({ summary: 'Get feedback by parent ID' })
  @ApiResponse({ status: 200, description: 'List of feedback for parent', type: [Feedback] })
  async findByParent(
    @Param('parentId', ParseIntPipe) parentId: number,
    @User() user: { id: number; role: string }
  ): Promise<Feedback[]> {
    // Parents can only view their own feedback
    if (user.role === 'parent' && parentId !== user.id) {
      throw new ForbiddenException('You can only view your own feedback');
    }
    
    return await this.feedbackService.findByParent(parentId);
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update feedback status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: Feedback })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Feedback> {
    return await this.feedbackService.updateStatus(id, status);
  }
} 