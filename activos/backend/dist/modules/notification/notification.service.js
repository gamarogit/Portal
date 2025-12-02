"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.NotificationType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
var NotificationType;
(function (NotificationType) {
    NotificationType["WARRANTY_EXPIRING"] = "WARRANTY_EXPIRING";
    NotificationType["MAINTENANCE_DUE"] = "MAINTENANCE_DUE";
    NotificationType["MAINTENANCE_OVERDUE"] = "MAINTENANCE_OVERDUE";
    NotificationType["ASSET_UNASSIGNED"] = "ASSET_UNASSIGNED";
    NotificationType["LICENSE_EXPIRING"] = "LICENSE_EXPIRING";
    NotificationType["DEPRECIATION_COMPLETE"] = "DEPRECIATION_COMPLETE";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async getActiveNotifications() {
        const notifications = [];
        const now = new Date();
        const warrantyExpiring = await this.prisma.asset.findMany({
            where: {
                warrantyUntil: {
                    gte: now,
                    lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                },
                state: 'ACTIVO',
            },
            select: {
                id: true,
                name: true,
                warrantyUntil: true,
            },
        });
        warrantyExpiring.forEach((asset) => {
            const daysRemaining = Math.ceil((asset.warrantyUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            notifications.push({
                id: `warranty-${asset.id}`,
                type: NotificationType.WARRANTY_EXPIRING,
                severity: daysRemaining <= 7 ? 'critical' : 'warning',
                title: 'Garantía por vencer',
                message: `La garantía del activo "${asset.name}" vence en ${daysRemaining} días`,
                assetId: asset.id,
                assetName: asset.name,
                dueDate: asset.warrantyUntil,
                daysRemaining,
                createdAt: now,
            });
        });
        const maintenanceDue = await this.prisma.maintenance.findMany({
            where: {
                scheduledAt: {
                    gte: now,
                    lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
                status: 'PROGRAMADO',
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
            const daysRemaining = Math.ceil((maintenance.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
        const maintenanceOverdue = await this.prisma.maintenance.findMany({
            where: {
                scheduledAt: {
                    lt: now,
                },
                status: 'PROGRAMADO',
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
            const daysOverdue = Math.ceil((now.getTime() - maintenance.scheduledAt.getTime()) / (1000 * 60 * 60 * 24));
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
            const daysUnassigned = Math.ceil((now.getTime() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24));
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
        return notifications.sort((a, b) => {
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    async getNotificationsSummary() {
        const notifications = await this.getActiveNotifications();
        const summary = {
            total: notifications.length,
            critical: notifications.filter((n) => n.severity === 'critical').length,
            warning: notifications.filter((n) => n.severity === 'warning').length,
            info: notifications.filter((n) => n.severity === 'info').length,
            byType: {},
        };
        Object.values(NotificationType).forEach((type) => {
            summary.byType[type] = notifications.filter((n) => n.type === type).length;
        });
        return summary;
    }
    async checkAndNotify() {
        this.logger.log('Ejecutando verificación de notificaciones...');
        const notifications = await this.getActiveNotifications();
        const criticalCount = notifications.filter((n) => n.severity === 'critical').length;
        if (criticalCount > 0) {
            this.logger.warn(`Se encontraron ${criticalCount} notificaciones críticas`);
        }
        this.logger.log(`Total de notificaciones activas: ${notifications.length}`);
        return notifications;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
