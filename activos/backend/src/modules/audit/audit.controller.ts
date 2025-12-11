import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('asset/:assetId')
  byAsset(@Param('assetId') assetId: string) {
    return this.auditService.listByAsset(assetId);
  }
}
