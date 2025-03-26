import { Controller, Post, Body, UseGuards, BadRequestException, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentMethod } from './entities/payment.entity';

class PlaceOrderDto {
  parentId: number;
  paymentMethod: PaymentMethod;
}

@ApiTags('orders')
@Controller('orders')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('cart')
  //@Roles('parent')
  @ApiOperation({ summary: 'Place order from cart' })
  @ApiResponse({ status: 201, description: 'Order placed successfully', type: Order })
  async placeOrderFromCart(@Body() placeOrderDto: PlaceOrderDto): Promise<Order> {
    if (!placeOrderDto.paymentMethod) {
      throw new BadRequestException('Payment method is required');
    }

    return await this.ordersService.placeOrderFromCart(
      placeOrderDto.parentId,
      placeOrderDto.paymentMethod
    );
  }

  @Get()
  //@Roles('admin')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  @ApiResponse({ status: 404, description: 'No orders found' })
  async findAll() {
    return this.ordersService.findAll();
  }

  
  @Get('parent/:parentId')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin', 'parent')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders by parent ID' })
  @ApiResponse({ status: 200, description: 'Returns all orders for the parent' })
  @ApiResponse({ status: 404, description: 'No orders found' })
  findByParentId(@Param('parentId') parentId: string) {
    return this.ordersService.findByParentId(parentId);
  }
} 