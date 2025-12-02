import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SearchAssetsDto } from './dto/search-assets.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  findAll(@Query() query: SearchAssetsDto) {
    // Si hay parámetros de búsqueda, usar search, sino findAll básico
    if (Object.keys(query).length > 0) {
      return this.assetService.search(query);
    }
    return this.assetService.findAll();
  }

  @Get('search')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  search(@Query() dto: SearchAssetsDto) {
    return this.assetService.search(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  create(@Body() dto: CreateAssetDto) {
    return this.assetService.create(dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetService.update(id, dto);
  }
}
