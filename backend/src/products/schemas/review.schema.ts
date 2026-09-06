import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ required: true, index: true })
  productSlug: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, min: 0.5, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ productSlug: 1, createdAt: -1 });
