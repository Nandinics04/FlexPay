import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  productSlug: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  storage: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ required: true, default: 0 })
  payableAmount: number;

  @Prop({ required: true, default: 0 })
  pointsRedeemed: number;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  tenureMonths: number;

  @Prop({ required: true })
  interestRate: number;

  @Prop({ required: true })
  monthlyAmount: number;

  @Prop({ required: true, default: 0 })
  cashbackAmount: number;

  @Prop({ required: true, default: 0 })
  cashbackRedeemed: number;

  @Prop({ required: true, default: 0 })
  creditPointsEarned: number;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: String, default: '' })
  city: string;

  @Prop({ type: String, default: '' })
  state: string;

  @Prop({ type: String, default: '' })
  pincode: string;

  @Prop({ required: true, default: 'paid' })
  status: string;

  @Prop()
  cancelledAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
