import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BundlesService } from './bundles.service';
import { BundlesController } from './bundles.controller';
import { Bundle } from './entities/bundle.entity';
import { Product } from './entities/product.entity';
import { BundleProduct } from './entities/bundle-product.entity';
import { Student } from '../students/entities/student.entity';
import { ClassCategory } from '../class-categories/entities/class-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bundle, Product, BundleProduct, Student, ClassCategory])
  ],
  controllers: [BundlesController],
  providers: [BundlesService],
  exports: [BundlesService]
})
export class BundlesModule {} 