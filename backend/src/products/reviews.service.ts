import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from './products.service';
import { Review, ReviewDocument } from './schemas/review.schema';

export type ReviewResponse = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  mine: boolean;
};

@Injectable()
export class ReviewsService implements OnModuleInit {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async onModuleInit() {
    try {
      await this.reviewModel.collection.dropIndex('productSlug_1_userId_1');
    } catch {
      // Index may already be gone after allowing multiple reviews.
    }
  }

  async productReviewData(slug: string, userId?: string) {
    const reviews = await this.reviewModel
      .find({ productSlug: slug })
      .sort({ createdAt: -1 })
      .lean();
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount) *
              10,
          ) / 10;
    const purchased = userId
      ? Boolean(
          await this.orderModel.exists({
            userId,
            productSlug: slug,
            status: 'paid',
          }),
        )
      : false;
    const mine = userId
      ? reviews.find((item) => item.userId === userId)
      : undefined;

    return {
      avgRating,
      reviewCount,
      canReview: purchased,
      reviews: reviews.map((item) => this.toResponse(item, userId)),
      myReview: mine
        ? {
            id: String(mine._id),
            rating: mine.rating,
            comment: mine.comment,
          }
        : null,
    };
  }

  async create(
    userId: string,
    userName: string,
    slug: string,
    dto: CreateReviewDto,
  ) {
    await this.assertCanReview(userId, slug);
    const review = await this.reviewModel.create({
      productSlug: slug,
      userId,
      userName,
      rating: dto.rating,
      comment: dto.comment.trim(),
    });
    this.productsService.invalidateListCache();
    return this.toResponse(review, userId);
  }

  async update(
    userId: string,
    slug: string,
    reviewId: string,
    dto: CreateReviewDto,
  ) {
    const review = await this.reviewModel.findOne({
      _id: reviewId,
      productSlug: slug,
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own review');
    }
    review.rating = dto.rating;
    review.comment = dto.comment.trim();
    await review.save();
    this.productsService.invalidateListCache();
    return this.toResponse(review, userId);
  }

  private async assertCanReview(userId: string, slug: string) {
    if (!(await this.productsService.existsBySlug(slug))) {
      throw new NotFoundException(`Product '${slug}' was not found`);
    }
    const purchased = await this.orderModel.exists({
      userId,
      productSlug: slug,
      status: 'paid',
    });
    if (!purchased) {
      throw new BadRequestException(
        'Buy this product before leaving a rating or comment',
      );
    }
  }

  private toResponse(
    review: {
      _id?: unknown;
      userId: string;
      userName: string;
      rating: number;
      comment: string;
      createdAt?: Date;
    },
    userId?: string,
  ): ReviewResponse {
    return {
      id: String(review._id),
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt ?? new Date(),
      mine: Boolean(userId && review.userId === userId),
    };
  }
}
