import { Body, Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDepreciationDto } from './dto/create-depreciation.dto';
import { DepreciationService } from './depreciation.service';

@Controller('depreciations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepreciationController {
  constructor(private readonly depreciationService: DepreciationService) {}

  @Post()
  @Roles('ADMIN', 'TI')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() dto: CreateDepreciationDto) {
    return this.depreciationService.create(dto);
  }

  @Get('asset/:assetId')
  listByAsset(@Param('assetId') assetId: string) {
    return this.depreciationService.findByAsset(assetId);
  }
}
