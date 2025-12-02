import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    const now = new Date();

    // Ejecutar todas las consultas en paralelo
    const [
      totalAssets,
      assetsByState,
      assetsByLocation,
      assetsByType,
      totalValue,
      depreciatedValue,
      warrantyExpiring,
      maintenanceOverdue,
      unassignedAssets,
    ] = await Promise.all([
      // Total de activos
      this.prisma.asset.count(),

      // Por estado
      this.prisma.asset.groupBy({
        by: ['state'],
        _count: true,
      }),

      // Por ubicación
      this.prisma.asset.groupBy({
        by: ['locationId'],
        _count: true,
      }),

      // Por tipo
      this.prisma.asset.groupBy({
        by: ['assetTypeId'],
        _count: true,
      }),

      // Valor total de activos
      this.prisma.asset.aggregate({
        _sum: {
          cost: true,
        },
      }),

      // Valor depreciado (simplificado - necesita cálculo real)
      this.prisma.depreciation.aggregate({
        _sum: {
          amount: true,
        },
      }),

      // Garantías por vencer (30 días)
      this.prisma.asset.count({
        where: {
          warrantyUntil: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Mantenimientos atrasados
      this.prisma.maintenance.count({
        where: {
          scheduledAt: {
            lt: now,
          },
          status: 'PROGRAMADO',
        },
      }),

      // Activos sin responsable
      this.prisma.asset.count({
        where: {
          responsibleId: null,
          state: 'ACTIVO',
        },
      }),
    ]);

    // Obtener nombres de ubicaciones y tipos
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
      }, {} as Record<string, number>),
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
          withWarranty: totalAssets - warrantyExpiring, // Simplificado
          expired: 0, // Calcular con query adicional si needed
          complianceRate: totalAssets > 0 ? Math.round(((totalAssets - warrantyExpiring) / totalAssets) * 100) : 0,
        },
      },
    };
  }

  async getChartsData() {
    // Datos para gráficos de tendencias
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
}
