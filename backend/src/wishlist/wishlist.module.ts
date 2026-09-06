import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { ProductsModule } from '../products/products.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
