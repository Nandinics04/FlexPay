import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import {
  ProductListItem,
  ProductsService,
} from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async list(userId: string): Promise<ProductListItem[]> {
    const slugs = await this.slugs(userId);
    return this.productsService.findBySlugs(slugs);
  }

  async slugs(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).select('wishlist').lean();
    return user?.wishlist ?? [];
  }

  async add(userId: string, slug: string): Promise<{ slugs: string[] }> {
    const exists = await this.productsService.existsBySlug(slug);
    if (!exists) {
      throw new NotFoundException(`Product '${slug}' was not found`);
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { wishlist: slug } },
    );
    return { slugs: await this.slugs(userId) };
  }

  async remove(userId: string, slug: string): Promise<{ slugs: string[] }> {
    await this.userModel.updateOne({ _id: userId }, { $pull: { wishlist: slug } });
    return { slugs: await this.slugs(userId) };
  }
}
