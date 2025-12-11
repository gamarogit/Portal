import { Injectable } from '@nestjs/common';
import { PrismaClient, Notification, NotificationType, NotificationPriority } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class NotificationsService {
    async create(data: {
        userId?: string;
        role?: string;
        type: NotificationType;
        title: string;
        message: string;
        priority: NotificationPriority;
        link?: string;
        sourceId?: string;
        sourceType?: string;
    }): Promise<Notification> {
        return prisma.notification.create({
            data,
        });
    }

    async findAll(userId: string, role?: string): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                OR: [
                    { userId },
                    { role: role || 'USER' }, // Default role if not provided
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async delete(id: string): Promise<Notification> {
        return prisma.notification.delete({
            where: { id },
        });
    }

    // Helpers for specific events
    async createFromAlert(alert: any): Promise<Notification> {
        return this.create({
            role: 'ADMIN', // Alerts go to admins by default
            type: NotificationType.ALERT,
            title: 'Alerta de Reabastecimiento',
            message: `El producto ${alert.product.name} (SKU: ${alert.product.sku}) ha alcanzado el punto de reorden. Stock actual: ${alert.currentStock}.`,
            priority: NotificationPriority.HIGH,
            link: '/inventory/reorder-alerts',
            sourceId: alert.id,
            sourceType: 'REORDER_ALERT',
        });
    }

    async createFromPurchaseOrder(po: any, event: 'CREATED' | 'SENT' | 'RECEIVED'): Promise<Notification> {
        let title = '';
        let message = '';
        let priority: NotificationPriority = NotificationPriority.MEDIUM;

        switch (event) {
            case 'CREATED':
                title = 'Nueva Orden de Compra';
                message = `Se ha creado la OC ${po.orderNumber} para ${po.supplier.name}.`;
                break;
            case 'SENT':
                title = 'Orden Enviada';
                message = `La OC ${po.orderNumber} ha sido marcada como enviada.`;
                break;
            case 'RECEIVED':
                title = 'Mercancía Recibida';
                message = `Se ha recibido la mercancía de la OC ${po.orderNumber}. Inventario actualizado.`;
                priority = NotificationPriority.HIGH;
                break;
        }

        return this.create({
            role: 'ADMIN',
            type: NotificationType.INFO,
            title,
            message,
            priority,
            link: `/inventory/purchase-orders`,
            sourceId: po.id,
            sourceType: 'PURCHASE_ORDER',
        });
    }
}
