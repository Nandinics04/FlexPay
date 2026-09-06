import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { calculateMonthlyAmount } from '../common/emi.util';
import {
  maxRedeemablePoints,
  pointsEarned,
  redeemDiscount,
} from '../common/points.util';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.authService.findById(userId);
    if (!user) {
      throw new BadRequestException('Account not found');
    }

    if (
      !user.phone ||
      !user.address ||
      !user.pincode ||
      !user.pan ||
      !user.aadhaar
    ) {
      throw new BadRequestException(
        'Complete your phone, address, PAN and Aadhaar before payment',
      );
    }

    const product = await this.productsService.findBySlug(dto.slug);
    const variant =
      product.variants.find(
        (item) => item.color === dto.color && item.storage === dto.storage,
      ) ?? product.variants[0];
    const plan = product.emiPlans.find((item) => item.id === dto.planId);
    if (!variant || !plan) {
      throw new BadRequestException('Selected plan or variant is not available');
    }

    const quantity = Math.min(10, Math.max(1, dto.quantity ?? 1));
    const sellingPrice = variant.sellingPrice * quantity;
    const cashbackEarned = (plan.cashbackAmount ?? 0) * quantity;
    const cashbackRedeemed = Math.min(
      Math.max(0, dto.redeemCashback ?? 0),
      user.cashbackBalance ?? 0,
      sellingPrice,
    );
    const afterCashback = sellingPrice - cashbackRedeemed;
    const availablePoints = user.creditPoints ?? 0;
    const pointsRedeemed = Math.min(
      Math.max(0, dto.redeemPoints ?? 0),
      maxRedeemablePoints(availablePoints, afterCashback),
    );
    const payableAmount = Math.max(
      0,
      afterCashback - redeemDiscount(pointsRedeemed),
    );
    const monthlyAmount = calculateMonthlyAmount(
      payableAmount,
      plan.interestRate,
      plan.tenureMonths,
    );
    const creditPointsEarned = pointsEarned(payableAmount);

    const order = await this.orderModel.create({
      userId,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: variant.imageUrl,
      color: variant.color,
      storage: variant.storage,
      sku: variant.sku,
      quantity,
      sellingPrice,
      payableAmount,
      pointsRedeemed,
      planId: plan.id,
      tenureMonths: plan.tenureMonths,
      interestRate: plan.interestRate,
      monthlyAmount,
      cashbackAmount: cashbackEarned,
      cashbackRedeemed,
      creditPointsEarned,
      customerName: user.name,
      customerEmail: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city ?? '',
      state: user.state ?? '',
      pincode: user.pincode,
      status: 'paid',
    });

    const updatedUser = await this.authService.adjustRewards(userId, {
      creditPoints: creditPointsEarned - pointsRedeemed,
      cashbackBalance: cashbackEarned - cashbackRedeemed,
    });

    return {
      order: this.toResponse(order),
      user: updatedUser,
    };
  }

  async list(userId: string) {
    const orders = await this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return orders.map((order) => this.toResponse(order));
  }

  async cancel(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.orderModel.findOne({ _id: orderId, userId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === 'cancelled') {
      throw new BadRequestException('This order is already cancelled');
    }
    if (order.status !== 'paid') {
      throw new BadRequestException('This order can no longer be cancelled');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    const updatedUser = await this.authService.adjustRewards(userId, {
      creditPoints:
        (order.pointsRedeemed ?? 0) - (order.creditPointsEarned ?? 0),
      cashbackBalance:
        (order.cashbackRedeemed ?? 0) - (order.cashbackAmount ?? 0),
    });

    return {
      order: this.toResponse(order),
      user: updatedUser,
    };
  }

  private toResponse(order: {
    _id?: unknown;
    productSlug: string;
    productName: string;
    imageUrl: string;
    color: string;
    storage: string;
    sku: string;
    quantity?: number;
    sellingPrice: number;
    payableAmount?: number;
    pointsRedeemed?: number;
    tenureMonths: number;
    interestRate: number;
    monthlyAmount: number;
    cashbackAmount: number;
    cashbackRedeemed?: number;
    creditPointsEarned: number;
    customerName: string;
    customerEmail: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: string;
    cancelledAt?: Date;
    createdAt?: Date;
  }) {
    return {
      id: String(order._id),
      productSlug: order.productSlug,
      productName: order.productName,
      imageUrl: order.imageUrl,
      color: order.color,
      storage: order.storage,
      sku: order.sku,
      quantity: order.quantity ?? 1,
      sellingPrice: order.sellingPrice,
      payableAmount: order.payableAmount ?? order.sellingPrice,
      pointsRedeemed: order.pointsRedeemed ?? 0,
      tenureMonths: order.tenureMonths,
      interestRate: order.interestRate,
      monthlyAmount: order.monthlyAmount,
      cashbackAmount: order.cashbackAmount,
      cashbackRedeemed: order.cashbackRedeemed ?? 0,
      creditPointsEarned: order.creditPointsEarned,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      status: order.status,
      cancelledAt: order.cancelledAt ?? null,
      createdAt: order.createdAt ?? new Date(),
    };
  }
}
