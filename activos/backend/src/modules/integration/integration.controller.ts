import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IntegrationService, NewIntegrationEvent } from './integration.service';

@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integration: IntegrationService) {}

  @Post('event')
  send(@Body() event: NewIntegrationEvent) {
    return this.integration.emit(event);
  }

  @Post('dispatch')
  dispatch(@Query('limit') limit?: string) {
    return this.integration.dispatchPending(limit ? Number(limit) : undefined);
  }

  @Get('events')
  list(@Query('status') status?: string) {
    return this.integration.list(status);
  }
}
