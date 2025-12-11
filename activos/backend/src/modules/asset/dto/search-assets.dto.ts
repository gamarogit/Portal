import { IsOptional, IsString, IsInt, Min, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchAssetsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ACTIVO', 'MANTENIMIENTO', 'DADO_DE_BAJA', 'TRANSFERIDO', 'CUARENTENA'])
  state?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  assetTypeId?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCost?: number;

  @IsOptional()
  @IsDateString()
  purchasedAfter?: string;

  @IsOptional()
  @IsDateString()
  purchasedBefore?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warrantyExpiringDays?: number; // Garantía vence en X días

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
