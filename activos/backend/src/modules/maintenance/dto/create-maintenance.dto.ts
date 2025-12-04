import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateMaintenanceDto {
  @IsUUID()
  assetId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsUUID()
  performedById?: string;

  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
