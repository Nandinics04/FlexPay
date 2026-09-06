import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  color: string;

  @IsString()
  @MinLength(1)
  storage: string;

  @IsString()
  @MinLength(1)
  planId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  redeemPoints?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  redeemCashback?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  quantity?: number;
}
