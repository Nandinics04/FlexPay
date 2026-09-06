import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { discountPercent } from '../common/discount.util';
import { calculateMonthlyAmount } from '../common/emi.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  EmiPlan,
  Product,
  ProductDocument,
  ProductMedia,
  Variant,
} from './schemas/product.schema';
import { Review, ReviewDocument } from './schemas/review.schema';

export type ProductListItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  startingPrice: number;
  mrp: number;
  imageUrl: string;
  discountPercent: number;
  avgRating: number;
  reviewCount: number;
};

export type EmiPlanResponse = EmiPlan & { monthlyAmount: number };

export type ProductDetail = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  media: ProductMedia[];
  variants: Variant[];
  emiPlans: EmiPlanResponse[];
};

const LIST_CACHE_MS = 60_000;
const LIST_FIELDS =
  'slug name brand category variants.sellingPrice variants.mrp variants.imageUrl';

@Injectable()
export class ProductsService {
  private listCache: { expiresAt: number; items: ProductListItem[] } | null =
    null;

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async findAll(query?: string): Promise<ProductListItem[]> {
    const term = query?.trim();
    if (!term && this.listCache && this.listCache.expiresAt > Date.now()) {
      return this.listCache.items;
    }

    const products = await this.productModel
      .find(this.buildSearchFilter(term), LIST_FIELDS)
      .sort({ name: 1 })
      .lean();

    const items = await this.withRatings(
      products.map((product) => this.toListItem(product)),
    );

    if (!term) {
      this.listCache = {
        expiresAt: Date.now() + LIST_CACHE_MS,
        items,
      };
    }

    return items;
  }

  async findBySlug(slug: string, sku?: string): Promise<ProductDetail> {
    const product = await this.productModel.findOne({ slug }).lean().exec();
    if (!product) {
      throw new NotFoundException(`Product '${slug}' was not found`);
    }

    const selectedVariant =
      product.variants.find((variant) => variant.sku === sku) ??
      product.variants[0];

    return this.toDetail(product, selectedVariant);
  }

  async findBySlugs(slugs: string[]): Promise<ProductListItem[]> {
    if (slugs.length === 0) {
      return [];
    }

    const products = await this.productModel
      .find({ slug: { $in: slugs } }, LIST_FIELDS)
      .lean();
    const items = new Map(
      products.map((product) => [product.slug, this.toListItem(product)]),
    );

    return this.withRatings(
      slugs
        .map((slug) => items.get(slug))
        .filter((item): item is ProductListItem => Boolean(item))
        .reverse(),
    );
  }

  async existsBySlug(slug: string) {
    return Boolean(await this.productModel.exists({ slug }));
  }

  async create(dto: CreateProductDto): Promise<ProductDetail> {
    const slug = this.slugify(dto.slug || dto.name);
    if (!slug) {
      throw new ConflictException('A valid product slug is required');
    }
    if (await this.existsBySlug(slug)) {
      throw new ConflictException(`Product '${slug}' already exists`);
    }

    const product = await this.productModel.create({
      slug,
      name: dto.name.trim(),
      brand: dto.brand.trim(),
      category: dto.category.trim(),
      description: dto.description.trim(),
      highlights: this.normalizeHighlights(dto.highlights),
      media: this.normalizeMedia(dto.media),
      variants: dto.variants,
      emiPlans: this.normalizeEmiPlans(dto.emiPlans),
    });

    this.clearListCache();
    return this.toDetail(product.toObject());
  }

  async update(slug: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const product = await this.productModel.findOne({ slug });
    if (!product) {
      throw new NotFoundException(`Product '${slug}' was not found`);
    }

    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.brand !== undefined) product.brand = dto.brand.trim();
    if (dto.category !== undefined) product.category = dto.category.trim();
    if (dto.description !== undefined) product.description = dto.description.trim();
    if (dto.highlights !== undefined) {
      product.highlights = this.normalizeHighlights(dto.highlights);
    }
    if (dto.media !== undefined) {
      product.media = this.normalizeMedia(dto.media);
    }
    if (dto.variants !== undefined) product.variants = dto.variants;
    if (dto.emiPlans !== undefined) {
      product.emiPlans = this.normalizeEmiPlans(dto.emiPlans);
    }

    await product.save();
    this.clearListCache();
    return this.toDetail(product.toObject());
  }

  async remove(slug: string) {
    const result = await this.productModel.deleteOne({ slug });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product '${slug}' was not found`);
    }
    this.clearListCache();
    return { ok: true };
  }

  private toListItem(product: {
    slug: string;
    name: string;
    brand: string;
    category: string;
    variants: Variant[];
  }): ProductListItem {
    const cheapest = product.variants.reduce(
      (lowest, variant) =>
        !lowest || variant.sellingPrice < lowest.sellingPrice
          ? variant
          : lowest,
      product.variants[0],
    );
    return {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      startingPrice: cheapest?.sellingPrice ?? 0,
      mrp: cheapest?.mrp ?? 0,
      imageUrl: cheapest?.imageUrl ?? '',
      discountPercent: discountPercent(
        cheapest?.mrp ?? 0,
        cheapest?.sellingPrice ?? 0,
      ),
      avgRating: 0,
      reviewCount: 0,
    };
  }

  invalidateListCache() {
    this.listCache = null;
  }

  private async withRatings(
    items: ProductListItem[],
  ): Promise<ProductListItem[]> {
    if (items.length === 0) {
      return items;
    }

    const stats = await this.reviewModel.aggregate<{
      _id: string;
      avgRating: number;
      reviewCount: number;
    }>([
      { $match: { productSlug: { $in: items.map((item) => item.slug) } } },
      {
        $group: {
          _id: '$productSlug',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    const bySlug = new Map(stats.map((item) => [item._id, item]));

    return items.map((item) => {
      const stat = bySlug.get(item.slug);
      return {
        ...item,
        avgRating: stat ? Math.round(stat.avgRating * 10) / 10 : 0,
        reviewCount: stat?.reviewCount ?? 0,
      };
    });
  }

  private toDetail(
    product: {
      slug: string;
      name: string;
      brand: string;
      category: string;
      description: string;
      highlights: string[];
      media?: ProductMedia[];
      variants: Variant[];
      emiPlans: EmiPlan[];
    },
    selectedVariant?: Variant,
  ): ProductDetail {
    const variant = selectedVariant ?? product.variants[0];
    return {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      highlights: product.highlights,
      media: product.media ?? [],
      variants: product.variants,
      emiPlans: product.emiPlans.map((plan) => ({
        ...plan,
        monthlyAmount: calculateMonthlyAmount(
          variant?.sellingPrice ?? 0,
          plan.interestRate,
          plan.tenureMonths,
        ),
      })),
    };
  }

  private normalizeHighlights(highlights: string[]) {
    return highlights.map((item) => item.trim()).filter(Boolean);
  }

  private normalizeMedia(media?: CreateProductDto['media']): ProductMedia[] {
    return (media ?? [])
      .map((item) => {
        const url = item.url.trim();
        return {
          url,
          type: item.type ?? this.inferMediaType(url),
        };
      })
      .filter((item) => item.url.length > 0);
  }

  private inferMediaType(url: string): 'image' | 'video' {
    if (
      /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ||
      /youtube\.com|youtu\.be|vimeo\.com/i.test(url)
    ) {
      return 'video';
    }
    return 'image';
  }

  private normalizeEmiPlans(plans: CreateProductDto['emiPlans']): EmiPlan[] {
    return plans.map((plan, index) => ({
      id:
        plan.id?.trim() ||
        `emi-${plan.tenureMonths}m-${plan.interestRate}-${index}`,
      tenureMonths: plan.tenureMonths,
      interestRate: plan.interestRate,
      cashbackAmount: plan.cashbackAmount ?? 0,
      cashbackLabel: plan.cashbackLabel?.trim() || null,
      backingFund: plan.backingFund?.trim() || null,
    }));
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private clearListCache() {
    this.invalidateListCache();
  }

  private buildSearchFilter(term?: string) {
    if (!term) {
      return {};
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(escaped, 'i');
    return {
      $or: [
        { name: match },
        { brand: match },
        { category: match },
        { slug: match },
      ],
    };
  }
}
