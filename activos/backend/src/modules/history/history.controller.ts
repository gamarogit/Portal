import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { HistoryService } from './history.service';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('asset/:assetId')
  async getAssetHistory(@Param('assetId') assetId: string) {
    return this.historyService.getAssetHistory(assetId);
  }

  @Get('asset/:assetId/timeline')
  async getTimeline(@Param('assetId') assetId: string) {
    return this.historyService.getTimeline(assetId);
  }
}
