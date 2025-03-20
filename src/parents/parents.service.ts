import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
      select: ['id', 'parentName', 'students', 'gender', 'campus', 'address','role']
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
    if (!parentId || !studentUsid) {
      throw new BadRequestException('Both parent ID and student USID are required');
    }

    try {
      // Check if parent exists
      const parent = await this.parentRepository.findOne({
        where: { id: parentId }
      });

      if (!parent) {
        throw new NotFoundException(`Parent with ID ${parentId} not found`);
      }

      // Check if student exists
      const student = await this.studentRepository.findOne({
        where: { usid: studentUsid }
      });

      if (!student) {
        throw new NotFoundException(`Student with USID ${studentUsid} not found`);
      }

      // Initialize students array if it doesn't exist
      if (!Array.isArray(parent.students)) {
        parent.students = [];
      }

      // Check maximum student limit
      const MAX_STUDENTS = 3;
      if (parent.students.length >= MAX_STUDENTS) {
        throw new BadRequestException(`Cannot add more students. Maximum limit of ${MAX_STUDENTS} students per parent has been reached`);
      }

      // Check if student is already linked to this parent
      if (parent.students.includes(studentUsid)) {
        throw new BadRequestException(`Student with USID ${studentUsid} is already linked to this parent`);
      }

      // Check if student is already linked to another parent
      const existingParent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${studentUsid}' = ANY(parent.students)`)
        .andWhere('parent.id != :parentId', { parentId })
        .getOne();

      if (existingParent) {
        throw new BadRequestException(`Student with USID ${studentUsid} is already linked to another parent`);
      }

      // Add student to parent
      parent.students.push(studentUsid);
      
      // Save and return updated parent
      return await this.parentRepository.save(parent);

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error while adding student to parent', {
        cause: error,
        description: error.message
      });
    }
  }

  async removeStudent(parentId: number, studentUsid: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    parent.students = parent.students.filter(usid => usid !== studentUsid);
    return await this.parentRepository.save(parent);
  }
} 