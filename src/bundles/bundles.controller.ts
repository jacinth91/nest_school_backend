import { Controller, Get, Param, Query, BadRequestException, Post, Body } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { Bundle } from './entities/bundle.entity';
import { BundleResponseDto } from './dto/bundle-response.dto';

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  async findAll(): Promise<Bundle[]> {
    return await this.bundlesService.findAll();
  }

  @Get('search/:usid')
  async searchBundles(@Param('usid') usid: string): Promise<BundleResponseDto> {
    return await this.bundlesService.searchBundles(usid);
  }

  @Get('student/:usid')
  async getBundlesByStudentDetails(@Param('usid') usid: string): Promise<BundleResponseDto> {
    return await this.bundlesService.getBundlesByStudentDetails(usid);
  }
} 