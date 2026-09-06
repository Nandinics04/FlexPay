import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^[6-9]\d{9}$/, {
    message: 'Phone must be a 10-digit Indian mobile number',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^\d{6}$/, { message: 'Pincode must be 6 digits' })
  pincode?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  @Matches(/^$|^[A-Z]{5}[0-9]{4}[A-Z]$/i, {
    message: 'PAN must look like ABCDE1234F',
  })
  pan?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^\d{12}$/, { message: 'Aadhaar must be 12 digits' })
  aadhaar?: string;
}
