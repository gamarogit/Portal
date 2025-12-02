import { Module } from '@nestjs/common';
import { MessagingModule } from 'src/shared/messaging/messaging.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { IntegrationScheduler } from './integration.scheduler';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [PrismaModule, MessagingModule, MetricsModule],
  providers: [IntegrationService, IntegrationScheduler],
  controllers: [IntegrationController],
  exports: [IntegrationService],
})
export class IntegrationModule {}
