import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const HALF_RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export class CreateReviewDto {
  @Type(() => Number)
  @IsNumber()
  @IsIn(HALF_RATINGS)
  rating: number;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  comment: string;
}
