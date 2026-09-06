import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type AuthProvider = 'email' | 'google' | 'both';
export type UserRole = 'user' | 'admin';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, default: null })
  passwordHash: string | null;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, default: null, index: true })
  googleId: string | null;

  @Prop({ required: true, default: 'email' })
  authProvider: AuthProvider;

  @Prop({ required: true, default: 'user' })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  wishlist: string[];

  @Prop({ type: String, default: '' })
  phone: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: String, default: '' })
  city: string;

  @Prop({ type: String, default: '' })
  state: string;

  @Prop({ type: String, default: '' })
  pincode: string;

  @Prop({ type: Number, default: null })
  latitude: number | null;

  @Prop({ type: Number, default: null })
  longitude: number | null;

  @Prop({ type: String, default: '' })
  pan: string;

  @Prop({ type: String, default: '' })
  aadhaar: string;

  @Prop({ type: Number, default: 0 })
  creditPoints: number;

  @Prop({ type: Number, default: 0 })
  cashbackBalance: number;

  @Prop({ type: String, default: null })
  avatarUrl: string | null;

  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
