import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { calculateMonthlyAmount } from '../common/emi.util';
import { EmiPlan, Product, ProductDocument, Variant } from './schemas/product.schema';

export type ProductListItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  startingPrice: number;
  mrp: number;
  imageUrl: string;
};

export type EmiPlanResponse = EmiPlan & { monthlyAmount: number };

export type ProductDetail = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  variants: Variant[];
  emiPlans: EmiPlanResponse[];
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(query?: string): Promise<ProductListItem[]> {
    const filter = this.buildSearchFilter(query);
    const products = await this.productModel.find(filter).sort({ name: 1 }).lean();
    return products.map((product) => {
      const cheapest = [...product.variants].sort(
        (a, b) => a.sellingPrice - b.sellingPrice,
      )[0];
      return {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        startingPrice: cheapest?.sellingPrice ?? 0,
        mrp: cheapest?.mrp ?? 0,
        imageUrl: cheapest?.imageUrl ?? '',
      };
    });
  }

  async findBySlug(slug: string, sku?: string): Promise<ProductDetail> {
    const product = await this.productModel.findOne({ slug }).lean();
    if (!product) {
      throw new NotFoundException(`Product '${slug}' was not found`);
    }

    const selectedVariant =
      product.variants.find((variant) => variant.sku === sku) ??
      product.variants[0];

    return {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      highlights: product.highlights,
      variants: product.variants,
      emiPlans: product.emiPlans.map((plan) => ({
        ...plan,
        monthlyAmount: calculateMonthlyAmount(
          selectedVariant?.sellingPrice ?? 0,
          plan.interestRate,
          plan.tenureMonths,
        ),
      })),
    };
  }

  private buildSearchFilter(query?: string) {
    const term = query?.trim();
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
        { description: match },
        { slug: match },
      ],
    };
  }
}
