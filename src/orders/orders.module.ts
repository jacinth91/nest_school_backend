import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Bundle } from '../bundles/entities/bundle.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Payment, Bundle, Cart, CartItem])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {} 