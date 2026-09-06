import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

type AuthedRequest = Request & { user: PublicUser };

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@Req() request: AuthedRequest) {
    return this.wishlistService.list(request.user.id);
  }

  @Get('slugs')
  slugs(@Req() request: AuthedRequest) {
    return this.wishlistService.slugs(request.user.id).then((items) => ({
      slugs: items,
    }));
  }

  @Post(':slug')
  add(@Req() request: AuthedRequest, @Param('slug') slug: string) {
    return this.wishlistService.add(request.user.id, slug);
  }

  @Delete(':slug')
  remove(@Req() request: AuthedRequest, @Param('slug') slug: string) {
    return this.wishlistService.remove(request.user.id, slug);
  }
}
