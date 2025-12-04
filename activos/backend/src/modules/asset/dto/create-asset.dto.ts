import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsString,
  Min,
  MaxLength,
  IsPositive,
  IsDateString
} from 'class-validator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @IsOptional()
  @IsUUID('4', { message: 'assetTypeId debe ser un UUID válido' })
  assetTypeId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'locationId debe ser un UUID válido' })
  locationId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'responsibleId debe ser un UUID válido' })
  responsibleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El número de serie no puede exceder 100 caracteres' })
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El fabricante no puede exceder 100 caracteres' })
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El modelo no puede exceder 100 caracteres' })
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El sistema operativo no puede exceder 100 caracteres' })
  operatingSystem?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser un número' })
  @IsPositive({ message: 'El costo debe ser mayor a cero' })
  @Min(0.01, { message: 'El costo mínimo es 0.01' })
  cost?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de compra debe ser una fecha válida' })
  purchaseDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de garantía debe ser una fecha válida' })
  warrantyUntil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notes?: string;

  @IsOptional()
  specs?: any;
}

