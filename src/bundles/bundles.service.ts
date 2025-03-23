import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Equal, ILike } from 'typeorm';
import { Bundle, StudentType, Gender } from './entities/bundle.entity';
import { Product } from './entities/product.entity';
import { BundleProduct } from './entities/bundle-product.entity';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { Student } from '../students/entities/student.entity';
import { ClassCategory } from '../class-categories/entities/class-category.entity';
import { StudentType as StudentTypeEnum } from './enums/student-type.enum';

@Injectable()
export class BundlesService {
  private readonly validStudentTypes = ['New', 'Existing', 'Boarding', 'Hostel'];
  private readonly genderMapping = {
    FEMALE: 'Girls',
    MALE: 'Boys'
  };

  // Class mapping for display
  private readonly classMapping = {
    'PP2': 'PP2',
    'I': '1st',
    'II': '2nd',
    'III': '3rd',
    'IV': '4th',
    'V': '5th',
    'VI': '6th',
    'VII': '7th',
    'VIII': '8th',
    'IX': '9th',
    'X': '10th',
    'XI': '11th',
    'XII': '12th'
  };

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

  async findAll(): Promise<Bundle[]> {
    return await this.bundleRepository.find({
      relations: ['bundleProducts', 'bundleProducts.product']
    });
  }

  async searchBundles(usid: string): Promise<any[]> {
    let studentType: string = 'New';
    if (!this.validStudentTypes.includes(studentType)) {
      throw new BadRequestException(`Student type must be one of: ${this.validStudentTypes.join(', ')}`);
    }

    // Find student by USID
    const student = await this.studentRepository.findOne({
      where: { usid }
    });

    if (!student) {
      throw new NotFoundException(`Student with USID ${usid} not found`);
    }

    // Get gender mapping
    const mappedGender = this.genderMapping[student.gender.toUpperCase()];
    if (!mappedGender) {
      throw new BadRequestException(`Invalid student gender: ${student.gender}`);
    }

    // Get student's class (take first class if multiple are present)
    const studentClass = student.class.split(',')[0].trim();
    const displayClassName = this.classMapping[studentClass] || studentClass;

    // Create regex pattern for exact class matching
    const classPattern = `(^|,\\s*)${studentClass}($|,)`;

    // Use query builder for search with CASE statement
    const bundles = await this.bundleRepository
      .createQueryBuilder('b')
      .select([
        'b.name as bundle_name',
        'b.gender as gender',
        'b.applicableClasses as applicable_classes',
        `CASE 
          WHEN b.applicableClasses ~* :classPattern THEN '${displayClassName}'
          ELSE 'Unknown'
        END as class_name`,
        'p.name as product_name',
        'p.unitPrice as unit_price',
        'bp.quantity',
        'bp.optional',
        'b.totalPrice as bundle_total'
      ])
      .innerJoin('b.bundleProducts', 'bp')
      .innerJoin('bp.product', 'p')
      .where('b.gender = :gender', { gender: mappedGender })
      .andWhere('b.studentType = :studentType', { studentType })
      .andWhere('b.applicableClasses ~* :classPattern', { classPattern })
      .getRawMany();

    if (!bundles.length) {
      throw new NotFoundException(`No bundles found for student with USID ${usid} and class ${displayClassName}`);
    }

    return bundles;
  }

  async getBundlesByStudentDetails(usid: string): Promise<Bundle[]> {
    // Find student by USID
    const student = await this.studentRepository.findOne({
      where: { usid }
    });

    if (!student) {
      throw new NotFoundException(`Student with USID ${usid} not found`);
    }

    const mappedGender = this.genderMapping[student.gender.toUpperCase()];
    if (!mappedGender) {
      throw new BadRequestException(`Invalid student gender: ${student.gender}`);
    }

    // Find matching bundles based on student's class and gender
    const bundles = await this.bundleRepository.find({
      where: {
        applicableClasses: student.class,
        gender: mappedGender
      },
      relations: ['bundleProducts', 'bundleProducts.product']
    });

    if (!bundles.length) {
      throw new NotFoundException(`No bundles found for student with USID ${usid}`);
    }

    return bundles;
  }
}
