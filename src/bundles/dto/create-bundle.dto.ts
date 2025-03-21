import { IsString, IsInt, IsNotEmpty, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentType } from '../enums/student-type.enum';
import { Gender } from '../entities/bundle.entity';

export class CreateBundleProductDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}

export class CreateBundleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  applicableClasses: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsEnum(StudentType)
  @IsNotEmpty()
  studentType: StudentType;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBundleProductDto)
  products: CreateBundleProductDto[];
} 