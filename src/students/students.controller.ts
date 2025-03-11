import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(): Promise<Student[]> {
    return await this.studentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Student> {
    return await this.studentsService.findOne(id);
  }

  @Get('usid/:usid')
  async findByUsid(@Param('usid') usid: string): Promise<Student> {
    return await this.studentsService.findByUsid(usid);
  }

  @Get('class/:className')
  async findByClass(@Param('className') className: string): Promise<Student[]> {
    return await this.studentsService.findByClass(className);
  }

  @Get('class/:className/section/:section')
  async findByClassAndSection(
    @Param('className') className: string,
    @Param('section') section: string
  ): Promise<Student[]> {
    return await this.studentsService.findByClassAndSection(className, section);
  }

  @Get('campus/:campus')
  async findByCampus(@Param('campus') campus: string): Promise<Student[]> {
    return await this.studentsService.findByCampus(campus);
  }
} 