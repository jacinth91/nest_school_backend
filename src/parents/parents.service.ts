import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { Student } from '../students/entities/student.entity';
import { CreateParentDto } from './dto/create-parent.dto';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    // Find all students by their USIDs
    const students = await Promise.all(
      createParentDto.studentUsids.map(async (usid) => {
        const student = await this.studentRepository.findOne({ where: { usid } });
        if (!student) {
          throw new NotFoundException(`Student with USID ${usid} not found`);
        }
        return student;
      })
    );

    // Create new parent with the found students
    const parent = this.parentRepository.create({
      parentName: createParentDto.parentName,
      email: createParentDto.email,
      phone: createParentDto.phone,
      address: createParentDto.address,
      students: students,
    });

    return await this.parentRepository.save(parent);
  }

  async findAll(): Promise<Parent[]> {
    return await this.parentRepository.find({
      relations: ['students'],
    });
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: ['students'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async findByEmail(email: string): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { email },
      relations: ['students'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent with email ${email} not found`);
    }

    return parent;
  }

  async addStudent(parentId: number, studentUsid: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    const student = await this.studentRepository.findOne({
      where: { usid: studentUsid },
    });

    if (!student) {
      throw new NotFoundException(`Student with USID ${studentUsid} not found`);
    }

    parent.students.push(student);
    return await this.parentRepository.save(parent);
  }

  async removeStudent(parentId: number, studentUsid: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    parent.students = parent.students.filter(student => student.usid !== studentUsid);
    return await this.parentRepository.save(parent);
  }
} 