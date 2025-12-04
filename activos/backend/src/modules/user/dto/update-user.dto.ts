import { 
  IsOptional, 
  IsString, 
  IsEmail, 
  IsUUID,
  MaxLength 
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  roleId?: string | null;
}
