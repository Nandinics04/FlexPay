import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://127.0.0.1:27017/onefi',
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    AuthModule,
    ProductsModule,
    WishlistModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
