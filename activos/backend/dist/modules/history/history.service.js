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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let HistoryService = class HistoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAssetHistory(assetId) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: assetId },
            include: {
                assetType: true,
                location: true,
                responsible: true,
            },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Activo ${assetId} no encontrado`);
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
                code: asset.code || asset.serialNumber || asset.id.substring(0, 8),
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
                    status: m.status || 'COMPLETADO',
                    reason: m.reason || m.notes,
                })),
                maintenances: maintenances.map((m) => ({
                    id: m.id,
                    type: m.maintenanceType || 'PREVENTIVO',
                    scheduledDate: m.scheduledAt,
                    completedDate: m.completedAt || m.executedAt,
                    status: m.status,
                    description: m.description || m.notes,
                    cost: m.cost ? Number(m.cost) : null,
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
                    accumulatedDepreciation: 0,
                    currentValue: 0,
                })),
            },
        };
    }
    async getTimeline(assetId) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Activo ${assetId} no encontrado`);
        }
        const timeline = [];
        timeline.push({
            date: asset.createdAt,
            type: 'creation',
            title: 'Activo creado',
            description: `Activo ${asset.name} registrado en el sistema`,
            details: {
                code: asset.code || asset.serialNumber || 'N/A',
                serialNumber: asset.serialNumber,
                cost: asset.cost ? Number(asset.cost) : 0,
            },
        });
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
                description: m.reason || m.notes || `De ${m.fromLocation?.name} a ${m.toLocation?.name}`,
                details: {
                    status: m.status || 'COMPLETADO',
                    from: m.fromLocation?.name,
                    to: m.toLocation?.name,
                },
                performedBy: m.requestedBy?.name,
            });
        }
        const maintenances = await this.prisma.maintenance.findMany({
            where: { assetId },
            include: {
                performedBy: true,
            },
        });
        for (const m of maintenances) {
            timeline.push({
                date: m.completedAt || m.executedAt || m.scheduledAt,
                type: 'maintenance',
                title: `Mantenimiento ${m.maintenanceType || 'PREVENTIVO'}`,
                description: m.description || m.notes || 'Sin descripción',
                details: {
                    status: m.status,
                    cost: m.cost ? Number(m.cost) : null,
                },
                performedBy: m.performedBy?.name,
            });
        }
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
                    accumulated: 0,
                    currentValue: 0,
                },
            });
        }
        return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HistoryService);
