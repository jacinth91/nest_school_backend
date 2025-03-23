import { ApiProperty } from '@nestjs/swagger';

export class BundleProductDto {
  @ApiProperty({ description: 'Name of the product' })
  product_name: string;

  @ApiProperty({ description: 'Unit price of the product' })
  unit_price: number;

  @ApiProperty({ description: 'Quantity of the product in the bundle' })
  quantity: number;

  @ApiProperty({ description: 'Whether the product is optional' })
  optional: boolean;
}

export class BundleResponseDto {
  @ApiProperty({ description: 'Name of the bundle' })
  bundle_name: string;

  @ApiProperty({ description: 'Gender the bundle is for' })
  gender: string;

  @ApiProperty({ description: 'Classes the bundle is applicable for' })
  applicable_classes: string;

  @ApiProperty({ description: 'Class name' })
  class_name: string;

  @ApiProperty({ description: 'Total cost of the bundle' })
  bundle_total: number;

  @ApiProperty({ description: 'Products in the bundle', type: [BundleProductDto] })
  products: BundleProductDto[];
} 