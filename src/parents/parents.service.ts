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
    const parent = this.parentRepository.create(createParentDto);
    return await this.parentRepository.save(parent);
  }

  async findAll(): Promise<Parent[]> {
    return await this.parentRepository.find();
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: ['students']
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async update(id: number, updateParentDto: CreateParentDto): Promise<Parent> {
    const parent = await this.findOne(id);
    Object.assign(parent, updateParentDto);
    return await this.parentRepository.save(parent);
  }

  async remove(id: number): Promise<void> {
    const parent = await this.findOne(id);
    await this.parentRepository.remove(parent);
  }

  async findByStudentUsid(studentUsid: string): Promise<Parent> {
    const parent = await this.parentRepository
      .createQueryBuilder('parent')
      .where(`'${studentUsid}' = ANY(parent.students)`)
      .getOne();

    if (!parent) {
      throw new NotFoundException(`Parent with student USID ${studentUsid} not found`);
    }

    // Fetch student data for each student ID
    const studentData = await Promise.all(
      parent.students.map(async (usid) => {
        const student = await this.studentRepository.findOne({ where: { usid } });
        return student;
      })
    );

    // Add student data to parent object
    return {
      ...parent,
      studentData
    };
  }

  async addStudent(parentId: number, studentUsid: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    parent.students.push(studentUsid);
    return await this.parentRepository.save(parent);
  }

  async removeStudent(parentId: number, studentUsid: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    parent.students = parent.students.filter(usid => usid !== studentUsid);
    return await this.parentRepository.save(parent);
  }
} 