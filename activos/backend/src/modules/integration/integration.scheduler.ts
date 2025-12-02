import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Injectable()
export class IntegrationScheduler implements OnModuleInit, OnModuleDestroy {
  private interval?: NodeJS.Timeout;
  private readonly logger = new Logger(IntegrationScheduler.name);

  constructor(private readonly integration: IntegrationService) {}

  async onModuleInit() {
    this.interval = setInterval(() => this.runCycle(), 60_000);
    await this.runCycle();
  }

  async onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async runCycle() {
    const events = await this.integration.dispatchPending(20);
    if (events.length) {
      this.logger.log(`Despachados ${events.length} eventos de integración`);
    }
  }
}
