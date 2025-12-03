import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export enum NotificationType {
  WARRANTY_EXPIRING = 'WARRANTY_EXPIRING',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
  MAINTENANCE_OVERDUE = 'MAINTENANCE_OVERDUE',
  ASSET_UNASSIGNED = 'ASSET_UNASSIGNED',
  LICENSE_EXPIRING = 'LICENSE_EXPIRING',
  DEPRECIATION_COMPLETE = 'DEPRECIATION_COMPLETE',
}

export interface Notification {
  id: string;
  type: NotificationType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  assetId?: string;
  assetName?: string;
  dueDate?: Date;
  daysRemaining?: number;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Obtiene todas las notificaciones activas
   */
  /**
   * Obtiene todas las notificaciones activas
   */
  async getActiveNotifications(user?: any): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const now = new Date();

    // Determinar si es admin
    const isAdmin = user?.roles?.some(r => r.toLowerCase().includes('admin')) || false;

    // Filtro de responsabilidad
    const whereResponsible = (!user || isAdmin) ? {} : { responsibleId: user.id };

    // 1. Garantías por vencer (próximos 30 días)
    const warrantyExpiring = await this.prisma.asset.findMany({
      where: {
        warrantyUntil: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        state: 'ACTIVO',
        ...whereResponsible,
      },
      select: {
        id: true,
        name: true,
        warrantyUntil: true,
      },
    });

    warrantyExpiring.forEach((asset) => {
      const daysRemaining = Math.ceil(
        (asset.warrantyUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      notifications.push({
        id: `warranty-${asset.id}`,
        type: NotificationType.WARRANTY_EXPIRING,
        severity: daysRemaining <= 7 ? 'critical' : 'warning',
        title: 'Garantía por vencer',
        message: `La garantía del activo "${asset.name}" vence en ${daysRemaining} días`,
        assetId: asset.id,
        assetName: asset.name,
        dueDate: asset.warrantyUntil!,
        daysRemaining,
        createdAt: now,
      });
    });

    // 2. Mantenimientos próximos (próximos 7 días)
    const maintenanceDue = await this.prisma.maintenance.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'PROGRAMADO',
        asset: whereResponsible,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    maintenanceDue.forEach((maintenance) => {
      const daysRemaining = Math.ceil(
        (maintenance.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      notifications.push({
        id: `maintenance-due-${maintenance.id}`,
        type: NotificationType.MAINTENANCE_DUE,
        severity: daysRemaining <= 1 ? 'critical' : 'info',
        title: 'Mantenimiento programado',
        message: `Mantenimiento del activo "${maintenance.asset.name}" programado en ${daysRemaining} días`,
        assetId: maintenance.asset.id,
        assetName: maintenance.asset.name,
        dueDate: maintenance.scheduledAt,
        daysRemaining,
        createdAt: now,
      });
    });

    // 3. Mantenimientos atrasados
    const maintenanceOverdue = await this.prisma.maintenance.findMany({
      where: {
        scheduledAt: {
          lt: now,
        },
        status: 'PROGRAMADO',
        asset: whereResponsible,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    maintenanceOverdue.forEach((maintenance) => {
      const daysOverdue = Math.ceil(
        (now.getTime() - maintenance.scheduledAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      notifications.push({
        id: `maintenance-overdue-${maintenance.id}`,
        type: NotificationType.MAINTENANCE_OVERDUE,
        severity: 'critical',
        title: 'Mantenimiento atrasado',
        message: `Mantenimiento del activo "${maintenance.asset.name}" está atrasado por ${daysOverdue} días`,
        assetId: maintenance.asset.id,
        assetName: maintenance.asset.name,
        dueDate: maintenance.scheduledAt,
        daysRemaining: -daysOverdue,
        createdAt: now,
      });
    });

    // 4. Activos sin responsable por más de 60 días (Solo admins)
    if (!user || isAdmin) {
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const unassignedAssets = await this.prisma.asset.findMany({
        where: {
          responsibleId: null,
          state: 'ACTIVO',
          createdAt: {
            lt: sixtyDaysAgo,
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });

      unassignedAssets.forEach((asset) => {
        const daysUnassigned = Math.ceil(
          (now.getTime() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        notifications.push({
          id: `unassigned-${asset.id}`,
          type: NotificationType.ASSET_UNASSIGNED,
          severity: 'warning',
          title: 'Activo sin responsable',
          message: `El activo "${asset.name}" lleva ${daysUnassigned} días sin responsable asignado`,
          assetId: asset.id,
          assetName: asset.name,
          createdAt: now,
        });
      });
    }

    // Ordenar por severidad y fecha
    return notifications.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Obtiene resumen de notificaciones por tipo
   */
  async getNotificationsSummary() {
    const notifications = await this.getActiveNotifications();

    const summary = {
      total: notifications.length,
      critical: notifications.filter((n) => n.severity === 'critical').length,
      warning: notifications.filter((n) => n.severity === 'warning').length,
      info: notifications.filter((n) => n.severity === 'info').length,
      byType: {} as Record<NotificationType, number>,
    };

    Object.values(NotificationType).forEach((type) => {
      summary.byType[type] = notifications.filter((n) => n.type === type).length;
    });

    return summary;
  }

  /**
   * Job programado para verificar y enviar notificaciones
   */
  async checkAndNotify() {
    this.logger.log('Ejecutando verificación de notificaciones...');
    const notifications = await this.getActiveNotifications();

    const criticalCount = notifications.filter((n) => n.severity === 'critical').length;
    if (criticalCount > 0) {
      this.logger.warn(`Se encontraron ${criticalCount} notificaciones críticas`);
      // Aquí se integraría envío de email/Slack/webhook
    }

    this.logger.log(`Total de notificaciones activas: ${notifications.length}`);
    return notifications;
  }
}
