import { Controller, Post, Get, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

class AddBundleDto {
  bundleId: number;
  quantity?: number;
  parentId?: number;
}

@ApiTags('cart')
@Controller('cart')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('bundles')
  //@Roles('parent')
  @ApiOperation({ summary: 'Add bundle to cart' })
  @ApiResponse({ status: 201, description: 'Bundle added to cart successfully', type: Cart })
  async addBundleToCart(
    @Body() addBundleDto: AddBundleDto,
    
  ): Promise<Cart> {
    if (!addBundleDto.bundleId) {
      throw new BadRequestException('Bundle ID is required');
    }

    return await this.cartService.addBundleToCart(
      addBundleDto.parentId,
      addBundleDto.bundleId,
      addBundleDto.quantity
    );
  }

  @Get()
  //@Roles('parent')
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({ status: 200, description: 'Returns the current cart', type: Cart })
  async getCart(@User() user: { id: number }): Promise<Cart> {
    return await this.cartService.getCart(user.id);
  }
} 