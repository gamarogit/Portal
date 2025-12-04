import { Body, Controller, Get, Post, Patch, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MovementService } from './movement.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Get()
  list() {
    return this.movementService.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  create(@Body() dto: CreateMovementDto) {
    return this.movementService.create(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'TI')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.movementService.updateStatus(id, body.status);
  }
}
