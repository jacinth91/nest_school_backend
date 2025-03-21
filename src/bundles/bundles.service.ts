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
  private readonly validStudentTypes = ['New', 'Existing', 'Boarding'];
  private readonly genderMapping = {
    FEMALE: 'Girls',
    MALE: 'Boys'
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

  async searchBundles(usid: string, studentType: string = 'New'): Promise<Bundle[]> {
    if (!this.validStudentTypes.includes(studentType)) {
      throw new BadRequestException(`Student type must be one of: ${this.validStudentTypes.join(', ')}`);
    }

    // First find the student by USID
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

    // Get classes array from student's class
    const classesArray = student.class.split(',').map(c => c.trim());

    // Use query builder for complex search
    const bundles = await this.bundleRepository
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.name',
        'b.gender',
        'b.studentType',
        'b.applicableClasses',
        'b.totalPrice',
        'bp.id',
        'bp.quantity',
        'bp.optional',
        'p.id',
        'p.name',
        'p.unitPrice'
      ])
      .leftJoin('b.bundleProducts', 'bp')
      .leftJoin('bp.product', 'p')
      .where('b.gender = :gender', { gender: mappedGender })
      .andWhere('b.studentType = :studentType', { studentType })
      .andWhere(new Array(classesArray.length).fill('b.applicableClasses ILIKE :class')
        .map((condition, index) => `(${condition}${index})`).join(' OR '),
        classesArray.reduce((params, cls, index) => ({ 
          ...params, 
          [`class${index}`]: `%${cls}%` 
        }), {}))
      .getMany();

    if (!bundles.length) {
      throw new NotFoundException(`No bundles found for student with USID ${usid} and type ${studentType}`);
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
