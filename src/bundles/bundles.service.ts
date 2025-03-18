import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Bundle } from './entities/bundle.entity';
import { Product } from './entities/product.entity';
import { BundleProduct } from './entities/bundle-product.entity';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { StudentType } from './enums/student-type.enum';
import { Student } from '../students/entities/student.entity';
import { ClassCategory } from '../class-categories/entities/class-category.entity';

@Injectable()
export class BundlesService {
  constructor(
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BundleProduct)
    private readonly bundleProductRepository: Repository<BundleProduct>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ClassCategory)
    private readonly classCategoryRepository: Repository<ClassCategory>,
  ) {}

  async create(createBundleDto: CreateBundleDto): Promise<Bundle> {
    const bundle = this.bundleRepository.create({
      className: createBundleDto.className,
      gender: createBundleDto.gender,
      studentType: createBundleDto.studentType,
      totalPrice: createBundleDto.totalPrice,
    });

    const savedBundle = await this.bundleRepository.save(bundle);

    // Create bundle products
    // const bundleProducts = createBundleDto.products.map(product => 
    //   this.bundleProductRepository.create({
    //     bundleId: savedBundle.bundleId,
    //     productId: product.productId,
    //     quantity: product.quantity,
    //   })
    // );

    //await this.bundleProductRepository.save(bundleProducts);

    return this.findOne(savedBundle.bundleId);
  }

  async findAll(): Promise<Bundle[]> {
    return await this.bundleRepository.find({
      relations: ['bundleProducts'],
    });
  }

  async findOne(bundleId: number): Promise<Bundle> {
    const bundle = await this.bundleRepository.findOne({
      where: { bundleId },
      relations: ['bundleProducts', 'bundleProducts.product'],
    });

    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
    }

    return bundle;
  }

  async findByClassNameAndStudentType(className: string, studentType: StudentType): Promise<Bundle[]> {
    return await this.bundleRepository.find({
      where: {
        className,
        studentType,
      },
      relations: ['bundleProducts', 'bundleProducts.product'],
    });
  }

  async getBundleProducts(bundleId: number) {
    const bundle = await this.bundleRepository.findOne({
      where: { bundleId },
      relations: ['bundleProducts']
    });
    
    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
    }

    const productIds = bundle.bundleProducts.map(bp => bp.product.productId);
    const products = await this.productRepository.findByIds(productIds);
    
    return bundle.bundleProducts.map(bp => {
      const product = products.find(p => p.productId === bp.product.productId);
      return {
        productId: bp.product.productId,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: bp.quantity,
        totalCost: product.productPrice * bp.quantity,
        bundleTotalPrice: bundle.totalPrice,
      };
    });
  }

  async update(bundleId: number, updateBundleDto: CreateBundleDto): Promise<Bundle> {
    const bundle = await this.findOne(bundleId);
    Object.assign(bundle, updateBundleDto);
    return await this.bundleRepository.save(bundle);
  }

  async remove(bundleId: number): Promise<void> {
    const bundle = await this.findOne(bundleId);
    await this.bundleRepository.remove(bundle);
  }

  async getBundlesByStudentId(studentIds: string[]): Promise<Bundle[]> {
    const students = await this.studentRepository.find({
      where: { usid: In(studentIds) }
    });

    if (!students.length) {
      throw new NotFoundException(`No students found with the provided IDs`);
    }

    // Get all class categories
    const classCategories = await this.classCategoryRepository.find();
    
    // Helper function to convert Roman to number
    const romanToNumber = (roman: string): number => {
      const romanNumerals: { [key: string]: number } = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
        'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
      };
      return romanNumerals[roman] || 0;
    };

    // Helper function to check if string is Roman numeral
    const isRomanNumeral = (str: string): boolean => {
      return /^[IVX]+$/.test(str);
    };

    // Map student classes to their categories with detailed logging
    const studentCategories = students.map(student => {
      const studentClass = student.class;
      const category = classCategories.find(cat => {
        let isInRange = false;
        
        if (isRomanNumeral(studentClass)) {
          // Compare Roman numerals
          const studentClassNum = romanToNumber(studentClass);
          const startNum = romanToNumber(cat.classStartRoman);
          const endNum = romanToNumber(cat.classEndRoman);
          
          isInRange = studentClassNum >= startNum && studentClassNum <= endNum;
          
          console.log(`Student ${student.usid} in Roman class ${studentClass}:`);
          console.log(`Checking Roman range ${cat.classStartRoman} to ${cat.classEndRoman} (${cat.categoryName})`);
          console.log(`Converted numbers: ${studentClassNum} >= ${startNum} && ${studentClassNum} <= ${endNum}`);
        } else {
          // Compare numeric values
          const studentClassNum = parseInt(studentClass);
          isInRange = studentClassNum >= cat.classStart && studentClassNum <= cat.classEnd;
          
          console.log(`Student ${student.usid} in numeric class ${studentClass}:`);
          console.log(`Checking numeric range ${cat.classStart} to ${cat.classEnd} (${cat.categoryName})`);
        }
        
        console.log(`Is in range: ${isInRange}`);
        return isInRange;
      });

      if (!category) {
        console.log(`Warning: No category found for student ${student.usid} in class ${studentClass}`);
      }

      return {
        studentId: student.usid,
        categoryName: category?.categoryName,
        gender: student.gender,
        studentClass,
        categoryRange: category ? 
          (isRomanNumeral(studentClass) ? 
            `${category.classStartRoman} to ${category.classEndRoman}` : 
            `${category.classStart} to ${category.classEnd}`) : 
          'No range found'
      };
    });

    // Get unique category-gender combinations
    const uniqueCategoryGender = [...new Set(
      studentCategories.map(sc => `${sc.categoryName}-${sc.gender}`)
    )];

    // Create where conditions for bundles
    const bundleConditions = uniqueCategoryGender.map(cg => {
      const [className, gender] = cg.split('-');
      return { className, gender };
    });

    console.log('Final bundle conditions:', bundleConditions);

    return await this.bundleRepository.find({
      where: bundleConditions,
      relations: ['bundleProducts', 'bundleProducts.product'],
    });
  }
} 