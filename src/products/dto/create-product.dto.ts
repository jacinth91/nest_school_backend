export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  quantity: number;
  isActive?: boolean;
} 