import { IsOptional, IsString } from 'class-validator';

export class CreateAttachmentDto {
  @IsOptional()
  @IsString()
  description?: string;
}
