import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EmiPlanDto, ProductMediaDto, VariantDto } from './create-product.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  brand?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media?: ProductMediaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmiPlanDto)
  emiPlans?: EmiPlanDto[];
}
