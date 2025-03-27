import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Patch(':id')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Update student details' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'USID already exists' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

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