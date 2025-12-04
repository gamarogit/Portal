import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagingService } from 'src/shared/messaging/messaging.service';
import { MetricsService } from '../metrics/metrics.service';

export type NewIntegrationEvent = {
  source: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class IntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: MessagingService,
    private readonly metrics: MetricsService,
  ) {}

  async emit(event: NewIntegrationEvent) {
    const record = await this.prisma.integrationEvent.create({
      data: {
        source: event.source,
        payload: event.payload as Prisma.InputJsonValue,
      },
    });
    this.metrics.incrementEmitted();
    await this.messaging.publish('integration.event', { eventId: record.id, source: record.source });
    return record;
  }

  async dispatchPending(limit = 10) {
    const pending = await this.prisma.integrationEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    const start = Date.now();
    await Promise.all(pending.map((item) => this.tryDispatch(item)));
    this.metrics.observeDispatchDuration(Date.now() - start);
    return pending;
  }

  async list(status?: string) {
    return this.prisma.integrationEvent.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async tryDispatch(event: Prisma.IntegrationEventGetPayload<{}>) {
    const targets = this.getTargetEndpoints();
    if (!targets.length) {
      await this.markAsSuccess(event.id);
      return;
    }
    let success = false;
    const body = JSON.stringify({ source: event.source, payload: event.payload });
    for (const target of targets) {
      try {
        await fetch(target, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
        });
        success = true;
      } catch (error) {
        // continue to try other endpoints but mark as failure if none succeed
      }
    }
    await this.prisma.integrationEvent.update({
      where: { id: event.id },
      data: {
        status: success ? 'SENT' : 'FAILED',
        lastAttemptedAt: new Date(),
      },
    });
    if (success) {
      this.metrics.incrementSent();
    } else {
      this.metrics.incrementFailed();
    }
  }

  private async markAsSuccess(id: string) {
    await this.prisma.integrationEvent.update({
      where: { id },
      data: { status: 'SENT', lastAttemptedAt: new Date() },
    });
  }

  private getTargetEndpoints(): string[] {
    const candidates = [
      process.env.ERP_ENDPOINT,
      process.env.CMDB_ENDPOINT,
    ];
    return candidates.filter(Boolean) as string[];
  }
}
