import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('configuration')
@UseGuards(JwtAuthGuard)
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @Get('forms')
  listForms() {
    return this.configService.listAvailableForms();
  }

  @Get('form-schema')
  getFormSchema(@Query('form') formName: string) {
    return this.configService.getFormSchema(formName);
  }

  @Post('form-schema')
  updateFormSchema(@Body() body: { formName: string; schema: any }) {
    return this.configService.updateFormSchema(body.formName, body.schema);
  }
}
