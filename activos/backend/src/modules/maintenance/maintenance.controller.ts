import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  list() {
    return this.maintenanceService.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  schedule(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }
}
