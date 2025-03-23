import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({name: 'order_id'})
  orderId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method'
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status'
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true ,name: 'transaction_id'})
  transactionId: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;
} 