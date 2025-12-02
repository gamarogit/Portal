import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { LicenseService } from './license.service';
import { CreateLicenseDto, UpdateLicenseDto, AssignLicenseDto, SearchLicensesDto } from './dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('licenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  search(@Query() dto: SearchLicensesDto) {
    return this.licenseService.search(dto);
  }

  @Get('compliance')
  getCompliance() {
    return this.licenseService.getComplianceReport();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  create(@Body() dto: CreateLicenseDto) {
    return this.licenseService.create(dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.licenseService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.licenseService.remove(id);
  }

  @Post(':id/assign')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Roles('ADMIN', 'TI')
  assign(@Param('id') id: string, @Body() dto: AssignLicenseDto) {
    return this.licenseService.assignLicense(id, dto);
  }

  @Delete('assignments/:assignmentId')
  @Roles('ADMIN', 'TI')
  unassign(@Param('assignmentId') assignmentId: string) {
    return this.licenseService.unassignLicense(assignmentId);
  }
}
