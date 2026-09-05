import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { Product, ProductDocument } from './products/schemas/product.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<ProductDocument>>(
    getModelToken(Product.name),
  );
  const snapshotPath = join(process.cwd(), 'seed', 'products.json');
  const products = JSON.parse(readFileSync(snapshotPath, 'utf8')) as unknown[];

  await productModel.deleteMany({});
  await productModel.insertMany(products);
  console.log(`Inserted ${products.length} products into MongoDB from ${snapshotPath}`);
  await app.close();
}

void bootstrap();
