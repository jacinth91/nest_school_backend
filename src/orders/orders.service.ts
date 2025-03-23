import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
  ) {}

  async placeOrderFromCart(
    parentId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get parent's cart with items and bundles
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { parentId },
        relations: ['items', 'items.bundle']
      });

      if (!cart) {
        throw new NotFoundException(`Cart not found for parent ${parentId}`);
      }

      const cartItems = await cart.items;
      if (!cartItems || cartItems.length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      // Calculate total price from cart items
      const totalPrice = cartItems.reduce((sum, item) => 
        sum + (item.bundle.totalPrice * item.quantity), 0
      );

      // Create order
      const order = queryRunner.manager.create(Order, {
        parentId,
        totalPrice,
        status: OrderStatus.PENDING
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Transform cart items to order items
      for (const cartItem of cartItems) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          bundleId: cartItem.bundleId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.bundle.totalPrice
        });
        await queryRunner.manager.save(OrderItem, orderItem);
      }

      // Create payment
      const payment = queryRunner.manager.create(Payment, {
        orderId: savedOrder.id,
        amount: totalPrice,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING
      });
      await queryRunner.manager.save(Payment, payment);

      // Clear the cart
      await queryRunner.manager.delete(CartItem, { cartId: cart.id });

      // Get complete order with relations
      const completeOrder = await queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.bundle', 'payments']
      });

      await queryRunner.commitTransaction();
      return completeOrder;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 