import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductMediaDto {
  @IsOptional()
  @IsIn(['image', 'video'])
  type?: 'image' | 'video';

  @IsString()
  @MinLength(1)
  url: string;
}

export class VariantDto {
  @IsString()
  sku: string;

  @IsString()
  color: string;

  @IsString()
  storage: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mrp: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsString()
  imageUrl: string;
}

export class EmiPlanDto {
  @IsOptional()
  @IsString()
  id?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tenureMonths: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  interestRate: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cashbackAmount?: number;

  @IsOptional()
  @IsString()
  cashbackLabel?: string | null;

  @IsOptional()
  @IsString()
  backingFund?: string | null;
}

export class CreateProductDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(1)
  brand: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsString()
  @MinLength(2)
  description: string;

  @IsArray()
  @IsString({ each: true })
  highlights: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media?: ProductMediaDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmiPlanDto)
  emiPlans: EmiPlanDto[];
}
