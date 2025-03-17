import { Controller, Get, Post, Body, Param, Delete, Put, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Parent } from './entities/parent.entity';
import { JwtService } from '@nestjs/jwt';

@Controller('parents')
export class ParentsController {
  constructor(
    private readonly parentsService: ParentsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('me')
  async getParentFromToken(@Req() request: Request): Promise<Parent> {
    const token = request.cookies['jwt']; // Get token from cookies
    console.log(token,'front end call *********');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token) as { sub: number };
      return await this.parentsService.getParentById(decoded.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post()
  async create(@Body() createParentDto: CreateParentDto): Promise<Parent> {
    return await this.parentsService.create(createParentDto);
  }

  @Get()
  async findAll(): Promise<Parent[]> {
    return await this.parentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Parent> {
    return await this.parentsService.findOne(id);
  }

  @Get('student/:usid')
  async findByStudentUsid(@Param('usid') usid: string): Promise<Parent> {
    return await this.parentsService.findByStudentUsid(usid);
  }

  @Put(':id/add-student/:usid')
  async addStudent(
    @Param('id') id: number,
    @Param('usid') usid: string,
  ): Promise<Parent> {
    return await this.parentsService.addStudent(id, usid);
  }

  @Delete(':id/remove-student/:usid')
  async removeStudent(
    @Param('id') id: number,
    @Param('usid') usid: string,
  ): Promise<Parent> {
    return await this.parentsService.removeStudent(id, usid);
  }
} 