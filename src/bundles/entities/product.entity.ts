import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BundleProduct } from './bundle-product.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_name', length: 255 })
  productName: string;

  @Column({ name: 'product_price', type: 'int' })
  productPrice: number;

  @OneToMany(() => BundleProduct, (bundleProduct: BundleProduct) => bundleProduct.product)
  bundleProducts: BundleProduct[];
} 