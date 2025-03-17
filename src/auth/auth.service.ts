import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  ) {}

  async login(loginDto: LoginDto) {
    // First check if USID exists in student database and get parent name
    const student = await this.studentRepository.findOne({
      where: { usid: loginDto.usid },
      select: ['usid', 'studentName', 'class', 'section', 'fatherName']
    });

    if (!student) {
      throw new UnauthorizedException('Invalid student USID');
    }

    // Check if parent account exists with matching parent name
    const parent = await this.parentRepository.findOne({
      where: { parentName: student.fatherName },
      select: ['id', 'parentName', 'password', 'role', 'gender', 'campus', 'address', 'students']
    });

    if (!parent) {
      throw new UnauthorizedException('Parent account not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, parent.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: parent.id, role: parent.role };
    const token = this.jwtService.sign(payload);

    return {
      status: 'success',
      access_token: token,
      parent: {
        id: parent.id,
        name: parent.parentName,
        role: parent.role || 'parent',
        gender: parent.gender,
        campus: parent.campus,
        address: parent.address,
        students: parent.students
      }
    };
  }
} 