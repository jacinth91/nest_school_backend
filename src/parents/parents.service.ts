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
    const students = await Promise.all(
      createParentDto.studentUsids.map(async (usid) => {
        const student = await this.studentRepository.findOne({ where: { usid } });
        if (!student) {
          throw new NotFoundException(`Student with USID ${usid} not found`);
        }
        return student;
      })
    );

    const parent = this.parentRepository.create({
      parentName: createParentDto.parentName,
      students: createParentDto.studentUsids,
      gender: createParentDto.gender,
      campus: createParentDto.campus,
      address: createParentDto.address,
      password: createParentDto.password,
      role: 'parent'
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

  async findByStudentUsid(studentUsid: string): Promise<Parent> {
    const parent = await this.parentRepository
      .createQueryBuilder('parent')
      .where(`'${studentUsid}' = ANY(parent.students)`)
      .getOne();

    if (!parent) {
      throw new NotFoundException(`Parent with student USID ${studentUsid} not found`);
    }

    return parent;
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

  async getParentById(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
      select: ['id', 'parentName', 'role', 'gender', 'campus', 'address']
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }
} 