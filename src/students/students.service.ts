import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>
  ) {}

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async findOne(id: number): Promise<Student> {
    return await this.studentRepository.findOne({
      where: { id }
    });
  }

  async findByUsid(usid: string): Promise<Student> {
    if (!usid) {
      throw new BadRequestException('Student USID is required');
    }

    try {
      console.log('Searching for USID:', usid);
      const student = await this.studentRepository.findOne({
        where: { usid }
      });
      console.log('Result:', student);

      if (!student) {
        throw new NotFoundException(`Student with USID ${usid} not found`);
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error while fetching student data');
    }
  }

  async findByClass(className: string): Promise<Student[]> {
    return await this.studentRepository.find({
      where: { class: className },
      order: {
        section: 'ASC',
        studentName: 'ASC'
      }
    });
  }

  async findByClassAndSection(className: string, section: string): Promise<Student[]> {
    return await this.studentRepository.find({
      where: { 
        class: className,
        section
      },
      order: {
        studentName: 'ASC'
      }
    });
  }

  async findByCampus(campus: string): Promise<Student[]> {
    return await this.studentRepository.find({
      where: { campus },
      order: {
        class: 'ASC',
        section: 'ASC',
        studentName: 'ASC'
      }
    });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({ where: { usid: id } });
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Check if USID is being updated and if it already exists
    if (updateStudentDto.usid && updateStudentDto.usid !== student.usid) {
      const existingStudent = await this.studentRepository.findOne({
        where: { usid: updateStudentDto.usid }
      });
      if (existingStudent) {
        throw new ConflictException('USID already exists');
      }
    }

    // Update student details
    Object.assign(student, updateStudentDto);
    
    // Save the updated student
    const updatedStudent = await this.studentRepository.save(student);

    return {
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    };
  }
} 