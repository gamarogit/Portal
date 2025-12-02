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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardData() {
        const now = new Date();
        const [totalAssets, assetsByState, assetsByLocation, assetsByType, totalValue, depreciatedValue, warrantyExpiring, maintenanceOverdue, unassignedAssets,] = await Promise.all([
            this.prisma.asset.count(),
            this.prisma.asset.groupBy({
                by: ['state'],
                _count: true,
            }),
            this.prisma.asset.groupBy({
                by: ['locationId'],
                _count: true,
            }),
            this.prisma.asset.groupBy({
                by: ['assetTypeId'],
                _count: true,
            }),
            this.prisma.asset.aggregate({
                _sum: {
                    cost: true,
                },
            }),
            this.prisma.depreciation.aggregate({
                _sum: {
                    amount: true,
                },
            }),
            this.prisma.asset.count({
                where: {
                    warrantyUntil: {
                        gte: now,
                        lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            this.prisma.maintenance.count({
                where: {
                    scheduledAt: {
                        lt: now,
                    },
                    status: 'PROGRAMADO',
                },
            }),
            this.prisma.asset.count({
                where: {
                    responsibleId: null,
                    state: 'ACTIVO',
                },
            }),
        ]);
        const locations = await this.prisma.location.findMany({
            select: { id: true, name: true },
        });
        const assetTypes = await this.prisma.assetType.findMany({
            select: { id: true, name: true },
        });
        const locationMap = Object.fromEntries(locations.map((l) => [l.id, l.name]));
        const typeMap = Object.fromEntries(assetTypes.map((t) => [t.id, t.name]));
        return {
            summary: {
                totalAssets,
                totalValue: totalValue._sum.cost ? Number(totalValue._sum.cost) : 0,
                depreciatedValue: depreciatedValue._sum.amount ? Number(depreciatedValue._sum.amount) : 0,
                currentValue: totalValue._sum.cost && depreciatedValue._sum.amount
                    ? Number(totalValue._sum.cost) - Number(depreciatedValue._sum.amount)
                    : Number(totalValue._sum.cost) || 0,
            },
            byState: assetsByState.reduce((acc, item) => {
                acc[item.state] = item._count;
                return acc;
            }, {}),
            byLocation: assetsByLocation.map((item) => ({
                locationId: item.locationId,
                locationName: item.locationId ? locationMap[item.locationId] || 'Sin ubicación' : 'Sin ubicación',
                count: item._count,
            })),
            byType: assetsByType.map((item) => ({
                typeId: item.assetTypeId,
                typeName: item.assetTypeId ? typeMap[item.assetTypeId] || 'Sin tipo' : 'Sin tipo',
                count: item._count,
            })),
            alerts: {
                warrantyExpiring: {
                    count: warrantyExpiring,
                    severity: warrantyExpiring > 5 ? 'warning' : 'info',
                    message: `${warrantyExpiring} activos con garantía por vencer en 30 días`,
                },
                maintenanceOverdue: {
                    count: maintenanceOverdue,
                    severity: maintenanceOverdue > 0 ? 'critical' : 'info',
                    message: `${maintenanceOverdue} mantenimientos atrasados`,
                },
                unassignedAssets: {
                    count: unassignedAssets,
                    severity: unassignedAssets > 10 ? 'warning' : 'info',
                    message: `${unassignedAssets} activos sin responsable asignado`,
                },
            },
            compliance: {
                warranties: {
                    total: totalAssets,
                    withWarranty: totalAssets - warrantyExpiring,
                    expired: 0,
                    complianceRate: totalAssets > 0 ? Math.round(((totalAssets - warrantyExpiring) / totalAssets) * 100) : 0,
                },
            },
        };
    }
    async getChartsData() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const assetsByMonth = await this.prisma.asset.groupBy({
            by: ['createdAt'],
            _count: true,
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
        });
        return {
            assetsCreatedByMonth: assetsByMonth,
            message: 'Gráficos de tendencias disponibles',
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
