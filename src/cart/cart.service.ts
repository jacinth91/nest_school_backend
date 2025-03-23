import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Bundle } from '../bundles/entities/bundle.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    private readonly dataSource: DataSource,
  ) {}

  async addBundleToCart(parentId: number, bundleId: number, quantity: number = 1): Promise<Cart> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if bundle exists first
      const bundle = await queryRunner.manager.findOne(Bundle, {
        where: { id: bundleId },
       
      });
      console.log(bundle,'^^^');
      if (!bundle) {
        throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
      }

      // Get or create cart
      let cart = await queryRunner.manager.findOne(Cart, {
        where: { parentId },
        relations: ['items', 'items.bundle'],
      });

      if (!cart) {
        // Create new cart
        cart = queryRunner.manager.create(Cart, { parentId: parentId});
        cart = await queryRunner.manager.save(Cart, cart);

        // Create initial cart item
        const cartItem = queryRunner.manager.create(CartItem, {
          cartId: cart.id,
          bundleId,
          quantity,
          price: bundle.totalPrice,
          bundle: bundle
        });
        await queryRunner.manager.save(CartItem, cartItem);
      } else {
        // Check if bundle is already in cart
        const items = await cart.items;
        let cartItem = items?.find(item => item.bundleId === bundleId);

        if (cartItem) {
          // Update quantity if bundle already exists
          cartItem.quantity += quantity;
          await queryRunner.manager.save(CartItem, cartItem);
        } else {
          // Create new cart item
          cartItem = queryRunner.manager.create(CartItem, {
            cartId: cart.id,
            bundleId,
            quantity,
            price: bundle.totalPrice,
            bundle: bundle
          });
          await queryRunner.manager.save(CartItem, cartItem);
        }
      }

      // Get final cart state within transaction
      const updatedCart = await queryRunner.manager.findOne(Cart, {
        where: { id: cart.id },
        relations: ['items', 'items.bundle'],
      });

      // Commit transaction
      await queryRunner.commitTransaction();
      return updatedCart;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCart(parentId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { parentId },
      relations: ['items', 'items.bundle'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for parent ${parentId}`);
    }

    return cart;
  }
} 