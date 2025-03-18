import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudentType } from '../enums/student-type.enum';
import { BundleProduct } from './bundle-product.entity';

@Entity('bundles')
export class Bundle {
  @PrimaryGeneratedColumn({ name: 'bundle_id' })
  bundleId: number;

  @Column({ name: 'class_name', length: 255 })
  className: string;

  @Column({ length: 50 })
  gender: string;

  @Column({ 
    name: 'student_type', 
    type: 'enum',
    enum: StudentType
  })
  studentType: StudentType;

  @Column({ name: 'total_price', type: 'int' })
  totalPrice: number;

  @OneToMany(() => BundleProduct, (bundleProduct: BundleProduct) => bundleProduct.bundle)
  bundleProducts: BundleProduct[];
} 