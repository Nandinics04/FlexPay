import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { AdminProductsController } from './admin-products.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ReviewsService } from './reviews.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Review, ReviewSchema } from './schemas/review.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, ReviewsService],
  exports: [ProductsService],
})
export class ProductsModule {}
