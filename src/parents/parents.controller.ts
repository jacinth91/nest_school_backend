import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Parent } from './entities/parent.entity';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  async create(@Body() createParentDto: CreateParentDto): Promise<Parent> {
    return await this.parentsService.create(createParentDto);
  }

  @Get()
  async findAll(): Promise<Parent[]> {
    return await this.parentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Parent> {
    return await this.parentsService.findOne(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Parent> {
    return await this.parentsService.findByEmail(email);
  }

  @Put(':id/add-student/:usid')
  async addStudent(
    @Param('id') id: number,
    @Param('usid') usid: string,
  ): Promise<Parent> {
    return await this.parentsService.addStudent(id, usid);
  }

  @Delete(':id/remove-student/:usid')
  async removeStudent(
    @Param('id') id: number,
    @Param('usid') usid: string,
  ): Promise<Parent> {
    return await this.parentsService.removeStudent(id, usid);
  }
} 