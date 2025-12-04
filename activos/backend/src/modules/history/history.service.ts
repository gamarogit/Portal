import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface TimelineEvent {
  date: Date;
  type: 'creation' | 'movement' | 'maintenance' | 'audit' | 'depreciation';
  title: string;
  description: string;
  details: any;
  performedBy?: string;
}

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssetHistory(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        assetType: true,
        location: true,
        responsible: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Activo ${assetId} no encontrado`);
    }

    const [movements, maintenances, audits, depreciations] = await Promise.all([
      this.prisma.movement.findMany({
        where: { assetId },
        include: {
          fromLocation: true,
          toLocation: true,
          requestedBy: true,
          approvedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenance.findMany({
        where: { assetId },
        include: {
          performedBy: true,
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.auditLog.findMany({
        where: {
          entity: 'ASSET',
          entityId: assetId,
        },
        include: {
          performedBy: true,
        },
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.depreciation.findMany({
        where: { assetId },
        orderBy: { periodEnd: 'desc' },
      }),
    ]);

    return {
      asset: {
        id: asset.id,
        code: (asset as any).code || asset.serialNumber || asset.id.substring(0, 8),
        name: asset.name,
        state: asset.state,
        type: asset.assetType?.name,
        location: asset.location?.name,
        responsible: asset.responsible?.name,
      },
      history: {
        movements: movements.map((m) => ({
          id: m.id,
          type: m.movementType,
          date: m.createdAt,
          from: m.fromLocation?.name,
          to: m.toLocation?.name,
          requestedBy: m.requestedBy?.name,
          approvedBy: m.approvedBy?.name,
          status: (m as any).status || 'COMPLETADO',
          reason: (m as any).reason || m.notes,
        })),
        maintenances: maintenances.map((m) => ({
          id: m.id,
          type: (m as any).maintenanceType || 'PREVENTIVO',
          scheduledDate: m.scheduledAt,
          completedDate: (m as any).completedAt || m.executedAt,
          status: m.status,
          description: (m as any).description || m.notes,
          cost: (m as any).cost ? Number((m as any).cost) : null,
          performedBy: m.performedBy?.name,
        })),
        audits: audits.map((a) => ({
          id: a.id,
          action: a.action,
          date: a.occurredAt,
          performedBy: a.performedBy?.name,
          changes: a.changes,
        })),
        depreciations: depreciations.map((d) => ({
          id: d.id,
          date: d.periodEnd,
          amount: Number(d.amount),
          accumulatedDepreciation: 0, // Calcular si es necesario
          currentValue: 0, // Calcular si es necesario
        })),
      },
    };
  }

  async getTimeline(assetId: string): Promise<TimelineEvent[]> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Activo ${assetId} no encontrado`);
    }

    const timeline: TimelineEvent[] = [];

    // Evento de creación
    timeline.push({
      date: asset.createdAt,
      type: 'creation',
      title: 'Activo creado',
      description: `Activo ${asset.name} registrado en el sistema`,
      details: {
        code: (asset as any).code || asset.serialNumber || 'N/A',
        serialNumber: asset.serialNumber,
        cost: asset.cost ? Number(asset.cost) : 0,
      },
    });

    // Movimientos
    const movements = await this.prisma.movement.findMany({
      where: { assetId },
      include: {
        fromLocation: true,
        toLocation: true,
        requestedBy: true,
      },
    });

    for (const m of movements) {
      timeline.push({
        date: m.createdAt,
        type: 'movement',
        title: `Movimiento: ${m.movementType}`,
        description: (m as any).reason || m.notes || `De ${m.fromLocation?.name} a ${m.toLocation?.name}`,
        details: {
          status: (m as any).status || 'COMPLETADO',
          from: m.fromLocation?.name,
          to: m.toLocation?.name,
        },
        performedBy: m.requestedBy?.name,
      });
    }

    // Mantenimientos
    const maintenances = await this.prisma.maintenance.findMany({
      where: { assetId },
      include: {
        performedBy: true,
      },
    });

    for (const m of maintenances) {
      timeline.push({
        date: (m as any).completedAt || m.executedAt || m.scheduledAt,
        type: 'maintenance',
        title: `Mantenimiento ${(m as any).maintenanceType || 'PREVENTIVO'}`,
        description: (m as any).description || m.notes || 'Sin descripción',
        details: {
          status: m.status,
          cost: (m as any).cost ? Number((m as any).cost) : null,
        },
        performedBy: m.performedBy?.name,
      });
    }

    // Auditorías
    const audits = await this.prisma.auditLog.findMany({
      where: {
        entity: 'ASSET',
        entityId: assetId,
      },
      include: {
        performedBy: true,
      },
    });

    for (const a of audits) {
      timeline.push({
        date: a.occurredAt,
        type: 'audit',
        title: `Auditoría: ${a.action}`,
        description: `Cambios registrados en el activo`,
        details: a.changes,
        performedBy: a.performedBy?.name,
      });
    }

    // Depreciaciones
    const depreciations = await this.prisma.depreciation.findMany({
      where: { assetId },
    });

    for (const d of depreciations) {
      timeline.push({
        date: d.periodEnd,
        type: 'depreciation',
        title: 'Depreciación calculada',
        description: `Valor depreciado: $${Number(d.amount).toFixed(2)}`,
        details: {
          accumulated: 0, // Calcular si es necesario
          currentValue: 0, // Calcular si es necesario
        },
      });
    }

    // Ordenar por fecha descendente
    return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
