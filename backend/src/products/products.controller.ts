import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ProductDetail,
  ProductListItem,
  ProductsService,
} from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('q') query?: string): Promise<ProductListItem[]> {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  findOne(
    @Param('slug') slug: string,
    @Query('sku') sku?: string,
  ): Promise<ProductDetail> {
    return this.productsService.findBySlug(slug, sku);
  }
}
