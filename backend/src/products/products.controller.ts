import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ProductDetail,
  ProductListItem,
  ProductsService,
} from './products.service';
import { ReviewsService } from './reviews.service';

type AuthedRequest = Request & { user: PublicUser };

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  findAll(@Query('q') query?: string): Promise<ProductListItem[]> {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Req() request: AuthedRequest,
    @Param('slug') slug: string,
    @Query('sku') sku?: string,
  ): Promise<ProductDetail & Awaited<ReturnType<ReviewsService['productReviewData']>>> {
    const product = await this.productsService.findBySlug(slug, sku);
    const reviews = await this.reviewsService.productReviewData(
      slug,
      request.user.id,
    );
    return { ...product, ...reviews };
  }

  @Post(':slug/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @Req() request: AuthedRequest,
    @Param('slug') slug: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      request.user.id,
      request.user.name,
      slug,
      dto,
    );
  }

  @Patch(':slug/reviews/:id')
  @UseGuards(JwtAuthGuard)
  updateReview(
    @Req() request: AuthedRequest,
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.update(request.user.id, slug, id, dto);
  }
}
