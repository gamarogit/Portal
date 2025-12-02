import { IsDateString, IsDecimal, IsNotEmpty, IsUUID, IsPositive, IsString } from 'class-validator';

export class CreateDepreciationDto {
  @IsUUID()
  assetId: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  method: string;
}
