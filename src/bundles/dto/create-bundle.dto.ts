import { IsString, IsInt, IsNotEmpty, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentType } from '../enums/student-type.enum';

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
  className: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsEnum(StudentType)
  @IsNotEmpty()
  studentType: StudentType;

  @IsInt()
  @IsNotEmpty()
  totalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBundleProductDto)
  products: CreateBundleProductDto[];
} 