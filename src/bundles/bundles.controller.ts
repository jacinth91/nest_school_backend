import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { Bundle } from './entities/bundle.entity';

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  async findAll(): Promise<Bundle[]> {
    return await this.bundlesService.findAll();
  }

  @Get('search/:usid')
  async searchBundles(
    @Param('usid') usid: string,
    @Query('type') type: string = 'New'
  ): Promise<Bundle[]> {
    const validTypes = ['New', 'Existing', 'Boarding' ,'Hostel'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(`Student type must be one of: ${validTypes.join(', ')}`);
    }
    return await this.bundlesService.searchBundles(usid, type);
  }

  @Get('student/:usid')
  async getBundlesByStudentDetails(@Param('usid') usid: string): Promise<Bundle[]> {
    return await this.bundlesService.getBundlesByStudentDetails(usid);
  }
} 