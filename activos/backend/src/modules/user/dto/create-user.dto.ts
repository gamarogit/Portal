import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsOptional, 
  MaxLength,
  IsUUID
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @IsOptional()
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  roleId?: string;
}
