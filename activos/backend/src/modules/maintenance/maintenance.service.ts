import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { MessagingService } from 'src/shared/messaging/messaging.service';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: MessagingService,
    private readonly audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.maintenance.findMany({
      include: {
        asset: { include: { assetType: true, location: true } },
        performedBy: true,
      },
    });
  }

  async create(dto: CreateMaintenanceDto) {
    const maintenance = await this.prisma.maintenance.create({
      data: {
        assetId: dto.assetId,
        scheduledAt: new Date(dto.scheduledAt),
        performedById: dto.performedById,
        notes: dto.notes,
      },
    });
    await this.audit.log({
      entity: 'Maintenance',
      entityId: maintenance.id,
      action: `Mantenimiento ${maintenance.status}`,
      changes: { scheduledAt: maintenance.scheduledAt },
      assetId: maintenance.assetId,
      performedById: maintenance.performedById,
    });
    await this.messaging.publish('maintenance.created', maintenance);
    return maintenance;
  }
}
