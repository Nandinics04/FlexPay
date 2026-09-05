import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class Variant {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  storage: string;

  @Prop({ required: true })
  mrp: number;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ required: true })
  imageUrl: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

@Schema({ _id: false })
export class EmiPlan {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  tenureMonths: number;

  @Prop({ required: true })
  interestRate: number;

  @Prop({ required: true, default: 0 })
  cashbackAmount: number;

  @Prop({ type: String, default: null })
  cashbackLabel: string | null;

  @Prop({ type: String, default: null })
  backingFund: string | null;
}

export const EmiPlanSchema = SchemaFactory.createForClass(EmiPlan);

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true, default: 'electronics', index: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ type: [VariantSchema], default: [] })
  variants: Variant[];

  @Prop({ type: [EmiPlanSchema], default: [] })
  emiPlans: EmiPlan[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
