import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../parents/entities/parent.entity';
import { Student } from '../students/entities/student.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    if (!loginDto.usid || !loginDto.password) {
      throw new BadRequestException('Both Student USID and password are required for login');
    }

    try {
      // Find parent with the given student USID in their students array
      const parent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${loginDto.usid}' = ANY(parent.students)`)
        .getOne();

      if (!parent) {
        throw new NotFoundException(`Parent not found`, {

          cause: new Error('Parent not found'),
          description: 'Parent not found'

        })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, parent.password);
      if (!isPasswordValid) {

        throw new NotFoundException(`Invalid password`, {

          cause: new Error('Invalid password'),
          description: 'Invalid password'

        })
      }

      // Fetch data only for the logging-in student
      const student = await this.studentRepository.findOne({
        where: { usid: loginDto.usid },
        select: ['usid', 'studentName', 'class', 'section']
      });

      if (!student) {
        throw new BadRequestException('Student not found');
      }

      // Generate JWT token
      const payload = {
        sub: loginDto.usid,
        role: parent.role,
        parentId: parent.id
      };

      const token = this.jwtService.sign(payload);

      // Return success with parent data and specific student data
      return {
        success: true,
        message: 'Login successful',
        exists: true,
        name: parent.parentName,
        student: student,
        access_token: token
      };

    } catch (error) {
      throw new InternalServerErrorException('Error during login verification', {
        cause: error,
        description: error.message
      });
    }
  }

  async parentLogin(studentUsid: string): Promise<{ exists: boolean; parentData?: any }> {
    if (!studentUsid) {
      throw new BadRequestException('Student USID is required for login');
    }

    try {
      // Find parent with the given student USID in their students array
      const parent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${studentUsid}' = ANY(parent.students)`)
        .getOne();

      if (!parent) {
        return { exists: false };
      }

      // Fetch student data for each student ID
      const studentData = await Promise.all(
        parent.students.map(async (usid) => {
          const student = await this.studentRepository.findOne({
            where: { usid }
          });
          return student;
        })
      );

      // Return success with parent data
      return {
        exists: true,
        parentData: {
          ...parent,
          studentData
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Error during login verification', {
        cause: error,
        description: error.message
      });
    }
  }
} 