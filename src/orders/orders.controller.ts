import { Controller, Get, Post, Body, Param, Put, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('admin', 'parent')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: { id: number; role: string }
  ): Promise<Order> {
    createOrderDto.userId = user.id;
    createOrderDto.userRole = user.role as 'admin' | 'parent';
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles('admin')
  async findAll(): Promise<Order[]> {
    return await this.ordersService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'parent')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: { id: number; role: string }
  ): Promise<Order> {
    const order = await this.ordersService.findOne(id);
    
    // Parents can only view their own orders
    if (user.role === 'parent' && order.parentId !== user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }
    
    return order;
  }

  @Get('parent/:parentId')
  @Roles('admin', 'parent')
  async findByParent(
    @Param('parentId', ParseIntPipe) parentId: number,
    @User() user: { id: number; role: string }
  ): Promise<Order[]> {
    // Parents can only view their own orders
    if (user.role === 'parent' && parentId !== user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }
    
    return await this.ordersService.findByParent(parentId);
  }

  @Put(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Order> {
    return await this.ordersService.updateStatus(id, status);
  }
} 