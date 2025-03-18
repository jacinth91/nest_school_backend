import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Bundle } from './bundle.entity';
import { Product } from './product.entity';

@Entity('bundle_products')
export class BundleProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Bundle)
  @JoinColumn({ name: 'bundle_id' })
  bundle: Bundle;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
} 