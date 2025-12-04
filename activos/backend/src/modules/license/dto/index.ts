import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, IsDecimal, Min, Max } from 'class-validator';

export class CreateLicenseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vendor: string;

  @IsOptional()
  @IsString()
  licenseKey?: string;

  @IsDateString()
  purchaseDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsInt()
  @Min(1)
  totalSeats: number;

  @IsOptional()
  @IsDecimal()
  cost?: number;

  @IsOptional()
  @IsString()
  contractNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLicenseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalSeats?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignLicenseDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchLicensesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  expiringDays?: number;
}
