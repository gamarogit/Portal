import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @IsUUID()
  assetId: string;

  @IsEnum(MovementType)
  movementType: MovementType;

  @IsOptional()
  @IsUUID()
  fromLocationId?: string;

  @IsOptional()
  @IsUUID()
  toLocationId?: string;

  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
