import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Parent } from '../parents/entities/parent.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Check if user is authorized
    if (createOrderDto.userRole !== 'admin' && createOrderDto.userRole !== 'parent') {
      throw new ForbiddenException('Only parents and admins can create orders');
    }

    // If user is a parent, verify they are creating order for themselves
    if (createOrderDto.userRole === 'parent' && createOrderDto.userId !== createOrderDto.parentId) {
      throw new ForbiddenException('Parents can only create orders for themselves');
    }

    // Find parent
    const parent = await this.parentRepository.findOne({
      where: { id: createOrderDto.parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${createOrderDto.parentId} not found`);
    }

    // Create order
    const order = this.orderRepository.create({
      parent,
      orderNumber: `ORD${Date.now()}`,
      status: 'pending',
    });

    // Save order to get ID
    const savedOrder = await this.orderRepository.save(order);

    // Process order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (product.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        product,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      orderItems.push(orderItem);

      // Update product quantity
      product.quantity -= item.quantity;
      await this.productRepository.save(product);
    }

    // Save order items
    await this.orderItemRepository.save(orderItems);

    // Update order total
    savedOrder.totalAmount = totalAmount;
    return await this.orderRepository.save(savedOrder);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['parent', 'orderItems', 'orderItems.product'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['parent', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByParent(parentId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { parentId },
      relations: ['orderItems', 'orderItems.product'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.orderRepository.save(order);
  }
} 