import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

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
    console.log('Searching for USID:', usid);
    const result = await this.studentRepository.findOne({
      where: { usid }
    });
    console.log('Result:', result);
    return result;
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
} 