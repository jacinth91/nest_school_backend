import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { Bundle } from './entities/bundle.entity';
import { StudentType } from './enums/student-type.enum';

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Post()
  async create(@Body() createBundleDto: CreateBundleDto): Promise<Bundle> {
    return await this.bundlesService.create(createBundleDto);
  }

  @Get()
  async findAll(): Promise<Bundle[]> {
    return await this.bundlesService.findAll();
  }

  @Get('search')
  async findByClassNameAndStudentType(
    @Query('className') className: string,
    @Query('studentType') studentType: StudentType,
  ): Promise<Bundle[]> {
    return await this.bundlesService.findByClassNameAndStudentType(className, studentType);
  }

 

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Bundle> {
    return await this.bundlesService.findOne(id);
  }

  @Get(':id/products')
  async getBundleProducts(@Param('id') id: number) {
    return await this.bundlesService.getBundleProducts(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.bundlesService.remove(id);
  }

  @Post('student/bundles')
  async getBundlesByStudentId(@Body('studentIds') studentIds: string[]): Promise<Bundle[]> {
    return await this.bundlesService.getBundlesByStudentId(studentIds);
  }
} 