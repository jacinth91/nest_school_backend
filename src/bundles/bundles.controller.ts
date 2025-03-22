import { Controller, Get, Param, Query, BadRequestException, Post, Body } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { Bundle } from './entities/bundle.entity';

class SearchBundlesDto {
  usids: string[];
  type?: string = 'New';
}

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  async findAll(): Promise<Bundle[]> {
    return await this.bundlesService.findAll();
  }

  @Post('search')
  async searchBundles(@Body() searchDto: SearchBundlesDto): Promise<Bundle[]> {
    if (!searchDto.usids || !Array.isArray(searchDto.usids)) {
      throw new BadRequestException('USIDs must be provided as an array');
    }

    if (searchDto.usids.length === 0) {
      throw new BadRequestException('At least one USID must be provided');
    }

    if (searchDto.usids.length > 3) {
      throw new BadRequestException('Maximum of 3 USIDs allowed');
    }

    const validTypes = ['New', 'Existing', 'Boarding', 'Hostel'];
    if (searchDto.type && !validTypes.includes(searchDto.type)) {
      throw new BadRequestException(`Student type must be one of: ${validTypes.join(', ')}`);
    }

    return await this.bundlesService.searchBundles(searchDto.usids, searchDto.type || 'New');
  }

  @Get('student/:usid')
  async getBundlesByStudentDetails(@Param('usid') usid: string): Promise<Bundle[]> {
    return await this.bundlesService.getBundlesByStudentDetails(usid);
  }
} 