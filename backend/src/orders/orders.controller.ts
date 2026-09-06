import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

type AuthedRequest = Request & { user: PublicUser };

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Req() request: AuthedRequest) {
    return this.ordersService.list(request.user.id);
  }

  @Post()
  create(@Req() request: AuthedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(request.user.id, dto);
  }

  @Post(':id/cancel')
  cancel(@Req() request: AuthedRequest, @Param('id') id: string) {
    return this.ordersService.cancel(request.user.id, id);
  }
}
