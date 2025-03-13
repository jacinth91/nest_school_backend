export class OrderItemDto {
  productId: number;
  quantity: number;
}

export class CreateOrderDto {
  parentId: number;
  items: OrderItemDto[];
  userId: number;
  userRole: 'admin' | 'parent';
} 